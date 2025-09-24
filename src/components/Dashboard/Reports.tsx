import { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  RefreshCw, 
  Wrench, 
  CheckCircle, 
  Construction,
  FileText, 
  X,
  Calendar,
  QrCode as QrCode2,
  AlertTriangle,
  Download,
  MapPin,
  Clock,
  Eye,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, onSnapshot, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { RealTimeChart } from '../ui/RealTimeChart';

interface ReportData {
  id: string;
  title: string;
  type: 'summary' | 'detailed' | 'analytics';
  category: string;
  generatedAt: Date;
  period: string;
  status: 'ready' | 'generating' | 'failed';
  downloadUrl?: string;
}

interface RealTimeData {
  totalTransactions: number;
  inspectionsPassed: number;
  inspectionsFailed: number;
  inspectionsPending: number;
  vendorsActive: number;
  partsRegistered: number;
  partsInstalled: number;
  partsRetired: number;
  lastUpdate: Date;
}

interface PartDetails {
  id: string;
  qrCode: string;
  partType: string;
  vendor: string;
  lotNumber: string;
  manufactureDate: string;
  supplyDate: string;
  warranty: string;
  batchId: string;
  serialNumber: string;
  poNumber: string;
  currentStatus: string;
  statusColor: string;
  events: Array<{
    id: string;
    title: string;
    timestamp: string;
    description: string;
    icon: string;
    transactionId?: string;
    attachment?: string;
  }>;
}

export function Reports() {
  const { t } = useLanguage();
  const [, setReports] = useState<ReportData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    totalTransactions: 0,
    inspectionsPassed: 0,
    inspectionsFailed: 0,
    inspectionsPending: 0,
    vendorsActive: 0,
    partsRegistered: 0,
    partsInstalled: 0,
    partsRetired: 0,
    lastUpdate: new Date()
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState<PartDetails | null>(null);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [activeFilter, setActiveFilter] = useState('Total Parts');
  const [dateRange, setDateRange] = useState('2023-10-01 to 2023-10-31');
  const [reportFormat, setReportFormat] = useState('json');

  // Section refs for smooth scroll
  const vendorsSectionRef = useRef<HTMLDivElement | null>(null);
  const inspectionsSectionRef = useRef<HTMLDivElement | null>(null);
  const failureSectionRef = useRef<HTMLDivElement | null>(null);
  const partsSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Micro-viz data
  const [vendorsCompliant, setVendorsCompliant] = useState(0);
  const [vendorsFlagged, setVendorsFlagged] = useState(0);
  const [partsTrend, setPartsTrend] = useState<number[]>([]); // last 30 days totals
  const [failureTrend, setFailureTrend] = useState<number[]>([]); // last 30 days failureRate

  // Report generation functions
  const handleGenerateReport = (type: string) => {
    setReportType(type);
    setShowReportModal(true);
  };

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a comprehensive report
      const reportData = {
        reportType: type,
        dateRange,
        generatedAt: new Date().toISOString(),
        summary: {
          totalTransactions: realTimeData.totalTransactions,
          inspectionsPassed: realTimeData.inspectionsPassed,
          inspectionsFailed: realTimeData.inspectionsFailed,
          inspectionsPending: realTimeData.inspectionsPending,
          vendorsActive: realTimeData.vendorsActive,
          partsRegistered: realTimeData.partsRegistered,
          partsInstalled: realTimeData.partsInstalled,
          partsRetired: realTimeData.partsRetired
        },
        details: {
          inspectionRate: ((realTimeData.inspectionsPassed / (realTimeData.inspectionsPassed + realTimeData.inspectionsFailed)) * 100).toFixed(2) + '%',
          partsUtilization: ((realTimeData.partsInstalled / realTimeData.partsRegistered) * 100).toFixed(2) + '%',
          vendorPerformance: 'Active',
          lastUpdate: realTimeData.lastUpdate.toISOString()
        },
        metadata: {
          generatedBy: 'RailTrace Admin Dashboard',
          version: '2.0.0',
          system: 'Blockchain-based Railway Parts Tracking'
        }
      };
      
      // Generate and download the report based on format
      const format = reportFormat;
      let blob: Blob;
      let filename: string;
      
      switch (format) {
        case 'csv':
          const csvContent = `Report Type,Date Range,Generated At,Total Transactions,Inspections Passed,Inspections Failed,Inspections Pending,Vendors Active,Parts Registered,Parts Installed,Parts Retired
${type},${dateRange},${reportData.generatedAt},${reportData.summary.totalTransactions},${reportData.summary.inspectionsPassed},${reportData.summary.inspectionsFailed},${reportData.summary.inspectionsPending},${reportData.summary.vendorsActive},${reportData.summary.partsRegistered},${reportData.summary.partsInstalled},${reportData.summary.partsRetired}`;
          blob = new Blob([csvContent], { type: 'text/csv' });
          filename = `${type.toLowerCase().replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'excel':
          // For Excel, we'll use JSON format that can be imported
          blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/vnd.ms-excel' });
          filename = `${type.toLowerCase().replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        default:
          blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
          filename = `${type.toLowerCase().replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.json`;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePartClick = () => {
    setSelectedPart(mockPartDetails);
    setShowPartModal(true);
  };

  // Real-time data updates via Firestore
  useEffect(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Vendors active + compliant/flagged distribution
    const unsubVendors = onSnapshot(
      query(collection(db, 'vendors'), where('active', '==', true)),
      (snap) => {
        let compliant = 0; let flagged = 0;
        snap.forEach(doc => {
          const d = doc.data() as any;
          const status = (d.status || '').toLowerCase();
          if (status === 'compliant') compliant++;
          else if (status === 'flagged') flagged++;
        });
        setVendorsCompliant(compliant);
        setVendorsFlagged(flagged);
        setRealTimeData(prev => ({ ...prev, vendorsActive: snap.size, lastUpdate: new Date() }));
      }
    );

    // Inspections today, pass/fail
    const unsubInspections = onSnapshot(
      query(
        collection(db, 'inspections'),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<', Timestamp.fromDate(endOfDay))
      ),
      (snap) => {
        let passed = 0; let failed = 0; let pending = 0;
        snap.forEach(doc => {
          const d = doc.data() as any;
          const status = (d.status || '').toLowerCase();
          if (status === 'pass' || status === 'passed' || status === 'success') passed++;
          else if (status === 'fail' || status === 'failed') failed++;
          else pending++;
        });
        setRealTimeData(prev => ({
          ...prev,
          inspectionsPassed: passed,
          inspectionsFailed: failed,
          inspectionsPending: pending,
          lastUpdate: new Date()
        }));
      }
    );

    // Recent transactions (live)
    const unsubTx = onSnapshot(
      query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(10)),
      (snap) => {
        const txs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setRecentTransactions(txs);
      }
    );

    // Parts daily stats for sparkline (expects docs with field 'total')
    const unsubPartsTrend = onSnapshot(
      query(collection(db, 'partsDailyStats'), orderBy('date', 'asc'), limit(30)),
      (snap) => {
        const arr = snap.docs.map(d => ((d.data() as any).total as number) || 0);
        setPartsTrend(arr);
      }
    );

    // Failure rate trend (expects docs with field 'failureRate')
    const unsubFailureTrend = onSnapshot(
      query(collection(db, 'inspectionDailyStats'), orderBy('date', 'asc'), limit(30)),
      (snap) => {
        const arr = snap.docs.map(d => Math.max(0, Math.min(100, Number((d.data() as any).failureRate) || 0)));
        setFailureTrend(arr);
      }
    );

    return () => {
      unsubVendors();
      unsubInspections();
      unsubTx();
      unsubPartsTrend();
      unsubFailureTrend();
    };
  }, []);

  // Mock data for demonstration
  const mockPartDetails: PartDetails = {
    id: '1',
    qrCode: 'RAIL-QR-12345678',
    partType: 'Wheel Set',
    vendor: 'Tata Steel',
    lotNumber: 'LN2023-001',
    manufactureDate: '2023-01-15',
    supplyDate: '2023-02-20',
    warranty: '12 Months',
    batchId: 'B2023-001',
    serialNumber: 'SN-2023-0001',
    poNumber: 'PO-2023-0001',
    currentStatus: 'In Transit',
    statusColor: 'success',
    events: [
      {
        id: '1',
        title: 'Part Manufactured',
        timestamp: 'Jan 15, 2023, 10:30 AM',
        description: 'Part manufactured and quality checked',
        icon: 'construction',
        transactionId: 'TRX12345'
      },
      {
        id: '2',
        title: 'Part Supplied',
        timestamp: 'Feb 20, 2023, 02:00 PM',
        description: 'Part supplied to depot',
        icon: 'local_shipping',
        attachment: 'invoice.pdf'
      },
      {
        id: '3',
        title: 'Part Received',
        timestamp: 'Feb 22, 2023, 09:15 AM',
        description: 'Part received at depot',
        icon: 'warehouse'
      },
      {
        id: '4',
        title: 'Part Installed',
        timestamp: 'Mar 1, 2023, 11:30 AM',
        description: 'Part installed on train',
        icon: 'build_circle',
        transactionId: 'TRX12346'
      }
    ]
  };

    const mockReports: ReportData[] = [
      {
        id: '1',
        title: 'Monthly Inspection Summary',
        type: 'summary',
        category: 'inspections',
        generatedAt: new Date(),
        period: 'Last 30 days',
        status: 'ready',
        downloadUrl: '#'
      },
      {
        id: '2',
        title: 'Vendor Performance Analysis',
      type: 'detailed',
        category: 'vendors',
      generatedAt: new Date(),
        period: 'Last 30 days',
        status: 'ready',
        downloadUrl: '#'
      },
      {
        id: '3',
        title: 'Blockchain Audit Report',
      type: 'analytics',
        category: 'blockchain',
      generatedAt: new Date(),
        period: 'Last 7 days',
        status: 'ready',
        downloadUrl: '#'
      },
      {
        id: '4',
        title: 'Quality Control Report',
      type: 'detailed',
        category: 'quality',
      generatedAt: new Date(),
        period: 'Last 30 days',
      status: 'generating',
      downloadUrl: undefined
    }
  ];

  const filterOptions = ['Total Parts', 'Active Vendors', 'Inspections Today', 'Failure Rate'];

  const scrollByFilter = (option: string) => {
    switch (option) {
      case 'Total Parts':
        scrollTo(partsSectionRef);
        break;
      case 'Active Vendors':
        scrollTo(vendorsSectionRef);
        break;
      case 'Inspections Today':
        scrollTo(inspectionsSectionRef);
        break;
      case 'Failure Rate':
        scrollTo(failureSectionRef);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Load available reports list if present
    setReports(mockReports);
  }, []);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-success-light dark:text-success-dark';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-danger-light dark:text-danger-dark';
      default:
        return 'text-subtle-light dark:text-subtle-dark';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success-light/10 dark:bg-success-dark/20';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'failed':
        return 'bg-danger-light/10 dark:bg-danger-dark/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success-light dark:bg-success-dark';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-danger-light dark:bg-danger-dark';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="font-display bg-[#f0f2f5] dark:bg-[#0d1117] min-h-screen">
      <div className="min-h-screen">
        {/* Header - Exact Stitch AI Match */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[#ffffff]/80 dark:bg-[#161b22]/80 backdrop-blur-sm border-b border-[#d0d7de] dark:border-[#30363d]">
          <div></div>
          <h1 className="text-lg font-bold text-[#0d1117] dark:text-[#c9d1d9]">{t('reports.title')}</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#0d1117] dark:text-[#c9d1d9]">
              <QrCode className="h-5 w-5" />
            </button>
            <button 
              onClick={() => {/* refresh handled by onSnapshot; noop */}}
              className="p-2 text-[#0d1117] dark:text-[#c9d1d9] hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="p-4">
          {/* Responsive Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports, vendors, parts, transactions..."
                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-10 py-2.5 text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-subtle-light dark:text-subtle-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>

          {/* Search Results (live filtering) */}
          {searchQuery.trim().length >= 2 && (
            <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Reports results */}
              <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
                <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">Report Matches</h3>
                <div className="space-y-2">
                  {mockReports.filter(r => (
                    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )).slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark">
                      <div>
                        <p className="font-medium text-foreground-light dark:text-foreground-dark">{r.title}</p>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark">{r.period}</p>
                      </div>
                      <button onClick={() => handleGenerateReport(r.title)} className="text-sm text-primary hover:text-primary/80">Generate</button>
                    </div>
                  ))}
                  {mockReports.filter(r => (
                    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )).length === 0 && (
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">No report results</p>
                  )}
                </div>
              </div>

              {/* Transactions results */}
              <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
                <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">Transaction Matches</h3>
                <div className="space-y-2">
                  {recentTransactions.filter(tx => {
                    const q = searchQuery.toLowerCase();
                    const type = String(tx.type || '').toLowerCase();
                    const hash = String(tx.partHash || tx.id || '').toLowerCase();
                    return type.includes(q) || hash.includes(q);
                  }).slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground-light dark:text-foreground-dark truncate">{tx.type || 'Transaction'}</p>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark truncate">{tx.partHash || tx.id}</p>
                      </div>
                      <button onClick={handlePartClick} className="text-sm text-primary hover:text-primary/80">View</button>
                    </div>
                  ))}
                  {recentTransactions.filter(tx => {
                    const q = searchQuery.toLowerCase();
                    const type = String(tx.type || '').toLowerCase();
                    const hash = String(tx.partHash || tx.id || '').toLowerCase();
                    return type.includes(q) || hash.includes(q);
                  }).length === 0 && (
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">No transaction results</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Top Stats with micro-visualizations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {/* Total Parts with sparkline */}
            <button onClick={() => scrollTo(partsSectionRef)} className="bg-card-light dark:bg-card-dark rounded-xl p-3 sm:p-4 shadow-sm border border-token text-left hover:shadow-md transition-shadow min-w-0">
              <p className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">Total Parts</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground-light dark:text-foreground-dark">{realTimeData.partsRegistered.toLocaleString()}</p>
              <div className="mt-2 h-8">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="partsSpark" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {partsTrend.length > 1 ? (
                    <>
                      <path d={(() => {
                        const max = Math.max(...partsTrend);
                        const min = Math.min(...partsTrend);
                        const range = Math.max(1, max - min);
                        return partsTrend.map((v, i) => {
                          const x = (i / (partsTrend.length - 1)) * 100;
                          const y = 28 - ((v - min) / range) * 26;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ');
                      })()} fill="none" stroke="var(--color-success)" strokeWidth="1.5"/>
                      <path d={(() => {
                        const max = Math.max(...partsTrend);
                        const min = Math.min(...partsTrend);
                        const range = Math.max(1, max - min);
                        const d = partsTrend.map((v, i) => {
                          const x = (i / (partsTrend.length - 1)) * 100;
                          const y = 28 - ((v - min) / range) * 26;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ');
                        return `${d} L 100 30 L 0 30 Z`;
                      })()} fill="url(#partsSpark)" />
                    </>
                  ) : (
                    <rect x="0" y="14" width="100" height="2" className="fill-primary/10" />
                  )}
                </svg>
              </div>
            </button>

            {/* Active Vendors with donut */}
            <button onClick={() => scrollTo(vendorsSectionRef)} className="bg-card-light dark:bg-card-dark rounded-xl p-3 sm:p-4 shadow-sm border border-token text-left hover:shadow-md transition-shadow min-w-0">
              <p className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">Active Vendors</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xl sm:text-2xl font-bold text-foreground-light dark:text-foreground-dark">{realTimeData.vendorsActive.toLocaleString()}</p>
                <svg width="40" height="40" viewBox="0 0 36 36" className="shrink-0">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-border)" strokeWidth="3" />
                  {(() => {
                    const total = Math.max(1, vendorsCompliant + vendorsFlagged);
                    const comp = Math.round((vendorsCompliant / total) * 100);
                    const flag = 100 - comp;
                    return (
                      <>
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeDasharray={`${comp}, 100`} strokeLinecap="round" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-warning)" strokeWidth="3" strokeDasharray={`${flag}, 100`} strokeDashoffset={-comp} strokeLinecap="round" />
                      </>
                    );
                  })()}
                </svg>
              </div>
              <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark truncate">Compliant {vendorsCompliant} · Flagged {vendorsFlagged}</p>
            </button>

            {/* Inspections Today with progress circle */}
            <button onClick={() => scrollTo(inspectionsSectionRef)} className="bg-card-light dark:bg-card-dark rounded-xl p-3 sm:p-4 shadow-sm border border-token text-left hover:shadow-md transition-shadow min-w-0">
              <p className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">Inspections Today</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xl sm:text-2xl font-bold text-foreground-light dark:text-foreground-dark">{(realTimeData.inspectionsPassed + realTimeData.inspectionsFailed + realTimeData.inspectionsPending).toLocaleString()}</p>
                <div className="relative flex items-center justify-center" style={{width: 40, height: 40}}>
                  {(() => {
                    const total = realTimeData.inspectionsPassed + realTimeData.inspectionsFailed + realTimeData.inspectionsPending;
                    const completed = realTimeData.inspectionsPassed + realTimeData.inspectionsFailed;
                    const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
                    return (
                      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-border)" strokeWidth="3"></circle>
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-primary)" strokeDasharray={`${pct}, 100`} strokeLinecap="round" strokeWidth="3"></circle>
                      </svg>
                    );
                  })()}
                  <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{(() => {
                    const total = realTimeData.inspectionsPassed + realTimeData.inspectionsFailed + realTimeData.inspectionsPending;
                    const completed = realTimeData.inspectionsPassed + realTimeData.inspectionsFailed;
                    const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
                    return `${pct}%`;
                  })()}</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-subtle-light dark:text-subtle-dark truncate">Completed {realTimeData.inspectionsPassed + realTimeData.inspectionsFailed}</p>
            </button>

            {/* Failure Rate with mini area */}
            <button onClick={() => scrollTo(failureSectionRef)} className="bg-card-light dark:bg-card-dark rounded-xl p-3 sm:p-4 shadow-sm border border-token text-left hover:shadow-md transition-shadow min-w-0">
              <p className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">Failure Rate</p>
              <div className="flex items-center gap-1 text-danger-light dark:text-danger-dark">
                <p className="text-xl sm:text-2xl font-bold">{(() => {
                  const total = realTimeData.inspectionsPassed + realTimeData.inspectionsFailed;
                  const rate = total > 0 ? (realTimeData.inspectionsFailed / total) * 100 : 0;
                  return `${rate.toFixed(1)}%`;
                })()}</p>
                <span className="material-symbols-outlined text-base">arrow_upward</span>
              </div>
              <div className="mt-2 h-8">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d={(() => {
                    const arr = failureTrend.length > 1 ? failureTrend : [0,0,0];
                    const d = arr.map((v, i) => {
                      const x = (i / (arr.length - 1)) * 100;
                      const y = 30 - (v / 100) * 28;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ');
                    return d;
                  })()} fill="none" stroke="var(--color-danger)" strokeWidth="1.5" />
                  <path d={(() => {
                    const arr = failureTrend.length > 1 ? failureTrend : [0,0,0];
                    const d = arr.map((v, i) => {
                      const x = (i / (arr.length - 1)) * 100;
                      const y = 30 - (v / 100) * 28;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ');
                    return `${d} L 100 30 L 0 30 Z`;
                  })()} fill="var(--color-danger)" fillOpacity="0.1" />
                </svg>
              </div>
            </button>
          </div>
          {/* Filter Chips - Exact Stitch AI Match */}
          <div className="flex pb-4 -mx-4 overflow-x-auto scrolling-touch">
            <div className="flex flex-nowrap gap-2 px-4">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => { setActiveFilter(option); scrollByFilter(option); }}
                  className={`px-4 py-2 text-sm font-medium rounded-full shrink-0 ${
                    activeFilter === option
                      ? 'bg-[#1773cf]/10 text-[#1773cf] dark:bg-[#1773cf]/20 dark:text-[#1773cf]'
                      : 'bg-[#ffffff] dark:bg-[#161b22] text-[#57606a] dark:text-[#8b949e]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Vendors Section Anchor */}
            <div ref={partsSectionRef} style={{ scrollMarginTop: 80 }}></div>
            <div ref={vendorsSectionRef} style={{ scrollMarginTop: 80 }}></div>
            {/* Lifecycle Timeline - Exact Stitch AI Match */}
            <div className="p-4 overflow-hidden bg-[#ffffff] dark:bg-[#161b22] rounded-lg border border-[#d0d7de] dark:border-[#30363d]">
              <p className="text-sm font-medium text-[#57606a] dark:text-[#8b949e]">Lifecycle Timeline</p>
              <h2 className="text-xl font-bold text-[#0d1117] dark:text-[#c9d1d9]">Part Lifecycle</h2>
              <p className="mb-4 text-sm text-[#57606a] dark:text-[#8b949e]">Track the journey of parts from installation to maintenance.</p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center rounded-full size-8 bg-[#1773cf] text-white">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="w-0.5 h-8 bg-[#1773cf]/30"></div>
                  </div>
                  <p className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">
                    Installed: <span className="font-normal text-[#57606a] dark:text-[#8b949e]">{realTimeData.partsInstalled.toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center rounded-full size-8 bg-[#1773cf] text-white">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="w-0.5 h-8 bg-[#1773cf]/30"></div>
                  </div>
                  <p className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">
                    Inspected: <span className="font-normal text-[#57606a] dark:text-[#8b949e]">{realTimeData.inspectionsPassed.toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center rounded-full size-8 bg-[#1773cf] text-white">
                      <Construction className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">
                    Maintained: <span className="font-normal text-[#57606a] dark:text-[#8b949e]">300</span>
                  </p>
                </div>
              </div>
      </div>

            {/* Charts Grid - Real-time */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Inspections Today Breakdown */}
              <div ref={inspectionsSectionRef} style={{ scrollMarginTop: 80 }} className="p-4 bg-card-light dark:bg-card-dark rounded-lg">
                <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">Inspections Today</h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Pass / Fail / Pending</p>
                <div className="h-40 mt-4">
                  <RealTimeChart
                    collectionName="inspections"
                    dataField="status"
                    labelField="createdAt"
                    maxDataPoints={30}
                    height={160}
                    color="#1773cf"
                    showTooltip={true}
                    showDrillDown={true}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Failure Rate Trend */}
              <div ref={failureSectionRef} style={{ scrollMarginTop: 80 }} className="p-4 bg-card-light dark:bg-card-dark rounded-lg">
                <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">Failure Rate</h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Last 30 Days</p>
                <div className="h-40 mt-4">
                  <RealTimeChart
                    collectionName="inspectionDailyStats"
                    dataField="failureRate"
                    labelField="date"
                    maxDataPoints={30}
                    height={160}
                    color="#ef4444"
                    showTooltip={true}
                    showDrillDown={false}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Vendors Activity */}
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg">
              <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">Active Vendors</h3>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Realtime Activity</p>
              <div className="h-40 mt-4">
                <RealTimeChart
                  collectionName="vendorActivity"
                  dataField="count"
                  labelField="timestamp"
                  maxDataPoints={50}
                  height={160}
                  color="#22c55e"
                  showTooltip={true}
                  showDrillDown={false}
                  className="w-full"
                />
              </div>
              <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg">
                {/* placeholder for additional charts if needed */}
              </div>
      </div>

            {/* Geographic Distribution */}
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg">
              <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">Geographic Distribution</h3>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Parts by Region</p>
              <div className="h-48 mt-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Map visualization would go here</p>
                </div>
              </div>
      </div>

            {/* Anomalies & Alerts */}
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg">
              <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">Anomalies & Alerts</h3>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Recent Issues</p>
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-danger-light/10 dark:bg-danger-dark/20">
                  <AlertTriangle className="h-5 w-5 text-danger-light dark:text-danger-dark" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground-light dark:text-foreground-dark">High Vibration Detected</p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Wheel Set #WS-001</p>
                  </div>
                  <span className="text-xs font-medium text-danger-light dark:text-danger-dark">Critical</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground-light dark:text-foreground-dark">Maintenance Due</p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Brake System #BS-002</p>
                  </div>
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Warning</span>
                </div>
              </div>
            </div>

            {/* Available Reports */}
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">Available Reports</h3>
                <button 
                  onClick={() => handleGenerateReport('Custom')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg"
                >
                      <FileText className="h-4 w-4" />
                  Generate New
                </button>
              </div>
              <div className="space-y-3">
                {mockReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
            </div>
            <div>
                        <p className="font-medium text-foreground-light dark:text-foreground-dark">{report.title}</p>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">{report.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'ready' 
                          ? 'bg-success-light/10 text-success-light dark:bg-success-dark/20 dark:text-success-dark'
                          : report.status === 'generating'
                          ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-danger-light/10 text-danger-light dark:bg-danger-dark/20 dark:text-danger-dark'
                      }`}>
                        {report.status}
                      </span>
                      {report.status === 'ready' && (
                        <button className="p-2 text-subtle-light dark:text-subtle-dark hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg">
              <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">Recent Activity</h3>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Latest Transactions</p>
              <div className="space-y-3 mt-4">
                {recentTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    onClick={handlePartClick}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                        <Eye className="h-5 w-5" />
            </div>
            <div>
                        <p className="font-medium text-foreground-light dark:text-foreground-dark">{tx.type}</p>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">{tx.partHash}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBgColor(tx.status)} ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                      <ChevronRight className="h-4 w-4 text-subtle-light dark:text-subtle-dark" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Part Details Modal - Exact Stitch AI Match */}
        {showPartModal && selectedPart && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
            <div className="flex animate-slide-up flex-col rounded-t-xl bg-background-light dark:bg-background-dark w-full max-h-[90vh]">
              <div className="flex h-12 w-full flex-col items-center justify-center p-2">
                <div className="h-1.5 w-10 rounded-full bg-border-light dark:bg-border-dark"></div>
              </div>
              <div className="flex items-center justify-between border-b border-border-light px-4 pb-4 dark:border-border-dark">
                <div className="w-8"></div>
                <h1 className="text-lg font-bold text-content-light dark:text-content-dark">Part Details</h1>
                <button 
                  onClick={() => setShowPartModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 pb-20">
                <section className="mb-6">
                  <h2 className="mb-3 text-base font-bold text-content-light dark:text-content-dark">Part Summary</h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-border-light bg-surface-light p-4 dark:border-border-dark dark:bg-surface-dark">
                    <div className="col-span-2 flex items-center gap-3 py-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <QrCode2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">QR Code</p>
                        <p className="font-semibold text-content-light dark:text-content-dark">{selectedPart.qrCode}</p>
                      </div>
                    </div>
                    <div className="py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">Part Type</p>
                      <p className="font-medium text-content-light dark:text-content-dark">{selectedPart.partType}</p>
                    </div>
                    <div className="py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">Vendor</p>
                      <p className="font-medium text-content-light dark:text-content-dark">{selectedPart.vendor}</p>
                    </div>
                    <div className="py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">Lot Number</p>
                      <p className="font-medium text-content-light dark:text-content-dark">{selectedPart.lotNumber}</p>
                    </div>
                    <div className="py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">Manufacture Date</p>
                      <p className="font-medium text-content-light dark:text-content-dark">{selectedPart.manufactureDate}</p>
                    </div>
                    <div className="py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">Supply Date</p>
                      <p className="font-medium text-content-light dark:text-content-dark">{selectedPart.supplyDate}</p>
                    </div>
                    <div className="py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">Warranty</p>
                      <p className="font-medium text-content-light dark:text-content-dark">{selectedPart.warranty}</p>
                    </div>
                    <div className="py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">Batch ID</p>
                      <p className="font-medium text-content-light dark:text-content-dark">{selectedPart.batchId}</p>
                    </div>
                    <div className="py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">Serial Number</p>
                      <p className="font-medium text-content-light dark:text-content-dark">{selectedPart.serialNumber}</p>
                    </div>
                    <div className="col-span-2 py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">PO Number</p>
                      <p className="font-medium text-content-light dark:text-content-dark">{selectedPart.poNumber}</p>
                    </div>
                    <div className="col-span-2 py-2">
                      <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">Current Status</p>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${getStatusBgColor(selectedPart.statusColor)} ${getStatusColor(selectedPart.statusColor)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotColor(selectedPart.statusColor)}`}></span>
                        {selectedPart.currentStatus}
                      </span>
                    </div>
          </div>
                </section>

                <section className="mb-6">
                  <h2 className="mb-3 text-base font-bold text-content-light dark:text-content-dark">Event Timeline</h2>
                  <div>
                    {selectedPart.events.map((event, index) => (
                      <div key={event.id} className="relative flex items-start gap-4 pl-1">
                        {index < selectedPart.events.length - 1 && (
                          <div className="absolute left-[19px] top-[19px] h-full w-0.5 bg-border-light dark:bg-border-dark"></div>
                        )}
                        <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface-light ring-4 ring-background-light dark:bg-surface-dark dark:ring-background-dark">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                            <span className="material-symbols-outlined text-lg">{event.icon}</span>
                          </div>
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p className="font-semibold text-content-light dark:text-content-dark">{event.title}</p>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">{event.timestamp}</p>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">{event.description}</p>
                          {event.transactionId && (
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">
                              Transaction ID: <a className="text-primary" href="#">{event.transactionId}</a>
                            </p>
                          )}
                          {event.attachment && (
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">
                              Attachment: <a className="text-primary" href="#">{event.attachment}</a>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="pointer-events-none fixed bottom-0 left-0 w-full bg-gradient-to-t from-background-light to-transparent dark:from-background-dark">
                <div className="pointer-events-auto border-t border-border-light bg-background-light/80 p-4 backdrop-blur-sm dark:border-border-dark dark:bg-background-dark/80">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowPartModal(false)}
                      className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border-light bg-surface-light text-sm font-semibold text-content-light dark:border-border-dark dark:bg-surface-dark dark:text-content-dark"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => {
                        setShowPartModal(false);
                        handleGenerateReport('Part Details');
                      }}
                      className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white"
                    >
                      <FileText className="h-4 w-4" />
                      Generate Report
                    </button>
                  </div>
                </div>
      </div>
            </div>
          </div>
        )}

        {/* Generate Report Modal - Exact Stitch AI Match */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
            <div className="flex animate-slide-up flex-col rounded-t-xl bg-background-light dark:bg-background-dark w-full max-h-[90vh]">
              <div className="flex h-12 w-full flex-col items-center justify-center p-2">
                <div className="h-1.5 w-10 rounded-full bg-border-light dark:bg-border-dark"></div>
              </div>
              <div className="flex items-center justify-between border-b border-border-light px-4 pb-4 dark:border-border-dark">
                <div className="w-8"></div>
                <h1 className="text-lg font-bold text-content-light dark:text-content-dark">Generate Report</h1>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 pb-20">
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark" htmlFor="scope">Scope</label>
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-background-light p-1 dark:bg-background-dark">
                      <button className="rounded-md bg-primary py-2 text-sm font-semibold text-white">All</button>
                      <button className="rounded-md py-2 text-sm font-medium text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5">Filtered</button>
                      <button className="rounded-md py-2 text-sm font-medium text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5">QR</button>
                    </div>
                    </div>
                    <div>
                    <label className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark" htmlFor="date-range">Date Range</label>
                    <div className="relative">
                      <input 
                        className="w-full rounded-lg border-border-light bg-surface-light p-3 text-content-light focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-surface-dark dark:text-content-dark" 
                        id="date-range" 
                        placeholder="Select date range" 
                        type="text" 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        readOnly
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-subtle-light dark:text-subtle-dark" />
                    </div>
                      </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark" htmlFor="format">Format</label>
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-background-light p-1 dark:bg-background-dark">
                      <button 
                        onClick={() => setReportFormat('json')}
                        className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                          reportFormat === 'json' 
                            ? 'bg-primary text-white' 
                            : 'text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5'
                        }`}
                      >
                        JSON
                      </button>
                      <button 
                        onClick={() => setReportFormat('csv')}
                        className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                          reportFormat === 'csv' 
                            ? 'bg-primary text-white' 
                            : 'text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5'
                        }`}
                      >
                        CSV
                      </button>
                      <button 
                        onClick={() => setReportFormat('excel')}
                        className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                          reportFormat === 'excel' 
                            ? 'bg-primary text-white' 
                            : 'text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5'
                        }`}
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-content-light dark:text-content-dark" htmlFor="blockchain-details">Include blockchain tx details?</label>
                    <button 
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" 
                      role="switch"
                    >
                      <span className="sr-only">Include blockchain tx details</span>
                      <span className="pointer-events-none inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark" htmlFor="schedule">Schedule</label>
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-background-light p-1 dark:bg-background-dark">
                      <button className="rounded-md bg-primary py-2 text-sm font-semibold text-white">Off</button>
                      <button className="rounded-md py-2 text-sm font-medium text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5">Daily</button>
                      <button className="rounded-md py-2 text-sm font-medium text-subtle-light hover:bg-black/5 dark:text-subtle-dark dark:hover:bg-white/5">Weekly</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none fixed bottom-0 left-0 w-full bg-gradient-to-t from-background-light to-transparent dark:from-background-dark">
                <div className="pointer-events-auto border-t border-border-light bg-background-light/80 p-4 backdrop-blur-sm dark:border-border-dark dark:bg-background-dark/80">
                  <button 
                    onClick={() => generateReport(reportType)}
                    disabled={isGenerating}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            </div>
            </div>
          )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slide-up {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
          .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
          .overflow-x-auto {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `
      }} />
    </div>
  );
}