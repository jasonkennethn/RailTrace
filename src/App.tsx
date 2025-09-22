import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { PendingApproval } from './components/Auth/PendingApproval';
import { SplashScreen } from './components/SplashScreen';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { VendorDashboard } from './components/Dashboard/VendorDashboard';
import { DepotDashboard } from './components/Dashboard/DepotDashboard';
import { EngineerDashboard } from './components/Dashboard/EngineerDashboard';
import { InspectorDashboard } from './components/Dashboard/InspectorDashboard';
import { QRScanner } from './components/QR/QRScanner';
import { UserManagement } from './components/Admin/UserManagement';
import { AIAnalytics } from './components/Dashboard/AIAnalytics';
import { BlockchainAudit } from './components/Dashboard/BlockchainAudit';
import { TransactionDetails } from './components/Dashboard/TransactionDetails';
import { PartsDetails } from './components/Dashboard/PartsDetails';
import { Reports } from './components/Dashboard/Reports';
import { Settings } from './components/Dashboard/Settings';
import { TestAccountGenerator } from './components/TestAccountGenerator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import BatchList, { type VendorBatch } from './components/VendorPages/BatchList';
import ShipmentsList, { type VendorShipment } from './components/VendorPages/ShipmentsList';
import Notifications from './components/VendorPages/Notifications';
import MyProfile from './components/VendorPages/MyProfile';
import { vendorDataService, type VendorNotificationLive } from './services/vendorDataService';
import { QRGenerator } from './components/QR/QRGenerator';

function AuthenticatedApp() {
  const { currentUser, userData, logout, isAdminEmail } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPartData, setSelectedPartData] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.tab) setActiveTab(e.detail.tab);
    };
    window.addEventListener('vendor-tab-change', handler as any);
    return () => window.removeEventListener('vendor-tab-change', handler as any);
  }, []);

  // Vendor live data for pages
  const vendorId = (userData as any)?.vendorId || (userData as any)?.uid || 'default';
  const [vendorBatches, setVendorBatches] = useState<VendorBatch[]>([]);
  const [vendorShipments, setVendorShipments] = useState<VendorShipment[]>([]);
  const [vendorNotifications, setVendorNotifications] = useState<VendorNotificationLive[]>([]);
  const [vendorProfile, setVendorProfile] = useState<{ name?: string; email?: string; phone?: string } | null>(null);
  const [vendorQR, setVendorQR] = useState<Array<{ id: string; related?: string; lastActivity?: any; scans?: number }>>([]);

  useEffect(() => {
    if (userData?.role !== 'vendor') return;
    const unsubs: Array<() => void> = [];
    unsubs.push(vendorDataService.subscribeBatches(vendorId, (rows: any[]) => setVendorBatches(rows as unknown as VendorBatch[])));
    unsubs.push(vendorDataService.subscribeShipments(vendorId, (rows: any[]) => setVendorShipments(rows as unknown as VendorShipment[])));
    unsubs.push(vendorDataService.subscribeNotifications(vendorId, (rows) => setVendorNotifications(rows)));
    unsubs.push(vendorDataService.subscribeQRActivity(vendorId, (rows) => setVendorQR(rows as any)));
    (async () => { const p = await vendorDataService.getProfile(vendorId); setVendorProfile({ name: (p as any)?.name, email: (p as any)?.email, phone: (p as any)?.phone }); })();
    return () => { unsubs.forEach(u => u && u()); };
  }, [userData?.role, vendorId]);

  // Admins bypass approval screen
  const isAdminByEmail = isAdminEmail(currentUser?.email || null);
  if (!userData?.approved && userData?.role !== 'admin' && !isAdminByEmail) {
    return <PendingApproval />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    if (!userData) {
      return <div className="p-8">Loading...</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        if (userData.role === 'admin') return <AdminDashboard />;
        if (userData.role === 'vendor') return <VendorDashboard />;
        if (userData.role === 'depot') return <DepotDashboard />;
        if (userData.role === 'engineer') return <EngineerDashboard />;
        if (userData.role === 'inspector') return <InspectorDashboard />;
        return <div className="p-8">Dashboard for {userData.role}</div>;
        
      case 'inventory':
        if (userData.role === 'vendor') return <BatchList batches={vendorBatches} />;
        return <div className="p-8">Inventory</div>;

      case 'shipments':
        if (userData.role === 'vendor') return <ShipmentsList shipments={vendorShipments} />;
        return <div className="p-8">Shipments</div>;

      case 'performance':
        if (userData.role === 'vendor') return <VendorDashboard />;
        return <div className="p-8">Performance</div>;
        
      case 'qr-generate':
        if (userData.role === 'vendor') {
          return <QRGenerator />;
        }
        return <div className="p-8">QR Code Generator</div>;
        
      case 'qr-scan':
        return <QRScanner />;
        
      case 'analytics':
        if (userData.role === 'admin') {
          return <AIAnalytics onBack={() => setActiveTab('dashboard')} />;
        }
        return <div className="p-8">Analytics</div>;
        
      case 'blockchain':
        if (userData.role === 'admin') {
          return <BlockchainAudit 
            onBack={() => setActiveTab('dashboard')} 
            onViewTransaction={() => setActiveTab('transaction-details')}
            onViewPart={(partData) => {
              setSelectedPartData(partData);
              setActiveTab('parts-details');
            }}
          />;
        }
        return <div className="p-8">Blockchain Records</div>;
        
      case 'reports':
        if (userData.role === 'admin') {
          return <Reports />;
        }
        if (userData.role === 'vendor') {
          return <Notifications items={vendorNotifications} onMarkRead={(id) => vendorDataService.markNotificationRead(vendorId, id)} />;
        }
        return <div className="p-8">Reports</div>;
        
      case 'settings':
        if (userData.role === 'admin') {
          return <Settings />;
        }
        if (userData.role === 'vendor') {
          return <MyProfile initial={vendorProfile || {}} company={{}} onSave={(data) => vendorDataService.saveProfile(vendorId, data)} />;
        }
        return <div className="p-8">Settings</div>;
        
      case 'users':
        if (userData.role === 'admin') {
          return <UserManagement />;
        }
        return <div className="p-8">Users</div>;
        
      case 'test-accounts':
        return <TestAccountGenerator />;
        
      case 'transaction-details':
        return <TransactionDetails onBack={() => setActiveTab('blockchain')} />;
        
      case 'parts-details':
        return <PartsDetails 
          partData={selectedPartData} 
          onBack={() => setActiveTab('blockchain')} 
        />;
        
      default:
        return <div className="p-8">Coming Soon</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0d1117]">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onLogout={logout} onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-[#0d1117]">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function UnauthenticatedApp() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }
  
  return currentUser ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;