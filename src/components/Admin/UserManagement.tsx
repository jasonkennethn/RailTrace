import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MobileBackup, MobileBackupCard, MobileBackupList, MobileBackupModal } from '../ui/MobileBackup';
import { useMobileBackup } from '../../hooks/useMobileBackup';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Building, 
  User,
  Shield,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { User as UserType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export function UserManagement() {
  const { t } = useLanguage();
  const { approveUser, rejectUser, getPendingUsers, getAllUsers, userData } = useAuth();
  const { isUltraSmall, getMobileClasses, getSpacing, getTextSize, getIconSize, getAvatarSize, getButtonClasses, getLayout, getGap, getPadding, getMargin, getWidth, getHeight, getBorderRadius, getTruncation, getVisibility, getDisplay, getPosition, getZIndex, getOverflow, getColor, getBackground, getBorder } = useMobileBackup();
  const [pendingUsers, setPendingUsers] = useState<UserType[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);

  const loadPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await getPendingUsers();
      setPendingUsers(users);
      
      // Also load all users for debugging
      const allUsersData = await getAllUsers();
      setAllUsers(allUsersData);
      
      // If no users found, show some mock data for demonstration
      if (users.length === 0 && allUsersData.length === 0) {
        console.log('No users found in database. This might be expected for a fresh installation.');
        console.log('Try registering a new user to test the approval workflow.');
      }
    } catch (error) {
      console.error('Error loading pending users:', error);
    } finally {
      setLoading(false);
    }
  }, [getPendingUsers, getAllUsers]);

  useEffect(() => {
    loadPendingUsers();
  }, [userData?.id, loadPendingUsers]);

  const handleApproveUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await approveUser(userId);
      await loadPendingUsers(); // Refresh the list
      setSelectedUser(null);
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await rejectUser(userId);
      await loadPendingUsers(); // Refresh the list
      setSelectedUser(null);
    } catch (error) {
      console.error('Error rejecting user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants = {
      vendor: 'info' as const,
      depot: 'warning' as const,
      engineer: 'success' as const,
      inspector: 'error' as const,
      admin: 'default' as const
    };
    return variants[role as keyof typeof variants] || 'default';
  };

  const filteredUsers = pendingUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <MobileBackup
        className="sticky top-0 z-10 flex items-center justify-between bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-sm border-b border-background-light dark:border-background-dark"
        padding={{
          normal: 'p-4',
          small: 'p-3',
          ultraSmall: 'mobile-backup-p-sm',
        }}
        display={{
          normal: 'flex',
          small: 'flex',
          ultraSmall: 'mobile-backup-flex',
        }}
        layout={{
          normal: 'flex items-center justify-between',
          small: 'flex items-center justify-between',
          ultraSmall: 'mobile-backup-center mobile-backup-justify-between',
        }}
      >
        <button className={`${getPadding({ normal: 'p-2', small: 'p-1.5', ultraSmall: 'mobile-backup-p-xs' })} ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })}`}>
          <span className={`material-symbols-outlined ${getTextSize({ normal: 'text-xl', small: 'text-lg', ultraSmall: 'mobile-backup-text-lg' })}`}>arrow_back</span>
        </button>
        <h1 className={`${getTextSize({ normal: 'text-lg', small: 'text-base', ultraSmall: 'mobile-backup-text-base' })} font-bold ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} truncate px-2`}>{t('users.title')}</h1>
        <button 
          className={`${getPadding({ normal: 'p-2', small: 'p-1.5', ultraSmall: 'mobile-backup-p-xs' })} ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })}`}
          onClick={loadPendingUsers}
          disabled={loading}
        >
          <span className={`material-symbols-outlined ${getTextSize({ normal: 'text-xl', small: 'text-lg', ultraSmall: 'mobile-backup-text-lg' })} ${loading ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </MobileBackup>

      <div className={`${getPadding({ normal: 'p-4', small: 'p-3', ultraSmall: 'mobile-backup-p-sm' })}`}>
        <div className={`${getSpacing({ normal: 'space-y-6', small: 'space-y-4', ultraSmall: 'mobile-backup-space-y-sm' })}`}>
          {/* Search Bar */}
          <div className="relative">
            <span className={`absolute top-1/2 -translate-y-1/2 ${getColor({ normal: 'text-subtle-light dark:text-subtle-dark', small: 'text-subtle-light dark:text-subtle-dark', ultraSmall: 'mobile-backup-text-secondary' })} material-symbols-outlined ${getTextSize({ normal: 'text-xl', small: 'text-lg', ultraSmall: 'mobile-backup-text-lg' })} ${getPadding({ normal: 'left-4', small: 'left-3', ultraSmall: 'left-3' })}`}>search</span>
            <input 
              type="text" 
              placeholder="Search users..." 
              className={`w-full ${getPadding({ normal: 'pl-12 pr-4 py-3', small: 'pl-10 pr-3 py-2.5', ultraSmall: 'mobile-backup-px-sm mobile-backup-py-xs' })} ${getBorderRadius({ normal: 'rounded-lg', small: 'rounded-lg', ultraSmall: 'mobile-backup-rounded' })} ${getBackground({ normal: 'bg-card-light dark:bg-card-dark', small: 'bg-card-light dark:bg-card-dark', ultraSmall: 'mobile-backup-bg-secondary' })} ${getBorder({ normal: 'border border-border-light dark:border-border-dark', small: 'border border-border-light dark:border-border-dark', ultraSmall: 'mobile-backup-border' })} ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} placeholder:text-subtle-light dark:placeholder:text-subtle-dark focus:ring-2 focus:ring-primary focus:border-transparent ${getTextSize({ normal: 'text-base', small: 'text-sm', ultraSmall: 'mobile-backup-text-sm' })}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* System Overview */}
          <MobileBackupCard>
            <div className={`flex items-center justify-between ${getMargin({ normal: 'mb-4', small: 'mb-3', ultraSmall: 'mobile-backup-mb-sm' })}`}>
              <h2 className={`${getTextSize({ normal: 'text-lg', small: 'text-base', ultraSmall: 'mobile-backup-text-base' })} font-semibold ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })}`}>System Overview</h2>
              <button 
                className={`${getPadding({ normal: 'px-4 py-2', small: 'px-2 py-1.5', ultraSmall: 'mobile-backup-button' })} ${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-sm' })} font-medium ${getBorderRadius({ normal: 'rounded-lg', small: 'rounded-lg', ultraSmall: 'mobile-backup-rounded' })} bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors flex items-center ${getGap({ normal: 'gap-2', small: 'gap-1', ultraSmall: 'mobile-backup-gap-xs' })}`}
                onClick={() => setShowAllUsers(!showAllUsers)}
              >
                <span className={`${getVisibility({ normal: 'hidden xs:inline', small: 'hidden xs:inline', ultraSmall: 'mobile-backup-hidden' })}`}>{showAllUsers ? t('dashboard.hideAll') : t('dashboard.showAll')}</span>
                <span className={`${getVisibility({ normal: 'xs:hidden', small: 'xs:hidden', ultraSmall: 'mobile-backup-block' })}`}>{showAllUsers ? 'Hide' : 'Show'}</span>
                <span className={`${getPadding({ normal: 'px-2', small: 'px-1.5', ultraSmall: 'mobile-backup-px-xs mobile-backup-py-xs' })} ${getTextSize({ normal: 'text-xs', small: 'text-xs', ultraSmall: 'mobile-backup-text-xs' })} bg-primary/20 dark:bg-primary/30 ${getBorderRadius({ normal: 'rounded-full', small: 'rounded-full', ultraSmall: 'mobile-backup-rounded-full' })}`}>
                  {allUsers.length}
                </span>
              </button>
            </div>
            {showAllUsers && (
              <MobileBackupList
                className={`${getMargin({ normal: 'mt-4', small: 'mt-3', ultraSmall: 'mobile-backup-mt-sm' })} ${getHeight({ normal: 'max-h-60', small: 'max-h-48', ultraSmall: 'mobile-backup-h-auto' })} overflow-y-auto`}
              >
                {allUsers.map(user => (
                  <div key={user.id} className={`flex items-center ${getGap({ normal: 'gap-3', small: 'gap-2', ultraSmall: 'mobile-backup-gap-xs' })} ${getPadding({ normal: 'p-3', small: 'p-2', ultraSmall: 'mobile-backup-p-xs' })} ${getBorderRadius({ normal: 'rounded-lg', small: 'rounded-lg', ultraSmall: 'mobile-backup-rounded' })} ${getBackground({ normal: 'bg-background-light dark:bg-background-dark', small: 'bg-background-light dark:bg-background-dark', ultraSmall: 'mobile-backup-bg-muted' })} ${getBorder({ normal: 'border border-border-light dark:border-border-dark', small: 'border border-border-light dark:border-border-dark', ultraSmall: 'mobile-backup-border' })}`}>
                    <div className={`flex items-center justify-center rounded-full ${getAvatarSize({ normal: 'w-8 h-8', small: 'w-6 h-6', ultraSmall: 'mobile-backup-avatar-xs' })} bg-gradient-to-br from-primary to-primary/70 text-white font-bold ${getTextSize({ normal: 'text-xs', small: 'text-xs', ultraSmall: 'mobile-backup-text-xs' })} flex-shrink-0`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`flex ${getLayout({ normal: 'flex-row items-center', small: 'flex-col', ultraSmall: 'mobile-backup-stack' })} ${getGap({ normal: 'gap-2', small: 'gap-1', ultraSmall: 'mobile-backup-gap-xs' })}`}>
                        <h3 className={`${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-sm' })} font-medium ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getTruncation({ normal: 'truncate', small: 'truncate', ultraSmall: 'mobile-backup-truncate' })}`}>{user.name}</h3>
                        <div className={`flex items-center ${getGap({ normal: 'gap-2', small: 'gap-1', ultraSmall: 'mobile-backup-gap-xs' })}`}>
                          <Badge variant={getRoleBadgeVariant(user.role)} className={`${getTextSize({ normal: 'text-xs', small: 'text-xs', ultraSmall: 'mobile-backup-text-xs' })} ${getPadding({ normal: 'px-2', small: 'px-1.5', ultraSmall: 'mobile-backup-px-xs mobile-backup-py-xs' })} w-fit`}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.approved ? 'success' : 'warning'} className={`${getTextSize({ normal: 'text-xs', small: 'text-xs', ultraSmall: 'mobile-backup-text-xs' })} ${getPadding({ normal: 'px-2', small: 'px-1.5', ultraSmall: 'mobile-backup-px-xs mobile-backup-py-xs' })} w-fit`}>
                            {user.approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </MobileBackupList>
            )}
          </MobileBackupCard>

          {/* Pending Users */}
          <MobileBackupCard>
            <h2 className={`${getMargin({ normal: 'mb-4', small: 'mb-3', ultraSmall: 'mobile-backup-mb-sm' })} ${getTextSize({ normal: 'text-lg', small: 'text-base', ultraSmall: 'mobile-backup-text-base' })} font-semibold ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })}`}>Pending Approvals</h2>
            {loading ? (
              <div className={`text-center ${getPadding({ normal: 'py-8', small: 'py-6', ultraSmall: 'mobile-backup-py-md' })}`}>
                <div className={`animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto ${getMargin({ normal: 'mb-4', small: 'mb-3', ultraSmall: 'mobile-backup-mb-sm' })} ${getWidth({ normal: 'w-8 h-8', small: 'w-6 h-6', ultraSmall: 'mobile-backup-avatar-sm' })}`}></div>
                <p className={`${getTextSize({ normal: 'text-base', small: 'text-sm', ultraSmall: 'mobile-backup-text-sm' })} ${getColor({ normal: 'text-subtle-light dark:text-subtle-dark', small: 'text-subtle-light dark:text-subtle-dark', ultraSmall: 'mobile-backup-text-secondary' })}`}>Loading pending users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <MobileBackupList
                spacing={{
                  normal: 'space-y-3',
                  small: 'space-y-2',
                  ultraSmall: 'mobile-backup-space-y-xs',
                }}
              >
                {filteredUsers.map((user) => (
                  <div key={user.id} className={`flex items-center ${getGap({ normal: 'gap-3', small: 'gap-2', ultraSmall: 'mobile-backup-gap-xs' })} ${getPadding({ normal: 'p-3', small: 'p-2', ultraSmall: 'mobile-backup-p-xs' })} ${getBorderRadius({ normal: 'rounded-lg', small: 'rounded-lg', ultraSmall: 'mobile-backup-rounded' })} ${getBackground({ normal: 'bg-background-light dark:bg-background-dark', small: 'bg-background-light dark:bg-background-dark', ultraSmall: 'mobile-backup-bg-muted' })} ${getBorder({ normal: 'border border-border-light dark:border-border-dark', small: 'border border-border-light dark:border-border-dark', ultraSmall: 'mobile-backup-border' })}`}>
                    {/* Avatar - smaller on mobile */}
                    <div className={`flex items-center justify-center rounded-full ${getAvatarSize({ normal: 'w-10 h-10', small: 'w-8 h-8', ultraSmall: 'mobile-backup-avatar-sm' })} bg-gradient-to-br from-primary to-primary/70 text-white font-bold ${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-sm' })} flex-shrink-0`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* User Info - responsive layout */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex ${getLayout({ normal: 'flex-row items-center', small: 'flex-col', ultraSmall: 'mobile-backup-stack' })} ${getGap({ normal: 'gap-2', small: 'gap-1', ultraSmall: 'mobile-backup-gap-xs' })}`}>
                        <h3 className={`${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-sm' })} font-semibold ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getTruncation({ normal: 'truncate', small: 'truncate', ultraSmall: 'mobile-backup-truncate' })}`}>
                          {user.name}
                        </h3>
                        <Badge variant={getRoleBadgeVariant(user.role)} className={`${getTextSize({ normal: 'text-xs', small: 'text-xs', ultraSmall: 'mobile-backup-text-xs' })} ${getPadding({ normal: 'px-2', small: 'px-1.5', ultraSmall: 'mobile-backup-px-xs mobile-backup-py-xs' })} w-fit`}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Action Button - responsive sizing */}
                    <div className="flex items-center flex-shrink-0">
                      <button 
                        className={`${getButtonClasses({ normal: 'px-4 py-2', small: 'px-3 py-1.5', ultraSmall: 'mobile-backup-button' })} font-medium ${getBorderRadius({ normal: 'rounded-md', small: 'rounded-md', ultraSmall: 'mobile-backup-rounded' })} bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors whitespace-nowrap`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <span className={`${getVisibility({ normal: 'hidden xs:inline', small: 'hidden xs:inline', ultraSmall: 'mobile-backup-hidden' })}`}>{t('users.viewDetails')}</span>
                        <span className={`${getVisibility({ normal: 'xs:hidden', small: 'xs:hidden', ultraSmall: 'mobile-backup-block' })}`}>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </MobileBackupList>
            ) : (
              <div className={`text-center ${getPadding({ normal: 'py-8', small: 'py-6', ultraSmall: 'mobile-backup-py-md' })}`}>
                <div className={`${getWidth({ normal: 'w-16 h-16', small: 'w-12 h-12', ultraSmall: 'mobile-backup-avatar-md' })} ${getBackground({ normal: 'bg-background-light dark:bg-background-dark', small: 'bg-background-light dark:bg-background-dark', ultraSmall: 'mobile-backup-bg-muted' })} rounded-full flex items-center justify-center mx-auto ${getMargin({ normal: 'mb-4', small: 'mb-3', ultraSmall: 'mobile-backup-mb-sm' })}`}>
                  <span className={`${getColor({ normal: 'text-subtle-light dark:text-subtle-dark', small: 'text-subtle-light dark:text-subtle-dark', ultraSmall: 'mobile-backup-text-secondary' })} material-symbols-outlined ${getTextSize({ normal: 'text-xl', small: 'text-lg', ultraSmall: 'mobile-backup-text-lg' })}`}>person</span>
                </div>
                <h3 className={`${getTextSize({ normal: 'text-lg', small: 'text-base', ultraSmall: 'mobile-backup-text-base' })} font-semibold ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getMargin({ normal: 'mb-2', small: 'mb-2', ultraSmall: 'mobile-backup-mb-xs' })}`}>No pending users found</h3>
                <p className={`${getTextSize({ normal: 'text-base', small: 'text-sm', ultraSmall: 'mobile-backup-text-sm' })} ${getColor({ normal: 'text-subtle-light dark:text-subtle-dark', small: 'text-subtle-light dark:text-subtle-dark', ultraSmall: 'mobile-backup-text-secondary' })} ${getPadding({ normal: 'px-4', small: 'px-4', ultraSmall: 'mobile-backup-px-sm' })}`}>
                  {searchTerm ? 'Try adjusting your search criteria' : 'All users have been processed'}
                </p>
              </div>
            )}
          </MobileBackupCard>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="md"
        variant={isUltraSmall ? "bottom-sheet" : "center"}
      >
        {selectedUser && (
          <MobileBackup
            spacing={{
              normal: 'space-y-6',
              small: 'space-y-4',
              ultraSmall: 'mobile-backup-space-y-sm',
            }}
          >
            {/* User Header - responsive layout */}
            <div className={`flex items-center ${getGap({ normal: 'space-x-4', small: 'space-x-3', ultraSmall: 'mobile-backup-gap-sm' })}`}>
              <div className={`${getAvatarSize({ normal: 'w-16 h-16', small: 'w-12 h-12', ultraSmall: 'mobile-backup-avatar-md' })} bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold ${getTextSize({ normal: 'text-xl', small: 'text-lg', ultraSmall: 'mobile-backup-text-lg' })} flex-shrink-0`}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`${getTextSize({ normal: 'text-xl', small: 'text-lg', ultraSmall: 'mobile-backup-text-base' })} font-semibold ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getTruncation({ normal: 'truncate', small: 'truncate', ultraSmall: 'mobile-backup-truncate' })}`}>{selectedUser.name}</h3>
                <div className={`flex ${getLayout({ normal: 'flex-row items-center', small: 'flex-col', ultraSmall: 'mobile-backup-stack' })} ${getGap({ normal: 'gap-2', small: 'gap-1', ultraSmall: 'mobile-backup-gap-xs' })} ${getMargin({ normal: 'mt-1', small: 'mt-1', ultraSmall: 'mobile-backup-mt-xs' })}`}>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)} className={`${getTextSize({ normal: 'text-xs', small: 'text-xs', ultraSmall: 'mobile-backup-text-xs' })} w-fit`}>
                    {selectedUser.role}
                  </Badge>
                  <Badge variant="warning" className={`${getTextSize({ normal: 'text-xs', small: 'text-xs', ultraSmall: 'mobile-backup-text-xs' })} w-fit`}>
                    <Clock className={`${getIconSize({ normal: 'h-4 w-4', small: 'h-3 w-3', ultraSmall: 'mobile-backup-icon-xs' })} mr-1`} />
                    Pending Approval
                  </Badge>
                </div>
              </div>
            </div>

            {/* User Details - responsive grid */}
            <div className={`grid grid-cols-1 ${getGap({ normal: 'gap-4', small: 'gap-3', ultraSmall: 'mobile-backup-gap-sm' })}`}>
              <div>
                <label className={`block ${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-sm' })} font-medium ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getMargin({ normal: 'mb-1', small: 'mb-1', ultraSmall: 'mobile-backup-mb-xs' })}`}>Email</label>
                <div className={`flex items-center ${getGap({ normal: 'gap-2', small: 'gap-2', ultraSmall: 'mobile-backup-gap-xs' })} ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getTextSize({ normal: 'text-base', small: 'text-sm', ultraSmall: 'mobile-backup-text-sm' })}`}>
                  <Mail className={`${getIconSize({ normal: 'h-4 w-4', small: 'h-3 w-3', ultraSmall: 'mobile-backup-icon-xs' })} ${getColor({ normal: 'text-subtle-light dark:text-subtle-dark', small: 'text-subtle-light dark:text-subtle-dark', ultraSmall: 'mobile-backup-text-secondary' })} flex-shrink-0`} />
                  <span className={getTruncation({ normal: 'truncate', small: 'truncate', ultraSmall: 'mobile-backup-truncate' })}>{selectedUser.email}</span>
                </div>
              </div>

              <div>
                <label className={`block ${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-sm' })} font-medium ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getMargin({ normal: 'mb-1', small: 'mb-1', ultraSmall: 'mobile-backup-mb-xs' })}`}>Role</label>
                <div className={`flex items-center ${getGap({ normal: 'gap-2', small: 'gap-2', ultraSmall: 'mobile-backup-gap-xs' })} ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getTextSize({ normal: 'text-base', small: 'text-sm', ultraSmall: 'mobile-backup-text-sm' })}`}>
                  <Shield className={`${getIconSize({ normal: 'h-4 w-4', small: 'h-3 w-3', ultraSmall: 'mobile-backup-icon-xs' })} ${getColor({ normal: 'text-subtle-light dark:text-subtle-dark', small: 'text-subtle-light dark:text-subtle-dark', ultraSmall: 'mobile-backup-text-secondary' })} flex-shrink-0`} />
                  <span className="capitalize">{selectedUser.role}</span>
                </div>
              </div>

              {selectedUser.organizationName && (
                <div>
                  <label className={`block ${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-sm' })} font-medium ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getMargin({ normal: 'mb-1', small: 'mb-1', ultraSmall: 'mobile-backup-mb-xs' })}`}>Organization</label>
                  <div className={`flex items-center ${getGap({ normal: 'gap-2', small: 'gap-2', ultraSmall: 'mobile-backup-gap-xs' })} ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getTextSize({ normal: 'text-base', small: 'text-sm', ultraSmall: 'mobile-backup-text-sm' })}`}>
                    <Building className={`${getIconSize({ normal: 'h-4 w-4', small: 'h-3 w-3', ultraSmall: 'mobile-backup-icon-xs' })} ${getColor({ normal: 'text-subtle-light dark:text-subtle-dark', small: 'text-subtle-light dark:text-subtle-dark', ultraSmall: 'mobile-backup-text-secondary' })} flex-shrink-0`} />
                    <span className={getTruncation({ normal: 'truncate', small: 'truncate', ultraSmall: 'mobile-backup-truncate' })}>{selectedUser.organizationName}</span>
                  </div>
                </div>
              )}

              {selectedUser.organizationId && (
                <div>
                  <label className={`block ${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-sm' })} font-medium ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getMargin({ normal: 'mb-1', small: 'mb-1', ultraSmall: 'mobile-backup-mb-xs' })}`}>Organization ID</label>
                  <div className={`${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} font-mono ${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-xs' })} ${getTruncation({ normal: 'break-all', small: 'break-all', ultraSmall: 'mobile-backup-break-words' })}`}>
                    {selectedUser.organizationId}
                  </div>
                </div>
              )}

              <div>
                <label className={`block ${getTextSize({ normal: 'text-sm', small: 'text-xs', ultraSmall: 'mobile-backup-text-sm' })} font-medium ${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getMargin({ normal: 'mb-1', small: 'mb-1', ultraSmall: 'mobile-backup-mb-xs' })}`}>Registration Date</label>
                <div className={`${getColor({ normal: 'text-foreground-light dark:text-foreground-dark', small: 'text-foreground-light dark:text-foreground-dark', ultraSmall: 'mobile-backup-text-primary' })} ${getTextSize({ normal: 'text-base', small: 'text-sm', ultraSmall: 'mobile-backup-text-sm' })}`}>
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action Buttons - responsive layout */}
            <div className={`flex ${getLayout({ normal: 'flex-row justify-end', small: 'flex-col', ultraSmall: 'mobile-backup-stack' })} ${getGap({ normal: 'gap-3', small: 'gap-2', ultraSmall: 'mobile-backup-gap-xs' })} ${getPadding({ normal: 'pt-4', small: 'pt-3', ultraSmall: 'mobile-backup-pt-sm' })} border-t ${getBorder({ normal: 'border-border-light dark:border-border-dark', small: 'border-border-light dark:border-border-dark', ultraSmall: 'mobile-backup-border' })}`}>
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className={`${getWidth({ normal: 'w-auto', small: 'w-full', ultraSmall: 'mobile-backup-w-full' })} ${getVisibility({ normal: 'order-3 sm:order-1', small: 'order-3', ultraSmall: 'mobile-backup-order-3' })}`}
                size="sm"
              >
                Close
              </Button>
              <div className={`flex ${getGap({ normal: 'gap-3', small: 'gap-2', ultraSmall: 'mobile-backup-gap-xs' })} ${getVisibility({ normal: 'order-1 sm:order-2', small: 'order-1', ultraSmall: 'mobile-backup-order-1' })}`}>
                <Button
                  variant="error"
                  onClick={() => handleRejectUser(selectedUser.id)}
                  loading={actionLoading === selectedUser.id}
                  leftIcon={<XCircle className={`${getIconSize({ normal: 'h-4 w-4', small: 'h-3 w-3', ultraSmall: 'mobile-backup-icon-xs' })}`} />}
                  className={`${getWidth({ normal: 'w-auto', small: 'flex-1', ultraSmall: 'mobile-backup-w-full' })}`}
                  size="sm"
                >
                  <span className={`${getVisibility({ normal: 'hidden xs:inline', small: 'hidden xs:inline', ultraSmall: 'mobile-backup-hidden' })}`}>Reject</span>
                  <span className={`${getVisibility({ normal: 'xs:hidden', small: 'xs:hidden', ultraSmall: 'mobile-backup-block' })}`}>Reject</span>
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleApproveUser(selectedUser.id)}
                  loading={actionLoading === selectedUser.id}
                  leftIcon={<CheckCircle className={`${getIconSize({ normal: 'h-4 w-4', small: 'h-3 w-3', ultraSmall: 'mobile-backup-icon-xs' })}`} />}
                  className={`${getWidth({ normal: 'w-auto', small: 'flex-1', ultraSmall: 'mobile-backup-w-full' })}`}
                  size="sm"
                >
                  <span className={`${getVisibility({ normal: 'hidden xs:inline', small: 'hidden xs:inline', ultraSmall: 'mobile-backup-hidden' })}`}>Approve</span>
                  <span className={`${getVisibility({ normal: 'xs:hidden', small: 'xs:hidden', ultraSmall: 'mobile-backup-block' })}`}>Approve</span>
                </Button>
              </div>
            </div>
          </MobileBackup>
        )}
      </Modal>
    </div>
  );
}