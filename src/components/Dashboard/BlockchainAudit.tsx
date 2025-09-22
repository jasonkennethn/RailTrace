import { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Download,
  Package,
  RefreshCw,
  ExternalLink,
  Search
} from 'lucide-react';
// import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
// import { TruncatedText } from '../ui/TruncatedText';
// import { StatsCard } from './StatsCard';
// import { Skeleton } from '../ui/Skeleton';
import { SmartAddressDisplay } from '../ui/SmartAddressDisplay';
import { ScrollableHeader } from '../ui/ScrollableHeader';
import { blockchainService } from '../../services/blockchainService';
import { ethers } from 'ethers';
import { collection, query, where, getDocs, orderBy, doc, setDoc, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useLanguage } from '../../contexts/LanguageContext';

interface BlockchainRecord {
  id: string;
  transactionHash: string;
  fittingId: string;
  eventType: 'manufacture' | 'receive' | 'install' | 'inspect' | 'retire';
  timestamp: Date;
  data: Record<string, unknown>;
  verificationStatus: 'confirmed' | 'pending' | 'failed';
  blockNumber?: number;
  gasUsed?: number;
  fromAddress?: string;
  toAddress?: string;
}

interface AuditSummary {
  totalTransactions: number;
  confirmedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalGasUsed: number;
  lastBlockMined?: Date;
}

interface BlockchainAuditProps {
  onBack?: () => void;
  onViewTransaction?: (transactionId: string) => void;
  onViewPart?: (partData: any) => void;
}

export function BlockchainAudit({ onBack, onViewTransaction, onViewPart }: BlockchainAuditProps) {
  const { t } = useLanguage();
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [summary, setSummary] = useState<AuditSummary>({
    totalTransactions: 0,
    confirmedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    totalGasUsed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTxEnriching, setIsTxEnriching] = useState(false);
  // const [statusFilter, setStatusFilter] = useState<'all'|'confirmed'|'pending'|'failed'>('all');
  const [recentRecords, setRecentRecords] = useState<BlockchainRecord[]>([]);
  const [partHashInput, setPartHashInput] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedExtraData, setExpandedExtraData] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Clear any previous state on refresh
    setPartHashInput('');
    setRecords([]);
    setSummary({
      totalTransactions: 0,
      confirmedTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      totalGasUsed: 0
    });
    setIsLoading(false);
    loadRecentTransactions();
    
    // Set up real-time listener for transaction updates
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: BlockchainRecord[] = [];
      snapshot.forEach((doc) => {
        const v = doc.data() as any;
        items.push({
          id: `recent-${v.partHash || 'unknown'}-${v.eventType || 'manufacture'}-${doc.id}`,
          transactionHash: v.transactionHash || '',
          fittingId: v.partHash || 'unknown',
          eventType: (v.eventType || 'manufacture') as BlockchainRecord['eventType'],
          timestamp: v.createdAt?.toDate ? v.createdAt.toDate() : (v.timestamp?.toDate ? v.timestamp.toDate() : new Date()),
          data: v.metadata || {},
          verificationStatus: (v.status || 'confirmed') as BlockchainRecord['verificationStatus'],
          blockNumber: v.blockNumber
        });
      });
      setRecentRecords(items);
      
      // Update summary stats in real-time
      const total = items.length;
      const confirmed = items.filter(i => i.verificationStatus === 'confirmed').length;
      const pending = items.filter(i => i.verificationStatus === 'pending').length;
      const failed = items.filter(i => i.verificationStatus === 'failed').length;
      
      setSummary(prev => ({
        ...prev,
        totalTransactions: total,
        confirmedTransactions: confirmed,
        pendingTransactions: pending,
        failedTransactions: failed
      }));
    });
    
    return () => unsubscribe();
  }, []);

  const mapEventType = (e: string): BlockchainRecord['eventType'] => {
    if (e === 'registered') return 'manufacture';
    if (e === 'received') return 'receive';
    if (e === 'installed') return 'install';
    if (e === 'inspected') return 'inspect';
    if (e === 'retired') return 'retire';
    return 'manufacture';
  };

  const loadTxHashesForPart = async (partHash: string, expectedCounts?: Partial<Record<'registered'|'received'|'installed'|'inspected'|'retired', number>>, options?: { windowSize?: number; maxWindows?: number }): Promise<Record<string, string[]>> => {
    const rpc = (import.meta as { env?: { VITE_BLOCKCHAIN_RPC_URL?: string } }).env?.VITE_BLOCKCHAIN_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
    const contractAddress = (import.meta as { env?: { VITE_CONTRACT_ADDRESS?: string } }).env?.VITE_CONTRACT_ADDRESS || '';
    if (!contractAddress) return {};

    const provider = new ethers.JsonRpcProvider(rpc);
    const iface = new ethers.Interface([
      'event Registered(bytes32 indexed partHash, string metadata, uint256 timestamp)',
      'event Received(bytes32 indexed partHash, string metadata, uint256 timestamp)',
      'event Installed(bytes32 indexed partHash, string metadata, uint256 timestamp)',
      'event Inspected(bytes32 indexed partHash, string metadata, uint256 timestamp)',
      'event Retired(bytes32 indexed partHash, string metadata, uint256 timestamp)'
    ]);

    const topicsBy = (sig: string) => [iface.getEvent(sig)!.topicHash, partHash];

    const filters = [
      { key: 'registered' as const, topics: topicsBy('Registered(bytes32,string,uint256)') },
      { key: 'received'   as const, topics: topicsBy('Received(bytes32,string,uint256)') },
      { key: 'installed'  as const, topics: topicsBy('Installed(bytes32,string,uint256)') },
      { key: 'inspected'  as const, topics: topicsBy('Inspected(bytes32,string,uint256)') },
      { key: 'retired'    as const, topics: topicsBy('Retired(bytes32,string,uint256)') },
    ];

    const providerLatest = await provider.getBlockNumber();
    const windowSize = options?.windowSize ?? 1000;
    const maxWindows = options?.maxWindows ?? 6;

    const out: Record<string, string[]> = { registered: [], received: [], installed: [], inspected: [], retired: [] };

    let from = providerLatest - windowSize + 1;
    let to = providerLatest;
    let windows = 0;

    while (windows < maxWindows && to >= 0) {
      await Promise.all(filters.map(async (f) => {
        const need = expectedCounts?.[f.key] ?? Infinity;
        if (out[f.key].length >= need) return;
        try {
          const logs = await provider.getLogs({ address: contractAddress, topics: f.topics as string[], fromBlock: Math.max(0, from), toBlock: to });
          const hashes = logs.map(l => l.transactionHash).reverse();
          out[f.key] = [...hashes, ...out[f.key]];
        } catch {}
      }));
      const allEnough = filters.every(f => (out[f.key].length >= (expectedCounts?.[f.key] ?? Infinity)));
      if (allEnough) break;
      windows += 1;
      to = from - 1;
      from = to - windowSize + 1;
    }

    return out;
  };

  // const deepBackfillMissingTx = async (partHash: string, expected: Partial<Record<'registered'|'received'|'installed'|'inspected'|'retired', number>>) => {
  //   setIsTxEnriching(true);
  //   try {
  //     const txMap = await loadTxHashesForPart(partHash, expected, { windowSize: 2000, maxWindows: 40 });
  //     const q = {
  //       manufacture: (txMap['registered'] || []).slice(),
  //       receive: (txMap['received'] || []).slice(),
  //       install: (txMap['installed'] || []).slice(),
  //       inspect: (txMap['inspected'] || []).slice(),
  //       retire: (txMap['retired'] || []).slice(),
  //     } as Record<BlockchainRecord['eventType'], string[]>;
  //     setRecords(prev => prev.map(r => ({ ...r, transactionHash: r.transactionHash || q[r.eventType]?.shift() || '' })));
  //   } finally {
  //     setIsTxEnriching(false);
  //   }
  // };

  // const applyStatusFilter = (items: BlockchainRecord[]) => {
  //   if (statusFilter === 'all') return items;
  //   return items.filter(i => i.verificationStatus === statusFilter);
  // };

  // const mergeWithFirestore = async (partHash: string, items: BlockchainRecord[]) => {
  //   try {
  //     const q = query(collection(db, 'transactions'), where('partHash', '==', partHash));
  //     const snap = await getDocs(q);
  //     const byEvent = new Map<string, string>();
  //     snap.forEach(doc => {
  //       const val = doc.data();
  //       if (val?.eventType && val?.transactionHash && !byEvent.has(val.eventType)) byEvent.set(val.eventType, val.transactionHash);
  //     });
  //     return items.map(i => ({
  //       ...i,
  //       transactionHash: i.transactionHash || byEvent.get(i.eventType) || ''
  //     }));
  //   } catch { return items; }
  // };

  const backfillFirestore = async (partHash: string, items: BlockchainRecord[]) => {
    try {
      // Check for existing records to avoid duplicates
      const q = query(collection(db, 'transactions'), where('partHash', '==', partHash));
      const snap = await getDocs(q);
      const existing = new Set<string>();
      snap.forEach(doc => { 
        const v = doc.data(); 
        if (v?.transactionHash) existing.add(v.transactionHash);
        // Also check by eventType + partHash combination to avoid duplicate events
        if (v?.eventType && v?.partHash) existing.add(`${v.partHash}-${v.eventType}`);
      });
      
      const toCreate = items.filter(i => {
        const txHashExists = i.transactionHash && existing.has(i.transactionHash);
        const eventExists = existing.has(`${partHash}-${i.eventType}`);
        return !txHashExists && !eventExists;
      });
      
      console.log(`Saving ${toCreate.length} new records to Firestore (avoiding ${items.length - toCreate.length} duplicates)`);
      
      if (toCreate.length > 0) {
        await Promise.all(toCreate.map(i => setDoc(doc(db, 'transactions', `${partHash}-${i.eventType}-${Date.now()}`), {
          transactionHash: i.transactionHash,
          partHash,
          eventType: i.eventType,
          status: 'confirmed',
          metadata: i.data || {},
          createdAt: new Date(),
          blockNumber: i.blockNumber
        })));
        console.log('Successfully saved new records to Firestore');
      } else {
        console.log('No new records to save - all data already exists in Firestore');
      }
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  };

  const loadFromChainByPartHash = async (partHash: string) => {
    // Trim whitespace first
    const trimmedHash = partHash?.trim() || '';
    
    if (!trimmedHash) {
      console.log('No part hash provided');
      return;
    }
    
    // Normalize the part hash - add 0x prefix if missing
    let normalizedHash = trimmedHash;
    if (!normalizedHash.startsWith('0x')) {
      normalizedHash = `0x${normalizedHash}`;
    }
    
    // Validate the hash format (should be 66 characters including 0x prefix)
    if (normalizedHash.length !== 66) {
      console.error('Invalid part hash length:', normalizedHash.length, 'Hash:', normalizedHash);
      alert(`Invalid part hash format. Expected 66 characters (0x + 64 hex), got ${normalizedHash.length} characters. Please enter a valid 64-character hash.`);
      setIsLoading(false);
      return;
    }
    
    // Validate hex characters only
    if (!/^0x[0-9a-fA-F]{64}$/.test(normalizedHash)) {
      console.error('Invalid part hash format:', normalizedHash);
      alert('Invalid part hash format. Please enter a valid hexadecimal hash.');
      setIsLoading(false);
      return;
    }
    
    console.log('Loading from chain for part hash:', normalizedHash);
    setIsLoading(true);
    setRecords([]); // Clear previous records
    
    try {
      // First, check if we already have this data in Firestore
      console.log('Checking Firestore for existing data for partHash:', normalizedHash);
      const existingQuery = query(collection(db, 'transactions'), where('partHash', '==', normalizedHash));
      const existingSnap = await getDocs(existingQuery);
      
      if (!existingSnap.empty) {
        console.log('Found existing data in Firestore, loading from cache');
        const cachedRecords: BlockchainRecord[] = [];
        existingSnap.forEach((doc) => {
          const v = doc.data() as any;
          cachedRecords.push({
            id: `cached-${normalizedHash}-${v.eventType}-${doc.id}`,
            transactionHash: v.transactionHash || '',
            fittingId: normalizedHash,
            eventType: mapEventType(v.eventType),
            timestamp: v.createdAt?.toDate ? v.createdAt.toDate() : (v.timestamp?.toDate ? v.timestamp.toDate() : new Date()),
            data: v.metadata || {},
            verificationStatus: (v.status || 'confirmed') as BlockchainRecord['verificationStatus'],
            blockNumber: v.blockNumber || undefined
          });
        });
        
        // Sort by timestamp to maintain chronological order
        cachedRecords.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        setRecords(cachedRecords);
        setSummary({
          totalTransactions: cachedRecords.length,
          confirmedTransactions: cachedRecords.length,
          pendingTransactions: 0,
          failedTransactions: 0,
          totalGasUsed: 0,
          lastBlockMined: new Date()
        });
        setIsLoading(false);
        return; // Exit early if we have cached data
      }

      // If no cached data, fetch from blockchain
      console.log('No cached data found, fetching from blockchain for partHash:', normalizedHash);
      const history = await blockchainService.getPartHistory(normalizedHash);
      console.log('Raw history from blockchain:', history);
      
      if (history.length === 0) {
        console.log('No blockchain history found for this partHash');
        // Show a message to the user
        alert('No blockchain history found for this part hash. Please verify the hash is correct.');
        setRecords([]);
        setSummary({
          totalTransactions: 0,
          confirmedTransactions: 0,
          pendingTransactions: 0,
          failedTransactions: 0,
          totalGasUsed: 0
        });
        setIsLoading(false);
        return;
      }
      
      let immediate: BlockchainRecord[] = history.map((h, idx) => ({
        id: `${partHash}-${h.eventType}-${idx}-${Date.now()}`,
        transactionHash: h.transactionHash || '',
        fittingId: partHash,
        eventType: mapEventType(h.eventType),
        timestamp: new Date((h.timestamp || 0) * 1000),
        data: h.data || {},
          verificationStatus: 'confirmed',
        blockNumber: h.blockNumber || undefined
      }));
      
      console.log('Mapped records:', immediate);
      
      // Show blockchain data immediately
      setRecords(immediate);
      setSummary({
        totalTransactions: immediate.length,
        confirmedTransactions: immediate.length,
        pendingTransactions: 0,
        failedTransactions: 0,
        totalGasUsed: 0,
        lastBlockMined: new Date()
      });
      
      setIsLoading(false);

      // Background enrichment for missing transaction hashes
      setIsTxEnriching(true);
      const expected: Partial<Record<'registered'|'received'|'installed'|'inspected'|'retired', number>> = history.reduce((acc, h) => {
        if (h.eventType in acc) acc[h.eventType as keyof typeof acc]! += 1; else acc[h.eventType as keyof typeof acc] = 1; return acc;
      }, {} as any);
      
      console.log('Expected counts:', expected);
      
      const txMap = await loadTxHashesForPart(partHash, expected, { windowSize: 1000, maxWindows: 6 });
      console.log('Transaction map from logs:', txMap);
      
      const qMap = {
        manufacture: (txMap['registered'] || []).slice(),
        receive: (txMap['received'] || []).slice(),
        install: (txMap['installed'] || []).slice(),
        inspect: (txMap['inspected'] || []).slice(),
        retire: (txMap['retired'] || []).slice(),
      } as Record<BlockchainRecord['eventType'], string[]>;

      console.log('Queue map:', qMap);

      // Update records with transaction hashes from logs
      setRecords(prev => {
        const updated = prev.map(r => {
          const txHash = r.transactionHash || qMap[r.eventType]?.shift() || '';
          return { ...r, transactionHash: txHash };
        });
        console.log('Updated records with tx hashes:', updated);
        return updated;
      });

      setIsTxEnriching(false);

      // Save to Firestore only once (avoid duplicates)
      console.log('Saving enriched data to Firestore (one-time save)');
      await backfillFirestore(partHash, immediate);
      
    } catch (error) {
      console.error('Failed to load on-chain history:', error);
      // Show user-friendly error message
      alert('Failed to load blockchain data. Please check your connection and try again.');
      setRecords([]);
      setSummary({
        totalTransactions: 0,
        confirmedTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        totalGasUsed: 0
      });
      setIsLoading(false);
      setIsTxEnriching(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      // Clear the partHash input and blockchain records
      setPartHashInput('');
      setRecords([]);
      
      const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const items: BlockchainRecord[] = [];
      snap.forEach((doc) => {
        const v = doc.data() as any;
        items.push({
          id: `recent-${v.partHash || 'unknown'}-${v.eventType || 'manufacture'}-${doc.id}`,
          transactionHash: v.transactionHash || '',
          fittingId: v.partHash || 'unknown',
          eventType: (v.eventType || 'manufacture') as BlockchainRecord['eventType'],
          timestamp: v.createdAt?.toDate ? v.createdAt.toDate() : (v.timestamp?.toDate ? v.timestamp.toDate() : new Date()),
          data: v.metadata || {},
          verificationStatus: (v.status || 'confirmed') as BlockchainRecord['verificationStatus'],
          blockNumber: v.blockNumber
        });
      });
      setRecentRecords(items);
      
      // Update summary stats
      const total = items.length;
      const confirmed = items.filter(i => i.verificationStatus === 'confirmed').length;
      const pending = items.filter(i => i.verificationStatus === 'pending').length;
      const failed = items.filter(i => i.verificationStatus === 'failed').length;
      
      setSummary(prev => ({
        ...prev,
        totalTransactions: total,
        confirmedTransactions: confirmed,
        pendingTransactions: pending,
        failedTransactions: failed
      }));
    } catch (e) {
      console.error('Failed to load recent transactions', e);
      setRecentRecords([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success" size="sm">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm">Failed</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'manufacture': return <Package className="h-4 w-4" />;
      case 'receive': return <CheckCircle className="h-4 w-4" />;
      case 'install': return <Shield className="h-4 w-4" />;
      case 'inspect': return <CheckCircle className="h-4 w-4" />;
      case 'retire': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // const exportAuditReport = () => { /* kept for future use */ };

  const getBscScanBaseUrl = () => {
    const envBase = (import.meta as { env?: { VITE_BSCSCAN_BASE_URL?: string } }).env?.VITE_BSCSCAN_BASE_URL;
    // Defaults to testnet; set VITE_BSCSCAN_BASE_URL=https://bscscan.com for mainnet
    return envBase || 'https://testnet.bscscan.com';
  };

  const normalizeTxHash = (hash: string | undefined | null): string => {
    if (!hash) return '';
    let h = hash.trim();
    if (!h) return '';
    if (!h.startsWith('0x')) h = `0x${h}`;
    if (!/^0x[0-9a-fA-F]{64}$/.test(h)) return '';
    return h;
  };

  const bscscanTx = (tx: string) => {
    const norm = normalizeTxHash(tx);
    return norm ? `${getBscScanBaseUrl()}/tx/${norm}` : '';
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const isCardExpanded = (cardId: string) => expandedCards.has(cardId);

  const handleRefresh = () => {
    loadRecentTransactions();
  };

  const formatDataKey = (key: string): string => {
    const keyMap: { [key: string]: string } = {
      'vendorId': 'Vendor ID',
      'lotId': 'Lot ID',
      'manufactureDate': 'Manufacture Date',
      'specifications': 'Specifications',
      'depotId': 'Depot ID',
      'officerId': 'Officer ID',
      'location': 'Location',
      'condition': 'Condition',
      'gps': 'GPS Coordinates',
      'engineerId': 'Engineer ID',
      'trackSection': 'Track Section',
      'photoHash': 'Photo Hash',
      'inspectorId': 'Inspector ID',
      'resultCode': 'Result Code',
      'defectType': 'Defect Type',
      'severity': 'Severity',
      'mediaHashes': 'Media Hashes',
      'notes': 'Notes',
      'reason': 'Reason',
      'latitude': 'Latitude',
      'longitude': 'Longitude',
      'type': 'Type',
      'material': 'Material'
    };
    return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const formatDataValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (value === 0) return '0';
      if (value === 1) return '1';
      if (value === 2) return '2';
      return value.toString();
    }
    if (typeof value === 'object' && value !== null) {
      // Handle GPS coordinates object
      if ('latitude' in value && 'longitude' in value) {
        const lat = typeof value.latitude === 'number' ? value.latitude : parseFloat(String(value.latitude));
        const lng = typeof value.longitude === 'number' ? value.longitude : parseFloat(String(value.longitude));
        if (!isNaN(lat) && !isNaN(lng)) {
          return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
      }
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'string') {
      // Format dates
      if (value.includes('T') && value.includes('Z')) {
        try {
          return new Date(value).toLocaleString();
        } catch {
          return value;
        }
      }
      return value;
    }
    return String(value);
  };

  return (
    <div className="flex flex-col h-screen justify-between">
      <main className="flex-grow overflow-y-auto">
        {/* Header with Hide-on-Scroll */}
        <ScrollableHeader>
          <div className="flex items-center p-3 sm:p-4">
            <button 
              onClick={onBack}
              className="touch-target p-2 -ml-2 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[#0d1117] dark:text-[#c9d1d9]">arrow_back</span>
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#0d1117] dark:text-[#c9d1d9] flex-1 text-center pr-10">{t('blockchain.title')}</h1>
      </div>
        </ScrollableHeader>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Part Hash Verification Section */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-[#0d1117] dark:text-[#c9d1d9] mb-2">Part Hash Verification</h2>
            <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-[#d0d7de] dark:border-[#30363d]">
              <div className="p-3 sm:p-4">
              <div className="relative">
                  <Search className="absolute left-3 top-[51%] transform -translate-y-1/2 h-4 w-4 text-[#57606a] dark:text-[#8b949e] pointer-events-none" />
                <input
                    className="w-full bg-[#f0f2f5] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#1773cf] h-12 text-sm text-[#0d1117] dark:text-[#c9d1d9] touch-target" 
                    placeholder="Enter 64-character hex hash (without 0x prefix)" 
                  type="text"
                    value={partHashInput}
                    onChange={(e) => {
                      let value = e.target.value;
                      
                      // Remove 0x prefix if user pastes it, we'll add it back later
                      if (value.toLowerCase().startsWith('0x')) {
                        value = value.substring(2);
                      }
                      
                      // Only allow hex characters and remove any spaces
                      value = value.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
                      
                      // Limit to 64 characters max
                      if (value.length > 64) {
                        value = value.substring(0, 64);
                      }
                      
                      setPartHashInput(value);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') loadFromChainByPartHash(partHashInput); }}
                />
                <div className="mt-2 text-xs text-[#57606a] dark:text-[#8b949e]">
                  {partHashInput ? (
                    <>
                      {partHashInput.length}/64 characters
                      {partHashInput.length === 64 && (
                        <span className="ml-2 text-green-600 dark:text-green-400">✓ Valid length</span>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button 
                    className="w-full bg-[#1773cf] text-white font-bold py-3 px-4 rounded-xl text-sm h-12 flex items-center justify-center gap-2 hover:bg-[#1773cf]/90 touch-target active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => loadFromChainByPartHash(partHashInput)}
                    disabled={!partHashInput || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">verified</span>
                        Verify
                      </>
                    )}
                  </button>
            </div>
          </div>
            </div>
          </section>

          {/* Results Section */}
          {records.length > 0 && (
            <section>
              <h2 className="text-base sm:text-lg font-bold text-[#0d1117] dark:text-[#c9d1d9] mb-2">Results</h2>
              <div className="space-y-3">
                {records.slice(0, 4).map((record, index) => {
                  const resId = `${record.id}-result-${index}`;
                  const isExpanded = isCardExpanded(resId);
                  return (
                    <div key={`result-${record.id}-${index}`} className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleCardExpansion(resId)}
                        className="w-full p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1773cf]/10 text-[#1773cf] flex-shrink-0">
                            <span className="material-symbols-outlined">qr_code_2</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-[#57606a] dark:text-[#8b949e] font-medium">Part ID</p>
                            <div className="flex items-center gap-2 min-w-0">
                              <SmartAddressDisplay address={record.fittingId} variant="minimal" maxLength={4} className="text-sm" />
                              <CopyButton value={record.fittingId} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-[#57606a] dark:text-[#8b949e] font-medium">Date</p>
                            <p className="text-sm text-[#0d1117] dark:text-[#c9d1d9]">{isNaN(record.timestamp.getTime()) ? 'Invalid Date' : record.timestamp.toLocaleDateString()}</p>
                          </div>
                          <div className={`inline-flex items-center gap-1.5 rounded-full ${record.verificationStatus === 'confirmed' ? 'bg-green-500/20 text-green-700 dark:text-green-400' : record.verificationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'} px-2.5 py-1 text-xs font-medium`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${record.verificationStatus === 'confirmed' ? 'bg-green-500' : record.verificationStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                            {record.verificationStatus.charAt(0).toUpperCase() + record.verificationStatus.slice(1)}
                          </div>
                        </div>
                      </button>
                      {/* Collapsible content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t border-border-light dark:border-border-dark">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Transaction Hash</span>
                            {record.transactionHash ? (
                              <div className="flex items-center gap-2 min-w-0">
                                <SmartAddressDisplay address={record.transactionHash} variant="compact" maxLength={4} className="text-sm" />
                                <CopyButton value={record.transactionHash} />
                              </div>
                            ) : (
                              <span className="text-sm text-subtle-light dark:text-subtle-dark">N/A</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Block Number</span>
                            <span className="text-sm text-foreground-light dark:text-foreground-dark">{record.blockNumber?.toString() || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Event Type</span>
                            <Badge variant="default" size="sm" className="capitalize">{record.eventType}</Badge>
                          </div>
                        </div>
                      )}
          </div>
                  );
                })}
            </div>
            </section>
          )}

          {/* Event History Section */}
          {records.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Event History</h2>
              <div className="relative pl-5">
                <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                <div className="space-y-8">
                  {records.map((record, index) => (
                    <div key={`timeline-${record.id}-${index}`} className="relative">
                      <div className="absolute -left-2.5 top-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 dark:bg-primary/30">
                        <span className="material-symbols-outlined text-primary">
                          {record.eventType === 'manufacture' ? 'app_registration' :
                           record.eventType === 'inspect' ? 'fact_check' :
                           record.eventType === 'install' ? 'build_circle' :
                           record.eventType === 'receive' ? 'inventory' :
                           'construction'}
                        </span>
                      </div>
                      <div className="ml-12 pt-1.5">
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          Part {record.eventType === 'manufacture' ? 'Registered' :
                                record.eventType === 'inspect' ? 'Inspected' :
                                record.eventType === 'install' ? 'Installed' :
                                record.eventType === 'receive' ? 'Received' :
                                'Retired'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {record.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                    </div>
                  </div>
            </section>
          )}

          {/* Recent Transactions Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">{t('blockchain.recentTransactions')}</h2>
              <button 
                onClick={handleRefresh}
                className="p-2 text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-background-light dark:hover:bg-background-dark"
                title="Refresh transactions"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentRecords.slice(0, 5).map((record) => {
                const isExpanded = isCardExpanded(record.id);
                return (
                  <div key={record.id} className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark overflow-hidden">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                      onClick={() => onViewPart ? onViewPart(record) : toggleCardExpansion(record.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                          {getEventTypeIcon(record.eventType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground-light dark:text-foreground-dark text-sm">
                              {record.eventType === 'manufacture' ? 'Part Manufactured' :
                               record.eventType === 'inspect' ? 'Part Inspected' :
                               record.eventType === 'install' ? 'Part Installed' :
                               record.eventType === 'receive' ? 'Part Received' :
                               'Part Retired'}
                            </h3>
                            {getStatusBadge(record.verificationStatus)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-subtle-light dark:text-subtle-dark">
                            <span>Part:</span>
                            <SmartAddressDisplay
                              address={record.fittingId}
                              variant="minimal"
                              maxLength={4}
                              className="text-xs font-mono"
                            />
                            <span>•</span>
                            <span>{record.timestamp.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`material-symbols-outlined text-subtle-light dark:text-subtle-dark transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          chevron_right
                        </span>
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border-light dark:border-border-dark">
                        <div className="pt-4 space-y-4">
                          {/* Transaction Hash */}
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Transaction Hash:</span>
                            {record.transactionHash ? (
                              <div className="flex items-center gap-2 min-w-0">
                                <SmartAddressDisplay address={record.transactionHash} variant="compact" maxLength={4} className="w-full" />
                                <CopyButton value={record.transactionHash} />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const url = bscscanTx(record.transactionHash);
                                    if (url) window.open(url, '_blank');
                                  }}
                                  className="shrink-0"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-subtle-light dark:text-subtle-dark">N/A</span>
                            )}
                          </div>
                          
                          {/* Block Number */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Block Number:</span>
                            <span className="text-sm text-foreground-light dark:text-foreground-dark">
                              {record.blockNumber ? `#${record.blockNumber}` : 'N/A'}
                            </span>
                          </div>
                          
                          {/* Event Type */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Event Type:</span>
                            <Badge variant="default" size="sm" className="capitalize">
                              {record.eventType}
                            </Badge>
                          </div>
                          
                          {/* Part Hash */}
                          <div className="flex items-center justify-between min-w-0">
                            <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Part Hash:</span>
                            <div className="flex items-center gap-2 min-w-0">
                              <SmartAddressDisplay address={record.fittingId} variant="compact" maxLength={4} className="font-mono text-sm text-foreground-light dark:text-foreground-dark" />
                              <CopyButton value={record.fittingId} />
                            </div>
                          </div>
                          
                          {/* Additional Data (collapsible) */}
                          {Object.keys(record.data).length > 0 && (
                      <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Additional Data:</span>
                                <button
                                  className="text-xs text-primary hover:text-primary/80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedExtraData(prev => {
                                      const next = new Set(prev);
                                      if (next.has(record.id)) next.delete(record.id); else next.add(record.id);
                                      return next;
                                    });
                                  }}
                                >
                                  {expandedExtraData.has(record.id) ? 'Show Less' : 'Show More'}
                                </button>
                              </div>
                              <div className="bg-background-light dark:bg-background-dark rounded-lg p-3 space-y-2">
                                {Object.entries(record.data)
                                  .slice(0, expandedExtraData.has(record.id) ? undefined : 4)
                                  .map(([key, value]) => (
                                    <div key={key} className="flex items-start justify-between gap-3 text-sm min-w-0">
                                      <span className="text-subtle-light dark:text-subtle-dark flex-shrink-0">{formatDataKey(key)}:</span>
                                      <span className="text-foreground-light dark:text-foreground-dark font-mono break-all text-right">
                                        {formatDataValue(value)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                      </div>
                    )}
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            {record.transactionHash && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(bscscanTx(record.transactionHash), '_blank');
                                }}
                                className="flex-1"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on BSCScan
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onViewTransaction) {
                                  onViewTransaction(record.transactionHash || record.fittingId);
                                }
                              }}
                              className="flex-1"
                            >
                              <span className="material-symbols-outlined text-base mr-2">visibility</span>
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(JSON.stringify(record, null, 2));
                              }}
                              className="flex-1"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Copy Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {recentRecords.length === 0 && (
                <div className="bg-background-light dark:bg-background-dark/50 rounded-lg p-8 text-center">
                  <Shield className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent transactions found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Transactions will appear here as they are processed
                  </p>
                </div>
              )}
            </div>
          </section>
            </div>
      </main>

    </div>
  );
}
