import React, { useState, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Camera, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Calendar,
  Package,
  QrCode,
  RefreshCw,
  Download,
  MapPin,
  User,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { blockchainService } from '../../services/blockchainService';
import { offlineService } from '../../services/offlineService';
import { useAuth } from '../../hooks/useAuth';

interface QRScanResult {
  partHash: string;
  pointerURL: string;
  partId: string;
  vendorId: string;
  lotId: string;
  manufactureDate: string;
  specifications: Record<string, unknown>;
}

interface PartHistory {
  eventType: string;
  timestamp: number;
  data: Record<string, unknown>;
  verified: boolean;
}

export function QRScanner() {
  const { userData } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [partHistory, setPartHistory] = useState<PartHistory[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'invalid'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [receiptForm, setReceiptForm] = useState({ depotId: '', officerId: '', location: '', condition: 'good' as 'good' | 'damaged' | 'rejected' });
  const [installForm, setInstallForm] = useState({ engineerId: '', trackSection: '', latitude: '', longitude: '' });
  const [inspectForm, setInspectForm] = useState({ inspectorId: '', resultCode: '0', defectType: '', severity: '1', notes: '' });

  const handleScan = useCallback(async (result: string) => {
    if (!result) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const qrData = JSON.parse(result);
      const partHash = await blockchainService.generatePartHash(qrData);
      
      const history = await blockchainService.getPartHistory(partHash);
      
      setScanResult({
        partHash,
        pointerURL: `https://blockchain.railtrace.com/part/${partHash}`,
        partId: qrData.partId,
        vendorId: qrData.vendorId,
        lotId: qrData.batchNumber,
        manufactureDate: qrData.timestamp,
        specifications: {
          material: qrData.material,
          details: qrData.specifications
        }
      });
      
      setPartHistory(history);
      setVerificationStatus('verified');
    } catch (err) {
      console.error('Scan processing failed:', err);
      setError('Failed to process QR code. Please try again.');
      setVerificationStatus('invalid');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = async (actionType: 'receive' | 'install' | 'inspect') => {
    if (!scanResult) return;
    
    setActionLoading(true);
    
    try {
      let formData;
      switch (actionType) {
        case 'receive':
          formData = receiptForm;
          break;
        case 'install':
          formData = installForm;
          break;
        case 'inspect':
          formData = inspectForm;
          break;
      }
      
      await blockchainService.updatePartStatus(scanResult.partHash, actionType, formData);
      
      // Refresh history
      const history = await blockchainService.getPartHistory(scanResult.partHash);
      setPartHistory(history);
      
    } catch (err) {
      console.error('Action failed:', err);
      setError('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'manufacture':
        return <Package className="h-4 w-4" />;
      case 'receive':
        return <CheckCircle className="h-4 w-4" />;
      case 'install':
        return <Shield className="h-4 w-4" />;
      case 'inspect':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'retire':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'manufacture':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'receive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'install':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'inspect':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'retire':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'invalid':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark font-display mb-2">
          QR Code Scanner
        </h1>
        <p className="text-subtle-light dark:text-subtle-dark">
          Scan QR codes to track railway fittings and update their status
        </p>
      </div>

      {/* Scanner Section */}
      <Card>
        <CardHeader 
          title="QR Code Scanner" 
          subtitle="Position the QR code within the camera view"
        >
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">
              <Camera className="h-3 w-3 mr-1" />
              Live Scan
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScanning(!isScanning)}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Stop Scanner
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Start Scanner
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isScanning && (
              <div className="relative">
                <Scanner
                  onDecode={handleScan}
                  onError={(error) => {
                    console.error('Scanner error:', error);
                    setError('Camera access denied or scanner error');
                  }}
                  components={{
                    audio: false,
                    finder: true,
                    tracker: true
                  }}
                  styles={{
                    container: {
                      width: '100%',
                      height: '300px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden'
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg opacity-50"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-danger-light/10 border border-danger-light/20 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-danger-light mr-2" />
                  <span className="text-danger-light">{error}</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-subtle-light dark:text-subtle-dark">Processing QR code...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scan Results */}
      {scanResult && (
        <>
          {/* Part Information */}
          <Card>
            <CardHeader 
              title="Part Information" 
              subtitle="Details from scanned QR code"
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(verificationStatus)}
                <Badge className={verificationStatus === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}>
                  {verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Part ID
                    </label>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark font-mono">
                      {scanResult.partId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Vendor ID
                    </label>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      {scanResult.vendorId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Lot ID
                    </label>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      {scanResult.lotId}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Manufacture Date
                    </label>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      {new Date(scanResult.manufactureDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Material
                    </label>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      {scanResult.specifications.material || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Blockchain Hash
                    </label>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark font-mono break-all">
                      {scanResult.partHash}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Part History Timeline */}
          <Card>
            <CardHeader title="Part History" subtitle="Complete lifecycle timeline">
              <Badge variant="default" size="sm">
                <Calendar className="h-3 w-3 mr-1" />
                {partHistory.length} Events
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partHistory.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border-light dark:bg-border-dark"></div>
                    <div className="space-y-6">
                      {partHistory.map((event, index) => (
                        <div key={index} className="relative flex items-start">
                          <div className="absolute left-3 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                            {getEventIcon(event.eventType)}
                          </div>
                          <div className="ml-12 pt-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground-light dark:text-foreground-dark capitalize">
                                {event.eventType.replace('_', ' ')}
                              </h4>
                              <Badge className={getEventColor(event.eventType)} size="sm">
                                {event.verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-sm text-subtle-light dark:text-subtle-dark mb-2">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                            {Object.keys(event.data).length > 0 && (
                              <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-3 text-xs">
                                <pre className="text-subtle-light dark:text-subtle-dark">
                                  {JSON.stringify(event.data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-subtle-light dark:text-subtle-dark">No history found for this part</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Forms */}
          <Card>
            <CardHeader title="Update Part Status" subtitle="Perform actions on the scanned part">
              <Badge variant="primary" size="sm">
                <Shield className="h-3 w-3 mr-1" />
                Blockchain Actions
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Receive Form */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Receive at Depot
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Depot ID
                      </label>
                      <input
                        type="text"
                        value={receiptForm.depotId}
                        onChange={(e) => setReceiptForm(prev => ({ ...prev, depotId: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                        placeholder="DEPOT-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Officer ID
                      </label>
                      <input
                        type="text"
                        value={receiptForm.officerId}
                        onChange={(e) => setReceiptForm(prev => ({ ...prev, officerId: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                        placeholder="OFFICER-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={receiptForm.location}
                        onChange={(e) => setReceiptForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                        placeholder="Storage Area A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Condition
                      </label>
                      <select
                        value={receiptForm.condition}
                        onChange={(e) => setReceiptForm(prev => ({ ...prev, condition: e.target.value as 'good' | 'damaged' | 'rejected' }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                      >
                        <option value="good">Good</option>
                        <option value="damaged">Damaged</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAction('receive')}
                    disabled={actionLoading || !receiptForm.depotId || !receiptForm.officerId}
                    size="sm"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Received
                      </>
                    )}
                  </Button>
                </div>

                {/* Install Form */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-500" />
                    Install on Track
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Engineer ID
                      </label>
                      <input
                        type="text"
                        value={installForm.engineerId}
                        onChange={(e) => setInstallForm(prev => ({ ...prev, engineerId: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                        placeholder="ENG-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Track Section
                      </label>
                      <input
                        type="text"
                        value={installForm.trackSection}
                        onChange={(e) => setInstallForm(prev => ({ ...prev, trackSection: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                        placeholder="A-12-B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={installForm.latitude}
                        onChange={(e) => setInstallForm(prev => ({ ...prev, latitude: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                        placeholder="19.0760"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={installForm.longitude}
                        onChange={(e) => setInstallForm(prev => ({ ...prev, longitude: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                        placeholder="72.8777"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAction('install')}
                    disabled={actionLoading || !installForm.engineerId || !installForm.trackSection}
                    size="sm"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Mark as Installed
                      </>
                    )}
                  </Button>
                </div>

                {/* Inspect Form */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                  <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-3 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-yellow-500" />
                    Inspect Part
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Inspector ID
                      </label>
                      <input
                        type="text"
                        value={inspectForm.inspectorId}
                        onChange={(e) => setInspectForm(prev => ({ ...prev, inspectorId: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                        placeholder="INS-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Result Code
                      </label>
                      <select
                        value={inspectForm.resultCode}
                        onChange={(e) => setInspectForm(prev => ({ ...prev, resultCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                      >
                        <option value="0">Pass</option>
                        <option value="1">Fail</option>
                        <option value="2">Conditional</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Defect Type
                      </label>
                      <input
                        type="text"
                        value={inspectForm.defectType}
                        onChange={(e) => setInspectForm(prev => ({ ...prev, defectType: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                        placeholder="Wear, Crack, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                        Severity
                      </label>
                      <select
                        value={inspectForm.severity}
                        onChange={(e) => setInspectForm(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm"
                      >
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                        <option value="4">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Notes
                    </label>
                    <textarea
                      value={inspectForm.notes}
                      onChange={(e) => setInspectForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark text-sm h-20 resize-none"
                      placeholder="Additional inspection notes..."
                    />
                  </div>
                  <Button
                    onClick={() => handleAction('inspect')}
                    disabled={actionLoading || !inspectForm.inspectorId}
                    size="sm"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Record Inspection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}