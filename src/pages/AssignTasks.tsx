import React, { useState, useEffect } from 'react';
import { UserPlus, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { TasksService, UsersService } from '../services/dataService';
import clsx from 'clsx';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'inspection' | 'maintenance' | 'repair' | 'survey';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  assignedToRole: string;
  section: string;
  dueDate: Date;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  createdDate: Date;
  estimatedHours: number;
  notes?: string;
}

const AssignTasks: React.FC = () => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    type: 'inspection',
    priority: 'medium',
    assignedTo: '',
    assignedToRole: 'Field Inspector',
    section: '',
    dueDate: new Date(),
    estimatedHours: 8
  });

  useEffect(() => {
    // Real-time data subscription for tasks
    const unsubscribeTasks = TasksService.subscribeToTasks((fetchedTasks) => {
      setTasks(fetchedTasks);
      setLoading(false);
    });

    // Real-time data subscription for users (field inspectors)
    const unsubscribeUsers = UsersService.subscribeToUsers((fetchedUsers) => {
      // Filter to only show field inspectors
      const fieldInspectors = fetchedUsers.filter(user => user.role === 'inspector');
      setUsers(fieldInspectors);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeUsers();
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  const createTask = async () => {
    if (newTask.title && newTask.assignedTo && newTask.section) {
      const task: Omit<Task, 'id' | 'createdDate'> = {
        title: newTask.title!,
        description: newTask.description || '',
        type: newTask.type as Task['type'],
        priority: newTask.priority as Task['priority'],
        assignedTo: newTask.assignedTo!,
        assignedToRole: newTask.assignedToRole!,
        section: newTask.section!,
        dueDate: newTask.dueDate!,
        status: 'assigned',
        estimatedHours: newTask.estimatedHours || 8,
        notes: newTask.notes
      };

      try {
        // Add task using the TasksService
        await TasksService.addTask(task);
        console.log('Task created successfully');
        
        // Close modal and reset form immediately
        setShowCreateModal(false);
        setShowUserDropdown(false);
        setUserSearch('');
        setNewTask({
          title: '',
          description: '',
          type: 'inspection',
          priority: 'medium',
          assignedTo: '',
          assignedToRole: 'Field Inspector',
          section: '',
          dueDate: new Date(),
          estimatedHours: 8,
          notes: ''
        });
        
        alert('Task created successfully!');
      } catch (error) {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please try again.');
      }
    } else {
      alert('Please fill in all required fields (Title, Assigned To, and Section).');
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectUser = (user: any) => {
    setNewTask({ ...newTask, assignedTo: user.name });
    setShowUserDropdown(false);
    setUserSearch('');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress':
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
        return <CheckCircle className="h-4 w-4" />;
      case 'maintenance':
        return <Calendar className="h-4 w-4" />;
      case 'repair':
        return <AlertTriangle className="h-4 w-4" />;
      case 'survey':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Assign Tasks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Allocate inspection and maintenance tasks to AENs and Field Inspectors
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.id}</h3>
              <div className="flex items-center space-x-2">
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityColor(task.priority)
                )}>
                  {task.priority}
                </span>
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getStatusColor(task.status)
                )}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="text-primary-600 dark:text-primary-400">
                    {getTypeIcon(task.type)}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{task.type}</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assigned To</p>
                  <p className="font-medium text-gray-900 dark:text-white">{task.assignedTo}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{task.assignedToRole}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Section</p>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{task.section}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{task.dueDate.toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Est. Hours</p>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{task.estimatedHours}h</p>
                  </div>
                </div>
              </div>

              {task.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{task.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
              <div className="flex space-x-2">
                {task.status === 'assigned' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    Start Task
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    Complete
                  </button>
                )}
                <button 
                  onClick={() => {
                    setSelectedTask(task);
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Type</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value as Task['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  >
                    <option value="inspection">Inspection</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="survey">Survey</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                  <div className="relative">
                    <div 
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white cursor-pointer flex items-center justify-between"
                    >
                      <span className={newTask.assignedTo ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
                        {newTask.assignedTo || 'Select Field Inspector'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    {showUserDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Search inspectors..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                onClick={() => selectUser(user)}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-dark-600 cursor-pointer flex items-center space-x-2"
                              >
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                                  <span className="text-white font-semibold text-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">{user.name}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                              No field inspectors found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <input
                    type="text"
                    value="Field Inspector"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                  <input
                    type="text"
                    value={newTask.section}
                    onChange={(e) => setNewTask({ ...newTask, section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Section A-123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    min="1"
                    max="24"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="Additional notes or instructions"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={createTask}
                  disabled={!newTask.title || !newTask.assignedTo || !newTask.section}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create Task</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-dark-600 hover:bg-gray-400 dark:hover:bg-dark-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Header */}
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedTask.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getPriorityColor(selectedTask.priority)
                    )}>
                      {selectedTask.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(selectedTask.status)
                    )}>
                      {selectedTask.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  {getTypeIcon(selectedTask.type)}
                  <span className="capitalize">{selectedTask.type}</span>
                  <span>•</span>
                  <span>Task ID: {selectedTask.id}</span>
                </div>
              </div>

              {/* Task Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                      <p className="text-gray-900 dark:text-white">{selectedTask.description || 'No description provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedTask.assignedTo}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{selectedTask.assignedToRole}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedTask.section}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedTask.dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Hours</label>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedTask.estimatedHours} hours</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedTask.createdDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {selectedTask.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white">{selectedTask.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                {selectedTask.status === 'assigned' && (
                  <button
                    onClick={() => {
                      updateTaskStatus(selectedTask.id, 'in_progress');
                      setShowDetailsModal(false);
                      setSelectedTask(null);
                    }}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Start Task
                  </button>
                )}
                {selectedTask.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      updateTaskStatus(selectedTask.id, 'completed');
                      setShowDetailsModal(false);
                      setSelectedTask(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedTask(null);
                  }}
                  className="flex-1 bg-gray-300 dark:bg-dark-600 hover:bg-gray-400 dark:hover:bg-dark-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignTasks;