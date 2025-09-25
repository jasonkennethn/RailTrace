import React, { useState, useEffect } from 'react';
import { UserPlus, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, Plus, Search, Filter } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    type: 'inspection',
    priority: 'medium',
    assignedTo: '',
    assignedToRole: 'AEN',
    section: '',
    dueDate: new Date(),
    estimatedHours: 8
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      // Mock tasks data
      const mockTasks: Task[] = [
        {
          id: 'TASK-001',
          title: 'Track Inspection - Section A-123',
          description: 'Conduct comprehensive track inspection including rail condition, joint integrity, and fastener status',
          type: 'inspection',
          priority: 'high',
          assignedTo: 'AEN Kumar',
          assignedToRole: 'AEN',
          section: 'Section A-123',
          dueDate: new Date('2024-01-25'),
          status: 'assigned',
          createdDate: new Date('2024-01-20'),
          estimatedHours: 6,
          notes: 'Focus on high-traffic areas and recent maintenance zones'
        },
        {
          id: 'TASK-002',
          title: 'Rail Joint Replacement',
          description: 'Replace worn rail joints in Section B-456 as identified in last inspection',
          type: 'maintenance',
          priority: 'medium',
          assignedTo: 'AEN Sharma',
          assignedToRole: 'AEN',
          section: 'Section B-456',
          dueDate: new Date('2024-01-28'),
          status: 'in_progress',
          createdDate: new Date('2024-01-18'),
          estimatedHours: 12,
          notes: 'Materials already ordered and delivered to site'
        },
        {
          id: 'TASK-003',
          title: 'Signal System Survey',
          description: 'Survey existing signal infrastructure for upcoming digitization project',
          type: 'survey',
          priority: 'low',
          assignedTo: 'AEN Patel',
          assignedToRole: 'AEN',
          section: 'Section C-789',
          dueDate: new Date('2024-02-05'),
          status: 'assigned',
          createdDate: new Date('2024-01-19'),
          estimatedHours: 16,
          notes: 'Coordinate with signaling department for technical specifications'
        },
        {
          id: 'TASK-004',
          title: 'Emergency Track Repair',
          description: 'Repair damaged track section due to heavy rainfall impact',
          type: 'repair',
          priority: 'high',
          assignedTo: 'AEN Singh',
          assignedToRole: 'AEN',
          section: 'Section D-012',
          dueDate: new Date('2024-01-22'),
          status: 'overdue',
          createdDate: new Date('2024-01-15'),
          estimatedHours: 8,
          notes: 'Urgent repair required to restore normal operations'
        },
        {
          id: 'TASK-005',
          title: 'Sleeper Condition Assessment',
          description: 'Assess concrete sleeper condition and identify replacement requirements',
          type: 'inspection',
          priority: 'medium',
          assignedTo: 'AEN Gupta',
          assignedToRole: 'AEN',
          section: 'Section E-345',
          dueDate: new Date('2024-01-30'),
          status: 'completed',
          createdDate: new Date('2024-01-16'),
          estimatedHours: 10,
          notes: 'Report submitted with detailed findings and recommendations'
        }
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const createTask = () => {
    if (newTask.title && newTask.assignedTo && newTask.section) {
      const task: Task = {
        id: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
        title: newTask.title!,
        description: newTask.description || '',
        type: newTask.type as Task['type'],
        priority: newTask.priority as Task['priority'],
        assignedTo: newTask.assignedTo!,
        assignedToRole: newTask.assignedToRole!,
        section: newTask.section!,
        dueDate: newTask.dueDate!,
        status: 'assigned',
        createdDate: new Date(),
        estimatedHours: newTask.estimatedHours || 8,
        notes: newTask.notes
      };

      setTasks([...tasks, task]);
      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        type: 'inspection',
        priority: 'medium',
        assignedTo: '',
        assignedToRole: 'AEN',
        section: '',
        dueDate: new Date(),
        estimatedHours: 8
      });
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
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
                <button className="flex-1 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors">
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
                  <input
                    type="text"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="Enter assignee name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={newTask.assignedToRole}
                    onChange={(e) => setNewTask({ ...newTask, assignedToRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  >
                    <option value="AEN">AEN</option>
                    <option value="Inspector">Inspector</option>
                  </select>
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
                  onClick={createTask}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
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

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
            </div>
            <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {tasks.filter(t => t.status === 'in_progress').length}
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
                {tasks.filter(t => t.status === 'completed').length}
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
                {tasks.filter(t => t.status === 'overdue').length}
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTasks;