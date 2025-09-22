import { ethers } from 'ethers';
import { db } from '../config/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Railway Server Configuration
const RELAYER_ENDPOINT = (import.meta as { env?: { VITE_RELAYER_URL?: string } }).env?.VITE_RELAYER_URL || 'https://discerning-wonder-production-3da7.up.railway.app/relayer';
const RAILWAY_API_URL = (import.meta as { env?: { VITE_RELAYER_URL?: string } }).env?.VITE_RELAYER_URL || 'https://discerning-wonder-production-3da7.up.railway.app';

// Check if we're in development mode
const IS_DEVELOPMENT = import.meta.env.DEV;
const RPC_URL = (import.meta as { env?: { VITE_BLOCKCHAIN_RPC_URL?: string } }).env?.VITE_BLOCKCHAIN_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = (import.meta as { env?: { VITE_CONTRACT_ADDRESS?: string } }).env?.VITE_CONTRACT_ADDRESS || '0x48D3250BC9d205877E3D496B20d824dc2Cd4FA96';

// Contract ABI aligned with contracts/RailTrace.sol (Updated with batch operations)
const RAILTRACE_ABI = [
	"event Registered(bytes32 indexed partHash, string metadata, uint256 timestamp)",
	"event Received(bytes32 indexed partHash, string metadata, uint256 timestamp)",
	"event Installed(bytes32 indexed partHash, string metadata, uint256 timestamp)",
	"event Inspected(bytes32 indexed partHash, string metadata, uint256 timestamp)",
	"event Retired(bytes32 indexed partHash, string metadata, uint256 timestamp)",
	"event BatchVendorOperations(bytes32[] partHashes, string[] metadataArray, uint256 timestamp)",
	"event BatchInstallationOperations(bytes32[] partHashes, string[] metadataArray, uint256 timestamp)",
	"event BatchCompleteLifecycle(bytes32[] partHashes, string[] metadataArray, uint256 timestamp)",
	"function registerPart(bytes32 partHash, string metadata)",
	"function receivePart(bytes32 partHash, string metadata)",
	"function installPart(bytes32 partHash, string metadata)",
	"function inspectPart(bytes32 partHash, string metadata)",
	"function retirePart(bytes32 partHash, string metadata)",
	"function batchVendorOperations(bytes32[] partHashes, string[] metadataArray)",
	"function batchInstallationOperations(bytes32[] partHashes, string[] metadataArray)",
	"function batchCompleteLifecycle(bytes32[] partHashes, string[] metadataArray)",
	"function getPartHistory(bytes32 partHash) view returns (tuple(uint8 status, uint256 timestamp, string metadata)[])"
];

export interface BlockchainEvent {
  eventType: 'registered' | 'received' | 'installed' | 'inspected' | 'retired';
  partHash: string;
  timestamp: number;
  data: Record<string, unknown>;
  transactionHash: string;
  blockNumber: number;
}

export interface PartRegistration {
  partId: string;
  vendorId: string;
  lotId: string;
  manufactureDate: Date;
  specifications: Record<string, unknown>;
}

export interface PartReceipt {
  partHash: string;
  depotId: string;
  officerId: string;
  location: string;
  condition: 'good' | 'damaged' | 'rejected';
}

export interface PartInstallation {
  partHash: string;
  gps: {
    latitude: number;
    longitude: number;
  };
  engineerId: string;
  trackSection: string;
  photoHash?: string;
}

export interface PartInspection {
  partHash: string;
  inspectorId: string;
  resultCode: number; // 0=Pass, 1=Fail, 2=Defective
  defectType?: string;
  severity: number;
  mediaHashes: string[];
  notes: string;
}

type PersistedTx = { eventType: BlockchainEvent['eventType']; txHash: string; timestampSec: number };

class BlockchainService {
	private provider: ethers.JsonRpcProvider;
	private contract: ethers.Contract;
  private eventListeners: ((events: BlockchainEvent[]) => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
		this.provider = new ethers.JsonRpcProvider(RPC_URL);
		this.contract = new ethers.Contract(CONTRACT_ADDRESS, RAILTRACE_ABI, this.provider);
    console.log('✅ Connected to Railway server:', RAILWAY_API_URL);
    console.log('🔄 Batch operations enabled');
	}

	private pushEvents(events: BlockchainEvent[]) {
		try {
			window.dispatchEvent(new CustomEvent('blockchainEvent', { detail: events }));
		} catch {}
		this.eventListeners.forEach(cb => cb(events));
	}

  public subscribeToEvents(callback: (events: BlockchainEvent[]) => void) {
    this.eventListeners.push(callback);
    this.startRealtimePolling(); // Start polling for real-time data
    return () => {
      const index = this.eventListeners.indexOf(callback);
			if (index > -1) this.eventListeners.splice(index, 1);
      if (this.eventListeners.length === 0) {
        this.stopRealtimePolling();
      }
		};
	}

