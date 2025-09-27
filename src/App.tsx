import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import LoadingScreen from './components/ui/LoadingScreen';
import SplashScreen from './components/ui/SplashScreen';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UnauthorizedPage from './components/auth/UnauthorizedPage';
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
import InspectionOverview from './pages/InspectionOverview';
import OrderManagement from './pages/OrderManagement';
import ProductDetails from './pages/ProductDetails';
import SectionReports from './pages/SectionReports';
import AssignTasks from './pages/AssignTasks';
import InspectionLogs from './pages/InspectionLogs';
import RecordInspection from './pages/RecordInspection';
import RequestProducts from './pages/RequestProducts';
import InspectionHistory from './pages/InspectionHistory';
import BlockchainData from './pages/BlockchainData';
import AIReports from './pages/AIReports';

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
            <Route path="/scan" element={
              <ProtectedRoute allowedRoles={['inspector']}>
                <ScanProduct />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin', 'drm']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/roles" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RoleManagement />
              </ProtectedRoute>
            } />
            <Route path="/audit" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogs />
              </ProtectedRoute>
            } />
            <Route path="/blockchain-data" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BlockchainData />
              </ProtectedRoute>
            } />
            <Route path="/ai-reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AIReports />
              </ProtectedRoute>
            } />
            <Route path="/inspections" element={
              <ProtectedRoute allowedRoles={['admin', 'drm', 'den', 'inspector']}>
                <Inspections />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={['manufacturer']}>
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'drm', 'manufacturer']}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={<Settings />} />
            <Route path="/division-reports" element={
              <ProtectedRoute allowedRoles={['drm']}>
                <DivisionReports />
              </ProtectedRoute>
            } />
            <Route path="/approval-requests" element={
              <ProtectedRoute allowedRoles={['den']}>
                <ApprovalRequests />
              </ProtectedRoute>
            } />
            <Route path="/schedule-notifications" element={
              <ProtectedRoute allowedRoles={['drm']}>
                <ScheduleNotifications />
              </ProtectedRoute>
            } />
            <Route path="/inspection-overview" element={
              <ProtectedRoute allowedRoles={['den']}>
                <InspectionOverview />
              </ProtectedRoute>
            } />
            <Route path="/order-management" element={
              <ProtectedRoute allowedRoles={['manufacturer']}>
                <OrderManagement />
              </ProtectedRoute>
            } />
            <Route path="/product-details" element={
              <ProtectedRoute allowedRoles={['manufacturer']}>
                <ProductDetails />
              </ProtectedRoute>
            } />
            <Route path="/section-reports" element={
              <ProtectedRoute allowedRoles={['den']}>
                <SectionReports />
              </ProtectedRoute>
            } />
            <Route path="/assign-tasks" element={
              <ProtectedRoute allowedRoles={['den']}>
                <AssignTasks />
              </ProtectedRoute>
            } />
            <Route path="/inspection-logs" element={
              <ProtectedRoute allowedRoles={['den']}>
                <InspectionLogs />
              </ProtectedRoute>
            } />
            <Route path="/record-inspection" element={
              <ProtectedRoute allowedRoles={['inspector']}>
                <RecordInspection />
              </ProtectedRoute>
            } />
            <Route path="/request-products" element={
              <ProtectedRoute allowedRoles={['inspector']}>
                <RequestProducts />
              </ProtectedRoute>
            } />
            <Route path="/inspection-history" element={
              <ProtectedRoute allowedRoles={['inspector']}>
                <InspectionHistory />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
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