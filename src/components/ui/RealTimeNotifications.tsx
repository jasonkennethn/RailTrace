import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Bell, X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
  read: boolean;
  source: 'blockchain' | 'ai' | 'system' | 'user';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
}

interface RealTimeNotificationsProps {
  className?: string;
}

export function RealTimeNotifications({ className = '' }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time notification subscription with fallback mock data
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs || [];
      let newNotifications = docs.map(doc => {
        const data: any = doc.data() || {};
        return {
          id: doc.id,
          title: data.title || 'Notification',
          message: data.message || '',
          type: (data.type as any) || 'info',
          timestamp: (data.timestamp && typeof (data.timestamp as any).toDate === 'function') ? (data.timestamp as any).toDate() : new Date(),
          read: !!data.read,
          source: (data.source as any) || 'system',
          priority: (data.priority as any) || 'medium',
          actionUrl: data.actionUrl as string | undefined
        } as Notification;
      });

      // If no Firestore notifications, inject mock data
      if (newNotifications.length === 0) {
        newNotifications = [
          {
            id: 'mock-1',
            title: 'Welcome to RailTrace',
            message: 'This is a demo notification. You will see live updates here.',
            type: 'info',
            timestamp: new Date(Date.now() - 2 * 60 * 1000),
            read: false,
            source: 'system',
            priority: 'medium'
          },
          {
            id: 'mock-2',
            title: 'Shipment delayed',
            message: 'Shipment SHP-1042 is delayed due to weather conditions.',
            type: 'warning',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            read: false,
            source: 'ai',
            priority: 'high'
          },
          {
            id: 'mock-3',
            title: 'Block validated',
            message: 'Blockchain audit confirmed transaction TX-9F3C for batch B-2207.',
            type: 'success',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            read: true,
            source: 'blockchain',
            priority: 'low'
          }
        ];
      }

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    }, () => {
      // On subscription error (e.g., missing permissions), show mock data
      const fallback = [
        {
          id: 'mock-err-1',
          title: 'Demo notifications',
          message: 'Unable to load from Firestore. Showing sample items.',
          type: 'info',
          timestamp: new Date(),
          read: false,
          source: 'system',
          priority: 'medium'
        }
      ] as Notification[];
      setNotifications(fallback);
      setUnreadCount(1);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        if (!n.read) {
          const ref = doc(db, 'notifications', n.id);
          batch.update(ref, { read: true });
        }
      });
      await batch.commit();
    } catch (e) {
      // If batch fails, keep UI state but log error
      console.error('Failed to mark all notifications as read:', e);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = "h-4 w-4";
    
    if (priority === 'critical') {
      return <AlertCircle className={`${iconClass} text-red-500`} />;
    }
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#57606a] dark:text-[#8b949e] hover:text-[#1773cf] transition-colors rounded-lg hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0d1117] dark:text-[#c9d1d9]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2 py-1 text-xs sm:text-sm font-medium text-white bg-[#1773cf] hover:bg-[#1663b3] rounded-md transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#57606a] dark:text-[#8b949e]">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-l-4 border-b border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type, notification.priority)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-[#0d1117] dark:text-[#c9d1d9] truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e] ml-2">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-[#f6f8fa] dark:bg-[#21262d] text-[#57606a] dark:text-[#8b949e] rounded-full">
                          {notification.source}
                        </span>
                        {notification.priority === 'critical' && (
                          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full">
                            Critical
                          </span>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-[#1773cf] rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