  private async startRealtimePolling() {
    if (this.pollingInterval) return; // Already polling
    
    console.log('📡 Real-time polling started');
    const pollInterval = 30000; // 30 seconds
    
    const poll = async () => {
      try {
        const response = await fetch(`${RAILWAY_API_URL}/api/events/recent`);
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
          const blockchainEvents: BlockchainEvent[] = data.events.map((event: any) => ({
            eventType: event.event.toLowerCase(),
            partHash: event.partHash,
            timestamp: Math.floor(Date.now() / 1000),
            data: event.metadata || {},
            transactionHash: event.transactionHash || 'unknown',
            blockNumber: 0
          }));
          
          this.eventListeners.forEach(callback => callback(blockchainEvents));
        }
      } catch (error) {
        console.warn('Failed to fetch real-time events from server:', error);
      }
    };
    
    // Initial poll
    await poll();
    
    // Set up interval
    this.pollingInterval = setInterval(poll, pollInterval);
  }

  private stopRealtimePolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('📡 Real-time polling stopped');
    }
  }

  // Generate unique part hash
  generatePartHash(partData: PartRegistration): string {
    const dataString = `${partData.partId}-${partData.vendorId}-${partData.lotId}-${partData.manufactureDate.getTime()}`;
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

	// Persist tx to Firestore (pending -> confirmed/failed)
	private async persistTx(partHash: string, eventType: BlockchainEvent['eventType'], txHash: string, metadataObj: Record<string, unknown>) {
		try {
			const ref = doc(db, 'transactions', txHash);
			await setDoc(ref, {
				transactionHash: txHash,
          partHash,
				eventType,
				status: 'pending',
				metadata: metadataObj || {},
				createdAt: serverTimestamp(),
			});
			// background confirmation update
			setTimeout(async () => {
				try {
					const st = await this.getTransactionStatus(txHash);
					await updateDoc(ref, {
						status: st.status,
						blockNumber: st.blockNumber || null,
						updatedAt: serverTimestamp(),
					});
				} catch {}
			}, 0);
		} catch {}
	}

	// Persist tx hash locally for audit (keyed by partHash)
	private saveTxHash(partHash: string, eventType: BlockchainEvent['eventType'], txHash: string) {
		try {
			const key = `txIndex:${partHash.toLowerCase()}`;
			const existing: PersistedTx[] = JSON.parse(localStorage.getItem(key) || '[]');
			existing.push({ eventType, txHash, timestampSec: Math.floor(Date.now() / 1000) });
			localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
		} catch {}
	}

	private getSavedTxHashes(partHash: string): PersistedTx[] {
		try {
			const key = `txIndex:${partHash.toLowerCase()}`;
			return JSON.parse(localStorage.getItem(key) || '[]');
		} catch { return []; }
	}

	// Helpers to build contract metadata JSON from existing app shapes
	private buildRegistrationMetadata(input: PartRegistration): string {
		return JSON.stringify({
			vendorId: input.vendorId,
			lotId: input.lotId,
			manufactureDate: input.manufactureDate.toISOString(),
			specifications: input.specifications || {},
		});
	}

	private buildReceiptMetadata(input: PartReceipt): string {
		return JSON.stringify({ depotId: input.depotId, officerId: input.officerId, location: input.location, condition: input.condition });
	}

	private buildInstallationMetadata(input: PartInstallation): string {
		return JSON.stringify({ gps: input.gps, engineerId: input.engineerId, trackSection: input.trackSection, photoHash: input.photoHash });
	}

	private buildInspectionMetadata(input: PartInspection): string {
		const mediaHash = input.mediaHashes.length > 0 
			? ethers.keccak256(ethers.toUtf8Bytes(input.mediaHashes.join(',')))
        : ethers.ZeroHash;
		return JSON.stringify({ inspectorId: input.inspectorId, resultCode: input.resultCode, defectType: input.defectType, severity: input.severity, mediaHash, notes: input.notes });
	}

	// Write operations via relayer
	async registerPart(partData: PartRegistration): Promise<string> {
		const partHash = this.generatePartHash(partData);
		const metadata = this.buildRegistrationMetadata(partData);
		const payload = { method: 'registerPart', params: { partHash, metadata } };
		const res = await this.sendToRelayer(payload);
		this.saveTxHash(partHash, 'registered', res.transactionHash);
		this.persistTx(partHash, 'registered', res.transactionHash, JSON.parse(metadata));
		return res.transactionHash;
	}

	async receivePart(receiptData: PartReceipt): Promise<string> {
		const metadata = this.buildReceiptMetadata(receiptData);
		const payload = { method: 'receivePart', params: { partHash: receiptData.partHash, metadata } };
		const res = await this.sendToRelayer(payload);
		this.saveTxHash(receiptData.partHash, 'received', res.transactionHash);
		this.persistTx(receiptData.partHash, 'received', res.transactionHash, JSON.parse(metadata));
		return res.transactionHash;
	}

	async installPart(installationData: PartInstallation): Promise<string> {
		const metadata = this.buildInstallationMetadata(installationData);
		const payload = { method: 'installPart', params: { partHash: installationData.partHash, metadata } };
		const res = await this.sendToRelayer(payload);
		this.saveTxHash(installationData.partHash, 'installed', res.transactionHash);
		this.persistTx(installationData.partHash, 'installed', res.transactionHash, JSON.parse(metadata));
		return res.transactionHash;
	}

	async inspectPart(inspectionData: PartInspection): Promise<string> {
		const metadata = this.buildInspectionMetadata(inspectionData);
		const payload = { method: 'inspectPart', params: { partHash: inspectionData.partHash, metadata } };
		const res = await this.sendToRelayer(payload);
		this.saveTxHash(inspectionData.partHash, 'inspected', res.transactionHash);
		this.persistTx(inspectionData.partHash, 'inspected', res.transactionHash, JSON.parse(metadata));
		return res.transactionHash;
	}

	async retirePart(partHash: string): Promise<string> {
		const metadata = JSON.stringify({ reason: 'retired' });
		const payload = { method: 'retirePart', params: { partHash, metadata } };
		const res = await this.sendToRelayer(payload);
		this.saveTxHash(partHash, 'retired', res.transactionHash);
		this.persistTx(partHash, 'retired', res.transactionHash, JSON.parse(metadata));
		return res.transactionHash;
	}

	// Read operations
	async getPartHistory(partHash: string): Promise<BlockchainEvent[]> {
		const raw: { status: number; timestamp: bigint; metadata: string }[] = await this.contract.getPartHistory(partHash);
		const saved = this.getSavedTxHashes(partHash);
		// Build FIFO queues per eventType using saved timestamps (oldest first)
		const queues: Record<BlockchainEvent['eventType'], PersistedTx[]> = {
			registered: [], received: [], installed: [], inspected: [], retired: []
		};
		saved
			.sort((a, b) => a.timestampSec - b.timestampSec)
			.forEach(s => { if (queues[s.eventType]) queues[s.eventType].push(s); });

		// Process events and fetch block numbers for transactions
		const events = raw.map((e) => {
			let eventType: BlockchainEvent['eventType'] = 'registered';
			const statusNumber = Number((e as unknown as { status: bigint | number }).status);
			if (statusNumber === 0) eventType = 'registered';
			else if (statusNumber === 1) eventType = 'received';
			else if (statusNumber === 2) eventType = 'installed';
			else if (statusNumber === 3) eventType = 'inspected';
			else if (statusNumber === 4) eventType = 'retired';
			let data: Record<string, unknown> = {};
			try { data = JSON.parse(e.metadata || '{}'); } catch {}
			// Attach next available saved tx for this event type
			const match = queues[eventType]?.shift();
      return {
				eventType,
				partHash,
				timestamp: Number(e.timestamp),
				data,
				transactionHash: match?.txHash || '',
				blockNumber: 0, // Will be updated below
			};
		});

		// Fetch block numbers for transactions that have tx hashes
		const eventsWithBlockNumbers = await Promise.all(
			events.map(async (event) => {
				if (event.transactionHash) {
					try {
						const receipt = await this.provider.getTransactionReceipt(event.transactionHash);
						if (receipt) {
							event.blockNumber = receipt.blockNumber || 0;
						}
    } catch (error) {
						console.warn('Failed to fetch block number for tx:', event.transactionHash, error);
					}
				}
				return event;
			})
		);

		return eventsWithBlockNumbers;
	}

	async verifyPart(partHash: string): Promise<{ isValid: boolean; status: 'verified' | 'pending' | 'invalid'; lastEvent?: BlockchainEvent; }> {
		const history = await this.getPartHistory(partHash);
		if (history.length === 0) return { isValid: false, status: 'invalid' };
		const hasRegistration = history.some((e) => e.eventType === 'registered');
		return { isValid: hasRegistration, status: hasRegistration ? 'verified' : 'pending', lastEvent: history[history.length - 1] };
	}

  private async sendToRelayer(payload: Record<string, unknown>): Promise<{ transactionHash: string }> {
      const res = await fetch(RELAYER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Relayer error: ${res.status}`);
      }
      const data = await res.json();
      return { transactionHash: data.transactionHash };
	}

	async getTransactionStatus(txHash: string): Promise<{ status: 'pending' | 'confirmed' | 'failed'; blockNumber?: number; confirmations?: number; }> {
		try {
			const receipt = await this.provider.getTransactionReceipt(txHash);
			if (!receipt) return { status: 'pending' };
			const conf = await this.provider.getBlockNumber() - (receipt.blockNumber ?? 0);
			return { status: receipt.status === 1 ? 'confirmed' : 'failed', blockNumber: receipt.blockNumber ?? undefined, confirmations: conf };
		} catch {
      return { status: 'failed' };
    }
  }

  // Batch operation methods for cost optimization
  async batchVendorOperations(partHashes: string[], metadataArray: string[]): Promise<string> {
    const payload = { 
      method: 'batchVendorOperations', 
      params: { partHashes, metadataArray } 
    };
    const res = await this.sendToRelayer(payload);
    
    // Persist each part's transaction
    partHashes.forEach((partHash, index) => {
      this.saveTxHash(partHash, 'registered', res.transactionHash);
      this.persistTx(partHash, 'registered', res.transactionHash, JSON.parse(metadataArray[index]));
    });
    
    return res.transactionHash;
  }

  async batchInstallationOperations(partHashes: string[], metadataArray: string[]): Promise<string> {
    const payload = { 
      method: 'batchInstallationOperations', 
      params: { partHashes, metadataArray } 
    };
    const res = await this.sendToRelayer(payload);
    
    // Persist each part's transaction
    partHashes.forEach((partHash, index) => {
      this.saveTxHash(partHash, 'installed', res.transactionHash);
      this.persistTx(partHash, 'installed', res.transactionHash, JSON.parse(metadataArray[index]));
    });
    
    return res.transactionHash;
  }

  async batchCompleteLifecycle(partHashes: string[], metadataArray: string[]): Promise<string> {
    const payload = { 
      method: 'batchCompleteLifecycle', 
      params: { partHashes, metadataArray } 
    };
    const res = await this.sendToRelayer(payload);
    
    // Persist each part's transaction for all lifecycle stages
    partHashes.forEach((partHash, index) => {
      const metadata = JSON.parse(metadataArray[index]);
      this.saveTxHash(partHash, 'registered', res.transactionHash);
      this.persistTx(partHash, 'registered', res.transactionHash, metadata);
    });
    
    return res.transactionHash;
  }

  // Get recent blockchain events for dashboard
  async getRecentEvents(): Promise<BlockchainEvent[]> {
    // Skip server call in development mode to avoid network errors
    if (IS_DEVELOPMENT) {
      console.log('🔧 Development mode: Using mock blockchain events');
      return this.getMockEvents();
    }

    try {
      // Try to fetch from the server first
      const response = await fetch(`${RAILWAY_API_URL}/api/events/recent`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.events && data.events.length > 0) {
          console.log('✅ Fetched real events from server:', data.events.length);
          return data.events.map((event: any) => ({
            eventType: event.event.toLowerCase(),
            partHash: event.partHash,
            timestamp: Math.floor(Date.now() / 1000),
            data: event.metadata || {},
            transactionHash: event.txHash || '',
            blockNumber: event.blockNumber || 0,
            id: event.txHash || event.partHash
          }));
        }
      }
    } catch (error) {
      console.warn('⚠️ Server unavailable, using mock data:', error.message);
    }

    // Return mock data if server is unavailable
    return this.getMockEvents();
  }

  // Helper method to generate mock events
  private getMockEvents(): BlockchainEvent[] {
    console.log('📊 Using mock blockchain events for dashboard');
    return [
      {
        eventType: 'registered',
        partHash: '0x1234567890abcdef',
        timestamp: Math.floor(Date.now() / 1000) - 300,
        data: { partId: 'AXLE-BR-001' },
        transactionHash: '0xabcdef1234567890',
        blockNumber: 12345,
        id: '0xabcdef1234567890'
      },
      {
        eventType: 'installed',
        partHash: '0x2345678901bcdef0',
        timestamp: Math.floor(Date.now() / 1000) - 600,
        data: { partId: 'BRAKE-PAD-002' },
        transactionHash: '0xbcdef01234567890',
        blockNumber: 12346,
        id: '0xbcdef01234567890'
      },
      {
        eventType: 'inspected',
        partHash: '0x3456789012cdef01',
        timestamp: Math.floor(Date.now() / 1000) - 900,
        data: { partId: 'WHEEL-003' },
        transactionHash: '0xcdef012345678901',
        blockNumber: 12347,
        id: '0xcdef012345678901'
      }
    ];
  }
}

// Export the blockchain service instance
export const blockchainService = new BlockchainService();