import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Building, 
  Shield,
  RefreshCw,
  Eye,
  User as UserIcon,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { User as UserType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface PendingUsersProps {
  className?: string;
  onClose?: () => void;
}

export function PendingUsers({ className = '', onClose }: PendingUsersProps) {
  const { t } = useLanguage();
  const { approveUser, rejectUser, getPendingUsers, getAllUsers, debugDatabase, createTestPendingUsers } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const pending = await getPendingUsers();
      setPendingUsers(pending);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApproveUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      setActionMessage(null);
      await approveUser(userId);
      await loadUsers();
      setActionMessage({ type: 'success', message: 'User approved successfully!' });
      setSelectedUser(null);
      setShowDetails(false);
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error('Error approving user:', error);
      setActionMessage({ type: 'error', message: 'Failed to approve user. Please try again.' });
      // Clear error message after 5 seconds
      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      setActionMessage(null);
      await rejectUser(userId);
      await loadUsers();
      setActionMessage({ type: 'success', message: 'User rejected successfully!' });
      setSelectedUser(null);
      setShowDetails(false);
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error('Error rejecting user:', error);
      setActionMessage({ type: 'error', message: 'Failed to reject user. Please try again.' });
      // Clear error message after 5 seconds
      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (user: UserType) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'inspector': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'vendor': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'operator': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'inspector': return <CheckCircle className="h-4 w-4" />;
      case 'vendor': return <Building className="h-4 w-4" />;
      case 'operator': return <UserIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  if (showDetails && selectedUser) {
    return (
      <div className={`bg-[#f6f8fa] dark:bg-[#0d1117] ${className}`}>
        {/* Header */}
        <div className="bg-[#ffffff] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d]">
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDetails(false)}
                className="p-1.5 text-[#57606a] dark:text-[#8b949e] hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="text-base font-bold text-[#0d1117] dark:text-[#c9d1d9]">User Details</h1>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#57606a] dark:text-[#8b949e] hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] rounded-lg transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div className={`p-3 mx-4 mt-3 rounded-lg ${
            actionMessage.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{actionMessage.message}</span>
            </div>
          </div>
        )}

        {/* User Details */}
        <div className="p-4 space-y-4">
          {/* Profile Card */}
          <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl p-6 shadow-sm border border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-[#1773cf]/10 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-[#1773cf]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#0d1117] dark:text-[#c9d1d9] mb-1">{selectedUser.name}</h2>
                <p className="text-base text-[#57606a] dark:text-[#8b949e] mb-3">{selectedUser.email}</p>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${getRoleColor(selectedUser.role)}`}>
                    {getRoleIcon(selectedUser.role)}
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Clock className="h-4 w-4" />
                    Pending Approval
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl p-5 shadow-sm border border-[#d0d7de] dark:border-[#30363d]">
              <h3 className="text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9] mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-[#1773cf]" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#57606a] dark:text-[#8b949e]" />
                  <span className="text-base text-[#0d1117] dark:text-[#c9d1d9]">{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-[#57606a] dark:text-[#8b949e]" />
                    <span className="text-base text-[#0d1117] dark:text-[#c9d1d9]">{selectedUser.phone}</span>
                  </div>
                )}
                {selectedUser.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-[#57606a] dark:text-[#8b949e]" />
                    <span className="text-base text-[#0d1117] dark:text-[#c9d1d9]">{selectedUser.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl p-5 shadow-sm border border-[#d0d7de] dark:border-[#30363d]">
              <h3 className="text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9] mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-[#1773cf]" />
                Professional Information
              </h3>
              <div className="space-y-4">
                {selectedUser.department && (
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-[#57606a] dark:text-[#8b949e]" />
                    <span className="text-base text-[#0d1117] dark:text-[#c9d1d9]">{selectedUser.department}</span>
                  </div>
                )}
                {selectedUser.experience && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-[#57606a] dark:text-[#8b949e]" />
                    <span className="text-base text-[#0d1117] dark:text-[#c9d1d9]">{selectedUser.experience}</span>
                  </div>
                )}
                {selectedUser.qualifications && (
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-5 w-5 text-[#57606a] dark:text-[#8b949e]" />
                    <span className="text-base text-[#0d1117] dark:text-[#c9d1d9]">{selectedUser.qualifications}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Request Details */}
          {selectedUser.reason && (
            <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl p-5 shadow-sm border border-[#d0d7de] dark:border-[#30363d]">
              <h3 className="text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9] mb-4">Request Details</h3>
              <p className="text-base text-[#57606a] dark:text-[#8b949e] leading-relaxed">{selectedUser.reason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-xl p-5 shadow-sm border border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleApproveUser(selectedUser.id)}
                disabled={actionLoading === selectedUser.id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {actionLoading === selectedUser.id ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span className="text-base">Approve User</span>
              </button>
              <button
                onClick={() => handleRejectUser(selectedUser.id)}
                disabled={actionLoading === selectedUser.id}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {actionLoading === selectedUser.id ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span className="text-base">Reject User</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#f6f8fa] dark:bg-[#0d1117] ${className}`}>
      {/* Header */}
      <div className="bg-[#ffffff] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-[#1773cf]" />
            <h1 className="text-base font-bold text-[#0d1117] dark:text-[#c9d1d9]">{t('users.pendingApprovals')}</h1>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={loadUsers}
              className="p-1.5 text-[#57606a] dark:text-[#8b949e] hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={async () => {
                console.log('🔍 DEBUGGING: Starting database debug...');
                await debugDatabase();
              }}
              className="px-3 py-1.5 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Debug DB
            </button>
            <button
              onClick={async () => {
                console.log('🔍 DEBUGGING: Creating test pending users...');
                await createTestPendingUsers();
                await loadUsers();
              }}
              className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Add Test Pending
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-[#57606a] dark:text-[#8b949e] hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] rounded-lg transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className={`p-3 mx-3 mt-3 rounded-lg ${
          actionMessage.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{actionMessage.message}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1773cf]" />
            <span className="ml-2 text-sm text-[#57606a] dark:text-[#8b949e]">Loading...</span>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-[#57606a] dark:text-[#8b949e] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#0d1117] dark:text-[#c9d1d9] mb-1">No Pending Approvals</h3>
            <p className="text-sm text-[#57606a] dark:text-[#8b949e]">All requests processed.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Summary Card */}
            <div className="bg-[#ffffff] dark:bg-[#161b22] rounded-lg p-3 shadow-sm border border-[#d0d7de] dark:border-[#30363d]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#0d1117] dark:text-[#c9d1d9]">Approval Requests</h2>
                  <p className="text-xs text-[#57606a] dark:text-[#8b949e]">{pendingUsers.length} users waiting</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[#1773cf]">{pendingUsers.length}</p>
                  <p className="text-xs text-[#57606a] dark:text-[#8b949e]">Pending</p>
                </div>
              </div>
            </div>

            {/* User Cards - Simplified */}
            <div className="space-y-2">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#ffffff] dark:bg-[#161b22] rounded-lg p-4 shadow-sm border border-[#d0d7de] dark:border-[#30363d] hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1773cf] to-[#1773cf]/70 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[#0d1117] dark:text-[#c9d1d9] truncate">{user.name}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="px-4 py-2 bg-[#1773cf]/10 hover:bg-[#1773cf]/20 text-[#1773cf] dark:bg-[#1773cf]/20 dark:text-[#1773cf] text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{t('users.viewDetails')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}