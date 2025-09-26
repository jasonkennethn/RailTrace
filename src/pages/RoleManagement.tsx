import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, Eye, Edit, Plus } from 'lucide-react';
import { UserRole } from '../types';
import { UsersService, RolesService } from '../services/dataService';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermissions {
  role: UserRole;
  permissions: string[];
}

const RoleManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscriptions
  useEffect(() => {
    const unsubscribeRoles = RolesService.subscribeToRoles((fetchedRoles) => {
      setRoles(fetchedRoles);
      setLoading(false);
    });

    const unsubscribeUsers = UsersService.subscribeToUsers((fetchedUsers) => {
      setUsers(fetchedUsers);
    });

    return () => {
      unsubscribeRoles();
      unsubscribeUsers();
    };
  }, []);

  const permissions: Permission[] = [
    { id: 'user_create', name: 'Create Users', description: 'Create new user accounts', category: 'User Management' },
    { id: 'user_edit', name: 'Edit Users', description: 'Modify user information', category: 'User Management' },
    { id: 'user_delete', name: 'Delete Users', description: 'Remove user accounts', category: 'User Management' },
    { id: 'role_manage', name: 'Manage Roles', description: 'Assign and modify user roles', category: 'Role Management' },
    { id: 'audit_view', name: 'View Audit Logs', description: 'Access system audit trails', category: 'Audit' },
    { id: 'audit_export', name: 'Export Audit Logs', description: 'Export audit data', category: 'Audit' },
    { id: 'inspection_create', name: 'Create Inspections', description: 'Record new inspections', category: 'Inspections' },
    { id: 'inspection_approve', name: 'Approve Inspections', description: 'Approve inspection reports', category: 'Inspections' },
    { id: 'inventory_manage', name: 'Manage Inventory', description: 'Add/edit inventory items', category: 'Inventory' },
    { id: 'reports_generate', name: 'Generate Reports', description: 'Create system reports', category: 'Reports' },
    { id: 'settings_modify', name: 'Modify Settings', description: 'Change system settings', category: 'Settings' },
    { id: 'blockchain_view', name: 'View Blockchain', description: 'Access blockchain records', category: 'Blockchain' }
  ];

  const rolePermissions: RolePermissions[] = [
    {
      role: 'admin',
      permissions: permissions.map(p => p.id) // Admin has all permissions
    },
    {
      role: 'drm',
      permissions: ['audit_view', 'inspection_approve', 'reports_generate', 'blockchain_view']
    },
    {
      role: 'den',
      permissions: ['inspection_approve', 'reports_generate', 'audit_view']
    },
    {
      role: 'inspector',
      permissions: ['inspection_create', 'blockchain_view']
    },
    {
      role: 'manufacturer',
      permissions: ['inventory_manage', 'reports_generate']
    }
  ];

  // Calculate role statistics dynamically based on real users data and database roles
  const predefinedRoles = [
    { value: 'admin' as UserRole, label: 'Administrator', color: 'bg-red-100 text-red-800' },
    { value: 'drm' as UserRole, label: 'DRM', color: 'bg-blue-100 text-blue-800' },
    { value: 'den' as UserRole, label: 'DEN', color: 'bg-green-100 text-green-800' },
    { value: 'inspector' as UserRole, label: 'Field Inspector', color: 'bg-purple-100 text-purple-800' },
    { value: 'manufacturer' as UserRole, label: 'Manufacturer', color: 'bg-orange-100 text-orange-800' },
  ];

  // Get unique roles from database and combine with predefined ones
  const databaseRoles = roles.map(role => ({
    value: role.role,
    label: role.name,
    color: 'bg-cyan-100 text-cyan-800' // New roles get cyan color
  }));

  // Merge predefined and database roles, avoiding duplicates
  const allRoles = [...predefinedRoles];
  databaseRoles.forEach(dbRole => {
    if (!predefinedRoles.find(pr => pr.value === dbRole.value)) {
      allRoles.push(dbRole);
    }
  });

  const roleStats = allRoles.map(role => ({
    ...role,
    users: users.filter(u => u.role === role.value).length
  }));

  const getCurrentRolePermissions = () => {
    return rolePermissions.find(rp => rp.role === selectedRole)?.permissions || [];
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const hasPermission = (permissionId: string) => {
    return getCurrentRolePermissions().includes(permissionId);
  };

  const handleAddRole = async () => {
    if (!newRole.name || !newRole.description) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      await RolesService.addRole({
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        role: newRole.name.toLowerCase().replace(/\s+/g, '_') // Generate role key from name
      });
      
      setShowAddRoleModal(false);
      setNewRole({
        name: '',
        description: '',
        permissions: []
      });
      alert('Role added successfully!');
    } catch (error) {
      console.error('Error adding role:', error);
      alert('Failed to add role. Please try again.');
    }
  };

  const handleEditPermissions = () => {
    setEditingPermissions(getCurrentRolePermissions());
    setShowEditPermissionsModal(true);
  };

  const handleSavePermissions = () => {
    console.log('Saving permissions for', selectedRole, ':', editingPermissions);
    setShowEditPermissionsModal(false);
    alert('Permissions updated successfully! (This is a demo)');
  };

  const togglePermission = (permissionId: string) => {
    setEditingPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Role Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage user roles and permissions</p>
          </div>
          <button
            onClick={() => setShowAddRoleModal(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Roles</h2>
          </div>
          <div className="space-y-3">
            {roleStats.map((rolestat) => (
              <div
                key={rolestat.value}
                onClick={() => setSelectedRole(rolestat.value)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === rolestat.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rolestat.color}`}>
                    {rolestat.label}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{rolestat.users} users</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Permissions for {roleStats.find(r => r.value === selectedRole)?.label}
            </h2>
            <button 
              onClick={handleEditPermissions}
              className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Edit Permissions</span>
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{category}</h3>
                <div className="space-y-3">
                  {categoryPermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className={`p-4 rounded-lg border ${
                        hasPermission(permission.id)
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${
                              hasPermission(permission.id) ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900">{permission.name}</p>
                              <p className="text-sm text-gray-600">{permission.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {hasPermission(permission.id) ? (
                            <span className="text-green-600 text-sm font-medium">Granted</span>
                          ) : (
                            <span className="text-gray-400 text-sm font-medium">Denied</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Permissions</p>
              <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Permissions</p>
              <p className="text-2xl font-bold text-gray-900">{getCurrentRolePermissions().length}</p>
            </div>
            <Settings className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Role</h2>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter role name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter role description"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleAddRole}
                  className="flex-1 bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Add Role
                </button>
                <button
                  onClick={() => setShowAddRoleModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showEditPermissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Permissions for {roleStats.find(r => r.value === selectedRole)?.label}
              </h2>
              <button
                onClick={() => setShowEditPermissionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{category}</h3>
                  <div className="space-y-3">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{permission.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{permission.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleSavePermissions}
                className="flex-1 bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Save Permissions
              </button>
              <button
                onClick={() => setShowEditPermissionsModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;