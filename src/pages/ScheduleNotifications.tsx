import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Clock, AlertTriangle, CheckCircle, Plus, Filter } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'inspection' | 'deadline' | 'alert' | 'maintenance';
  priority: 'low' | 'medium' | 'high';
  date: Date;
  status: 'pending' | 'completed' | 'overdue';
  assignedTo?: string;
}

const ScheduleNotifications: React.FC = () => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Track Inspection Due - Section A-123',
        description: 'Monthly track inspection scheduled for high-traffic section',
        type: 'inspection',
        priority: 'high',
        date: new Date('2024-01-25T09:00:00'),
        status: 'pending',
        assignedTo: 'Inspector Kumar'
      },
      {
        id: '2',
        title: 'Bridge Maintenance Deadline',
        description: 'Annual bridge maintenance work must be completed',
        type: 'deadline',
        priority: 'high',
        date: new Date('2024-01-30T17:00:00'),
        status: 'pending',
        assignedTo: 'Sr. DEN Mumbai'
      },
      {
        id: '3',
        title: 'Signal System Alert',
        description: 'Signal box showing intermittent faults - requires attention',
        type: 'alert',
        priority: 'medium',
        date: new Date('2024-01-22T14:30:00'),
        status: 'completed',
        assignedTo: 'DEN Central'
      },
      {
        id: '4',
        title: 'Rail Joint Replacement',
        description: 'Scheduled replacement of worn rail joints in Section B-456',
        type: 'maintenance',
        priority: 'medium',
        date: new Date('2024-01-28T08:00:00'),
        status: 'pending',
        assignedTo: 'AEN Sharma'
      },
      {
        id: '5',
        title: 'Safety Inspection Overdue',
        description: 'Quarterly safety inspection is 3 days overdue',
        type: 'inspection',
        priority: 'high',
        date: new Date('2024-01-18T10:00:00'),
        status: 'overdue',
        assignedTo: 'Inspector Singh'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = filter === 'all' || notification.status === filter;
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    return matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inspection':
        return <CheckCircle className="h-5 w-5" />;
      case 'deadline':
        return <Clock className="h-5 w-5" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5" />;
      case 'maintenance':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Schedule & Notifications
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track important inspections, deadlines, and alerts
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex space-x-2">
              {['all', 'pending', 'completed', 'overdue'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={clsx(
                    'px-3 py-2 rounded-lg font-medium transition-colors text-sm',
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="inspection">Inspections</option>
                <option value="deadline">Deadlines</option>
                <option value="alert">Alerts</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Notifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="text-primary-600 dark:text-primary-400">
                  {getTypeIcon(notification.type)}
                </div>
                <span className="font-medium text-gray-900 dark:text-white capitalize text-sm">
                  {notification.type}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityColor(notification.priority)
                )}>
                  {notification.priority}
                </span>
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getStatusColor(notification.status)
                )}>
                  {notification.status}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {notification.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {notification.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{notification.date.toLocaleDateString()}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{notification.date.toLocaleTimeString()}</span>
              </div>
              {notification.assignedTo && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Assigned to: {notification.assignedTo}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.length}
              </p>
            </div>
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.status === 'overdue').length}
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleNotifications;