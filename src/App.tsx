import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import LoadingScreen from './components/ui/LoadingScreen';
import SplashScreen from './components/ui/SplashScreen';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import ScanProduct from './pages/ScanProduct';
import UserManagement from './pages/UserManagement';
import RoleManagement from './pages/RoleManagement';
import AuditLogs from './pages/AuditLogs';
import Inspections from './pages/Inspections';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DivisionReports from './pages/DivisionReports';
import ApprovalRequests from './pages/ApprovalRequests';
import ScheduleNotifications from './pages/ScheduleNotifications';
import SubDivisionReports from './pages/SubDivisionReports';
import InspectionOverview from './pages/InspectionOverview';
import OrderManagement from './pages/OrderManagement';
import ProductDetails from './pages/ProductDetails';
import SectionReports from './pages/SectionReports';
import AssignTasks from './pages/AssignTasks';
import InspectionLogs from './pages/InspectionLogs';
import RecordInspection from './pages/RecordInspection';
import RequestProducts from './pages/RequestProducts';
import InspectionHistory from './pages/InspectionHistory';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return showSignUp ? 
      <SignUpForm onBackToLogin={() => setShowSignUp(false)} /> : 
      <LoginForm onShowSignUp={() => setShowSignUp(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <div className="pt-16 lg:pt-0">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<ScanProduct />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/roles" element={<RoleManagement />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/division-reports" element={<DivisionReports />} />
            <Route path="/approval-requests" element={<ApprovalRequests />} />
            <Route path="/schedule-notifications" element={<ScheduleNotifications />} />
            <Route path="/subdivision-reports" element={<SubDivisionReports />} />
            <Route path="/inspection-overview" element={<InspectionOverview />} />
            <Route path="/order-management" element={<OrderManagement />} />
            <Route path="/product-details" element={<ProductDetails />} />
            <Route path="/section-reports" element={<SectionReports />} />
            <Route path="/assign-tasks" element={<AssignTasks />} />
            <Route path="/inspection-logs" element={<InspectionLogs />} />
            <Route path="/record-inspection" element={<RecordInspection />} />
            <Route path="/request-products" element={<RequestProducts />} />
            <Route path="/inspection-history" element={<InspectionHistory />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;