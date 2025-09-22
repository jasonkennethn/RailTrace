import { useState, useEffect, startTransition } from 'react';
import { 
  CheckCircle,
  AlertTriangle, 
  Shield,
  ArrowUp
} from 'lucide-react';
import { geminiService, VendorAnalysis } from '../../config/gemini';
import { collection, onSnapshot, orderBy, limit, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { blockchainService, BlockchainEvent } from '../../services/blockchainService';
import { useLanguage } from '../../contexts/LanguageContext';
import { RealTimeChart } from '../ui/RealTimeChart';
import { RealTimeNotifications } from '../ui/RealTimeNotifications';
import { SmoothPageTransition } from '../ui/SmoothNavigation';
import { useOptimizedRealTimeUpdates } from '../../services/performanceService';

export function AdminDashboard() {
  const { t } = useLanguage();
  const [vendorAnalysis, setVendorAnalysis] = useState<VendorAnalysis[]>([]);
  const [stats, setStats] = useState<{ fittings?: number; pending?: number; critical?: number; records?: number }>({});
  const [recentEvents, setRecentEvents] = useState<BlockchainEvent[]>([]);
  const [fittingsTrend, setFittingsTrend] = useState<number[]>([]);
  const [criticalTrend, setCriticalTrend] = useState<number[]>([]);
  const [recordsTrend, setRecordsTrend] = useState<number[]>([]);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [liveEvents, setLiveEvents] = useState<Array<{
    id: string;
    source: 'mock' | 'firestore' | 'blockchain';
    title: string;
    subtitle: string;
    status: 'confirmed' | 'pending' | 'failed' | 'info';
    createdAt: Date;
  }>>([]);
  
  // Performance optimizations
  const { data: optimizedLiveEvents } = useOptimizedRealTimeUpdates(liveEvents, 1000, 20);

  useEffect(() => {
    const load = async () => {
      try {
        // Load real-time stats from Firestore
        const statsQuery = query(collection(db, 'analytics'), orderBy('timestamp', 'desc'), limit(1));
        const statsSnapshot = await getDocs(statsQuery);
        let realStats: { fittings: number; pending: number; critical: number; records: number } = {
          fittings: 0,
          pending: 0,
          critical: 0,
          records: 0
        };
        
        if (!statsSnapshot.empty) {
          const latestStats = statsSnapshot.docs[0].data() as any;
          realStats = {
            fittings: latestStats.totalFittings || 0,
            pending: latestStats.pendingApprovals || 0,
            critical: latestStats.criticalIssues || 0,
            records: latestStats.totalRecords || 0
          };
        }

        // Derive pending approvals count live from users where approved == false OR status == 'pending'
        const pendingQuery = query(
          collection(db, 'users'),
          where('approved', '==', false)
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        let pendingCount = pendingSnapshot.size;

        if (pendingCount === 0) {
          // fallback to status field if schema varies
          const altPendingQuery = query(
            collection(db, 'users'),
            where('status', '==', 'pending')
          );
          const altPendingSnapshot = await getDocs(altPendingQuery);
          pendingCount = altPendingSnapshot.size;
        }

        realStats.pending = pendingCount;
        setStats(realStats);

        // Load real-time live events from Firestore
        const eventsQuery = query(collection(db, 'liveEvents'), orderBy('createdAt', 'desc'), limit(10));
        const eventsSnapshot = await getDocs(eventsQuery);
        let realLiveEvents: Array<{
          id: string;
          source: 'firestore';
          title: string;
          subtitle: string;
          status: 'confirmed' | 'pending' | 'failed' | 'info';
          createdAt: Date;
        }> = [];
        
        if (!eventsSnapshot.empty) {
          realLiveEvents = eventsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              source: 'firestore' as const,
              title: data.title || 'Event',
              subtitle: data.subtitle || 'System Update',
              status: (data.status as 'confirmed' | 'pending' | 'failed' | 'info') || 'info',
              createdAt: data.createdAt?.toDate() || new Date()
            };
          });
        }
        setLiveEvents(realLiveEvents);

        // Load vendor analysis from real data
        const analysis = await geminiService.analyzeVendorPerformance(realLiveEvents);
        setVendorAnalysis(analysis);

        // Load recent blockchain events
        const events = await blockchainService.getRecentEvents();
        console.log('📊 Loaded blockchain events:', events.length, events);
        setRecentEvents(events);

        } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    load();
  }, []);

  // Real-time updates
  useEffect(() => {
    // Subscribe to 'events' collection
    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(10)),
      (snapshot) => {
        const events = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            source: 'firestore' as const,
            title: d.title || 'Event',
            subtitle: d.subtitle || 'System Update',
            status: (d.status as 'confirmed' | 'pending' | 'failed' | 'info') || 'info',
            createdAt: d.createdAt?.toDate?.() || new Date()
          };
        });

        setLiveEvents(prev => {
          const nonFs = prev.filter(e => e.source !== 'firestore');
          const combined = [...events, ...nonFs];
          return combined.slice(0, 10);
        });
      }
    );

    // Also subscribe to 'liveEvents' if used elsewhere
    const unsubLiveEvents = onSnapshot(
      query(collection(db, 'liveEvents'), orderBy('createdAt', 'desc'), limit(10)),
      (snapshot) => {
        const live = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            source: 'firestore' as const,
            title: d.title || 'Event',
            subtitle: d.subtitle || 'System Update',
            status: (d.status as 'confirmed' | 'pending' | 'failed' | 'info') || 'info',
            createdAt: d.createdAt?.toDate?.() || new Date()
          };
        });

        setLiveEvents(prev => {
          const nonFs = prev.filter(e => e.source !== 'firestore');
          const combined = [...live, ...nonFs];
          return combined.slice(0, 10);
        });
      }
    );

    // Real-time KPI trends (last 30 days)
    const unsubFittings = onSnapshot(
      query(collection(db, 'fittingsDailyStats'), orderBy('date', 'asc'), limit(30)),
      (snap) => {
        setFittingsTrend(snap.docs.map(d => Number((d.data() as any).totalFittings) || 0));
      }
    );
    const unsubCritical = onSnapshot(
      query(collection(db, 'criticalDailyStats'), orderBy('date', 'asc'), limit(30)),
      (snap) => {
        setCriticalTrend(snap.docs.map(d => Number((d.data() as any).criticalIssues) || 0));
      }
    );
    const unsubRecords = onSnapshot(
      query(collection(db, 'recordsDailyStats'), orderBy('date', 'asc'), limit(30)),
      (snap) => {
        setRecordsTrend(snap.docs.map(d => Number((d.data() as any).verifiedRecords) || 0));
      }
    );

    // Real-time users approved count for pending progress
    const unsubUsersApproved = onSnapshot(
      query(collection(db, 'users'), where('approved', '==', true)),
      (snap) => setApprovedCount(snap.size)
    );

    return () => {
      unsubEvents();
      unsubLiveEvents();
      unsubFittings();
      unsubCritical();
      unsubRecords();
      unsubUsersApproved();
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default:
        return <Shield className="h-6 w-6 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/50';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/50';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/50';
      default:
        return 'bg-primary/10';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <SmoothPageTransition>
      <div className="font-display min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root">
        {/* Header - Exact Stitch AI Match */}
        <header className="sticky top-0 z-10 backdrop-blur-sm shadow-sm transform-gpu" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-primary) 80%, transparent)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between p-2.5 sm:p-4 min-h-12 sm:min-h-16 flex-nowrap">
              <div className="flex items-center gap-2 shrink-0">
                <img 
                  alt="Indian Railways Logo" 
                  className="h-7 w-7 sm:h-10 sm:w-10 object-contain" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1twyRXwjo371pDweXtog1UaWqSMFJXQVnZVohBk0PsVJSEj76N2iW1J6rd0Mw_04zGsCl_zhvEhnDf5uXy6JBznCuYQ-LyIWa9-5htLX0TL7ABRV9Tcsms_zJn6-GaN9F342RJ9uiGrIrvqvWpK7MxycThUnhHocwJP-4uPF8DszWYIE9sNeiUrU2dJcS8KXPfbR8VDJhbE4-sTCEdNOUxU78z68xNmbwwUUNb8iN_vGBPfBlazj_SGU5K6F57ur4JcpKGInmVUc0"
                />
                <h1 className="text-lg sm:text-xl font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>RailTrace</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-none sm:animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
                  </span>
                  <span className="hidden sm:inline text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Online</span>
                </div>
                <div className="shrink-0 scale-90 sm:scale-100 origin-center">
                  <RealTimeNotifications />
      </div>
                <button className="shrink-0">
                  <img 
                    alt="User profile" 
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJlWuAbwR4MBLGiOvdbFImCEwktaEWt2XJK0RDhoAZbgfU8uZ_oEVA-Bxijr5Dr0wqMHayW2hCzHsqBf8MJ_RNWnhYscvsE5KhQJxKN9EqMiwEdQsplh4MzdawDNQUUq2IBn601rP4nDy9lv3EYr0WQM6HHp-tyZhOEbS5ZDxJKSVpqOE6NmxhOYYHYCi-HazAdFE7bg2dWMPzu1-w_GHyDudgTti4AtR25kjbuFDiu7vb9HhbraQi7mFe6aPonri-CnsTTDkfxWtT"
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Overview Section - Exact Stitch AI Match */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--color-text-primary)' }}>{t('dashboard.overview')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-shadow border border-token" style={{ backgroundColor: 'var(--color-card)' }}>
                <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t('dashboard.totalFittings')}</p>
                <p className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.fittings?.toLocaleString() || '12,456'}</p>
                <div className="mt-2 h-8">
                  <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="fitGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {fittingsTrend.length > 1 ? (
                      <>
                        <path d={(() => {
                          const max = Math.max(...fittingsTrend);
                          const min = Math.min(...fittingsTrend);
                          const range = Math.max(1, max - min);
                          return fittingsTrend.map((v, i) => {
                            const x = (i / (fittingsTrend.length - 1)) * 100;
                            const y = 28 - ((v - min) / range) * 26;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ');
                        })()} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
                        <path d={(() => {
                          const max = Math.max(...fittingsTrend);
                          const min = Math.min(...fittingsTrend);
                          const range = Math.max(1, max - min);
                          const d = fittingsTrend.map((v, i) => {
                            const x = (i / (fittingsTrend.length - 1)) * 100;
                            const y = 28 - ((v - min) / range) * 26;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ');
                          return `${d} L 100 30 L 0 30 Z`;
                        })()} fill="url(#fitGrad)" />
                      </>
                    ) : (
                      <rect x="0" y="14" width="100" height="2" fill="var(--color-border)" />
                    )}
                  </svg>
                </div>
              </div>
              <div className="rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-shadow border border-token" style={{ backgroundColor: 'var(--color-card)' }}>
                <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t('dashboard.criticalIssues')}</p>
                <p className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--color-danger)' }}>{stats.critical?.toLocaleString?.() || 0}</p>
                <div className="mt-2 h-8">
                  <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d={(() => {
                      const arr = criticalTrend.length > 1 ? criticalTrend : [0,0,0];
                      const max = Math.max(1, ...arr);
                      const d = arr.map((v, i) => {
                        const x = (i / (arr.length - 1)) * 100;
                        const y = 28 - (v / max) * 26;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ');
                      return d;
                    })()} fill="none" stroke="var(--color-danger)" strokeWidth="1.5" />
                    <path d={(() => {
                      const arr = criticalTrend.length > 1 ? criticalTrend : [0,0,0];
                      const max = Math.max(1, ...arr);
                      const d = arr.map((v, i) => {
                        const x = (i / (arr.length - 1)) * 100;
                        const y = 28 - (v / max) * 26;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ');
                      return `${d} L 100 30 L 0 30 Z`;
                    })()} fill="var(--color-danger)" fillOpacity="0.1" />
                  </svg>
                </div>
              </div>
              <div className="rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-shadow border border-token" style={{ backgroundColor: 'var(--color-card)' }}>
                <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t('dashboard.verifiedRecords')}</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{stats.records?.toLocaleString?.() || 0}</p>
                  <svg width="40" height="40" viewBox="0 0 36 36" className="shrink-0">
                    {(() => {
                      const arr = recordsTrend.length > 1 ? recordsTrend : [0, 0];
                      const current = arr[arr.length - 1] || 0;
                      const max = Math.max(1, ...arr);
                      const pct = Math.round((current / max) * 100);
                      return (
                        <>
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-border)" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
              <div className="rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-shadow border border-token" style={{ backgroundColor: 'var(--color-card)' }}>
                <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t('dashboard.pendingApprovals')}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.pending?.toLocaleString?.() || 0}</p>
                  <div className="relative flex items-center justify-center" style={{width: 40, height: 40}}>
                    {(() => {
                      const total = (stats.pending || 0) + (approvedCount || 0);
                      const pct = total > 0 ? Math.min(100, Math.round(((approvedCount || 0) / total) * 100)) : 0;
                      return (
                        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-border)" strokeWidth="3"></circle>
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-primary)" strokeDasharray={`${pct}, 100`} strokeLinecap="round" strokeWidth="3"></circle>
                        </svg>
                      );
                    })()}
                  </div>
                </div>
              </div>
      </div>
          </section>

          {/* Vendor Analysis Section - Exact Stitch AI Match */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0d1117] dark:text-[#c9d1d9]">Vendor Analysis</h2>
              <button className="text-sm font-medium text-[#1773cf]">View Details</button>
            </div>
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
            {vendorAnalysis.length > 0 ? (
                vendorAnalysis.map((vendor, index) => (
                  <div key={vendor.vendorId || index} className="flex flex-col gap-2 min-w-[140px]">
                    <div 
                      className="w-full aspect-square rounded-lg bg-cover bg-center"
                      style={{
                        backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkmK9BewsddzOKui9LLrFAn_rwTlZfRzoSAt7F4umHf0y1Cp1HpTMs735P2I87IImIhfNTjGOn68JSr2eSlBGu2_UISZhewhCWzQfjTNs1-ATe2I7dMGYmVGwZ83thZv1JWaTSxHqPyvrsI-5hhUglb5Us2R1qqWknk3xQsZ9EBhm3mhoGtFUdmVUS1WGLa1vyzKuCeIE9SDh7gwkmJlTBaXqS9aO4tfQxpKv9G7Sg2EC9SZTJKYzRRyNjJ1UzNQtuyvX6siT1LSEs")`
                      }}
                    ></div>
                    <div>
                      <p className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">{vendor.vendorName}</p>
                      <p className="text-sm text-[#57606a] dark:text-[#8b949e]">Score: {vendor.score}/100</p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <div 
                      className="w-full aspect-square rounded-lg bg-cover bg-center"
                      style={{
                        backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkmK9BewsddzOKui9LLrFAn_rwTlZfRzoSAt7F4umHf0y1Cp1HpTMs735P2I87IImIhfNTjGOn68JSr2eSlBGu2_UISZhewhCWzQfjTNs1-ATe2I7dMGYmVGwZ83thZv1JWaTSxHqPyvrsI-5hhUglb5Us2R1qqWknk3xQsZ9EBhm3mhoGtFUdmVUS1WGLa1vyzKuCeIE9SDh7gwkmJlTBaXqS9aO4tfQxpKv9G7Sg2EC9SZTJKYzRRyNjJ1UzNQtuyvX6siT1LSEs")`
                      }}
                    ></div>
                    <div>
                      <p className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">Vendor A</p>
                      <p className="text-sm text-[#57606a] dark:text-[#8b949e]">123 Fittings</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <div 
                      className="w-full aspect-square rounded-lg bg-cover bg-center"
                      style={{
                        backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAaYR7bpxEzghegfgPl7SIC2ClZJ98QNnjhctMRNYgOh-MXOAaYVBJuz9A9-IXzPV63xj87usDzcGKujhPTqzlPyiF6lm3YAM_ij6Jb0MlFLWOp6-lGJhfaGAOkc_cDAhNZFx7K78vxBeikLiNaEYB619SEUi6Hd9rfrEfO2XOwD4wbyURTXEgO-J6nwKd3shVaiGQvEIBZjS10nDI4Q_q-BMKvCWkO5S-9-v09sRAjCf3FvwILmJ7hGk7Zv8E4Mx_4M9rWgVTduG52")`
                      }}
                    ></div>
                    <div>
                      <p className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">Vendor B</p>
                      <p className="text-sm text-[#57606a] dark:text-[#8b949e]">456 Fittings</p>
              </div>
      </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <div 
                      className="w-full aspect-square rounded-lg bg-cover bg-center"
                      style={{
                        backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAvxOpGTe_1Wt-syABdgQWuPMuHK_U02pxhgJZK9YCzIJF6CDfoIPjtrWt5EBkX7tm95DnYUt1N8cnqPpz2vZkcyZpi99uNabm2RlarHhwpVeJTSVKA3Cbnk84xtGAjy0y6vexYYPDEvDZNyIxoN5CLZ9dL6SJyy9s1jCpmyd3zWSRdVjeu-nqHyhMw-3HUoIvMa7iVxFAiyWp01zlE2ltgzUo4JdozLuU7TMug3JAVQ-B86Wy5XqnTTHiNloAolpudp34EtAvykA_U")`
                      }}
                    ></div>
                <div>
                      <p className="font-semibold text-[#0d1117] dark:text-[#c9d1d9]">Vendor C</p>
                      <p className="text-sm text-[#57606a] dark:text-[#8b949e]">789 Fittings</p>
                </div>
              </div>
                </>
              )}
            </div>
          </section>

          {/* Live Activity Timeline Section - Exact Stitch AI Match */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Live Activity Timeline</h2>
            <div className="space-y-4">
              {optimizedLiveEvents.map((event, index) => (
                <div key={event.id || index} className="grid grid-cols-[auto_1fr] items-start gap-4">
                  <div className="flex flex-col items-center h-full">
                    <div className={`flex items-center justify-center h-11 w-11 rounded-full ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                    </div>
                    {index < liveEvents.length - 1 && (
                      <div className="w-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
                    )}
                  </div>
                  <div className="pt-2 pb-6">
                    <p className="font-medium text-gray-800 dark:text-white">{event.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.subtitle}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatTimeAgo(event.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Defect Trends Section - Exact Stitch AI Match */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Defect Trends</h2>
            <div className="rounded-lg p-4 shadow" style={{ backgroundColor: 'var(--color-card)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last 30 Days</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">12%</p>
                  <p className="text-sm font-medium text-red-500 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>2% vs last month</span>
                  </p>
                </div>
                <button className="text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined">open_in_full</span>
                </button>
              </div>
              <div className="h-40 mt-4">
                <RealTimeChart
                  collectionName="defectTrends"
                  dataField="defects"
                  labelField="month"
                  maxDataPoints={30}
                  height={160}
                  color="var(--chart-primary)"
                  showTooltip={true}
                  showDrillDown={true}
                  onDataPointClick={(data) => {
                    console.log('Defect trend data point clicked:', data);
                    // Navigate to detailed defect analysis
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* Blockchain Activity Section - Exact Stitch AI Match */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blockchain Activity</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
              {recentEvents.length > 0 ? (
                recentEvents.slice(0, 3).map((event, index) => (
                  <div key={event.transactionHash || index} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{event.eventType || 'Blockchain Event'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Block #{event.blockNumber || '11987'}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                      Success
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Fitting Approved</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Block #11987</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">Success</span>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                <div>
                      <p className="font-medium text-gray-900 dark:text-white">Issue Reported</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Block #11986</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-200">Pending</span>
                </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Record Verified</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Block #11985</p>
              </div>
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">Success</span>
              </div>
                </>
              )}
            </div>
          </section>

        </main>

        {/* Bottom Spacer */}
        <div className="h-5 bg-background-light dark:bg-background-dark"></div>
          </div>
    </div>
      </SmoothPageTransition>
  );
}