import React, { useState } from 'react';
import { Shield, Users, Settings, Eye, Edit, Plus } from 'lucide-react';
import { UserRole } from '../types';

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
      role: 'sr_den',
      permissions: ['inspection_approve', 'reports_generate', 'audit_view']
    },
    {
      role: 'den',
      permissions: ['inspection_approve', 'reports_generate']
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

  const roles = [
    { value: 'admin' as UserRole, label: 'Administrator', color: 'bg-red-100 text-red-800', users: 2 },
    { value: 'drm' as UserRole, label: 'DRM', color: 'bg-blue-100 text-blue-800', users: 5 },
    { value: 'sr_den' as UserRole, label: 'Sr. DEN', color: 'bg-green-100 text-green-800', users: 12 },
    { value: 'den' as UserRole, label: 'DEN', color: 'bg-yellow-100 text-yellow-800', users: 25 },
    { value: 'inspector' as UserRole, label: 'Inspector', color: 'bg-purple-100 text-purple-800', users: 150 },
    { value: 'manufacturer' as UserRole, label: 'Manufacturer', color: 'bg-gray-100 text-gray-800', users: 8 }
  ];

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Role Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage user roles and permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Roles</h2>
            <button className="bg-blue-800 hover:bg-blue-900 text-white p-2 rounded-lg transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === role.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
                    {role.label}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{role.users} users</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Permissions for {roles.find(r => r.value === selectedRole)?.label}
            </h2>
            <button className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
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
                {roles.reduce((sum, role) => sum + role.users, 0)}
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
    </div>
  );
};

export default RoleManagement;