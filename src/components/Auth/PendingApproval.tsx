import React from 'react';
import { Clock, Mail, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export function PendingApproval() {
  const { userData, logout, loading } = useAuth();

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account details...</p>
        </div>
      </div>
    );
  }

  // Show error state if no user data is available
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Error</h1>
          <p className="text-gray-600 mb-4">Unable to load account details. Please try again.</p>
          <Button onClick={logout} className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Account Pending Approval</h1>
          <Badge variant="warning" className="mt-2">
            Awaiting Admin Review
          </Badge>
        </CardHeader>

        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-gray-600">
              Thank you for registering with RailTrace. Your account has been created successfully and is currently under review by our administrators.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-medium text-blue-900">Security Review Process</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    All new accounts undergo a security verification to ensure the integrity of our railway fittings management system.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Account Details:</h3>
              <div className="space-y-2 text-sm text-gray-700 text-left">
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="text-gray-900 font-semibold">{userData.name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="text-gray-900 font-semibold">{userData.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium text-gray-600">Role:</span>
                  <span className="text-gray-900 font-semibold capitalize">{userData.role || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium text-gray-600">Organization:</span>
                  <span className="text-gray-900 font-semibold">{userData.organizationName || 'Not provided'}</span>
                </div>
                {userData.organizationId && (
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-gray-600">Organization ID:</span>
                    <span className="text-gray-900 font-semibold text-xs">{userData.organizationId}</span>
                  </div>
                )}
              </div>
              
              {/* Debug section - remove this in production */}
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <details>
                  <summary className="cursor-pointer font-medium text-yellow-800">Debug: Raw User Data</summary>
                  <pre className="mt-2 text-xs text-yellow-700 overflow-auto">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </details>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <span>You'll receive an email notification once approved</span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                Need immediate access? Contact your system administrator.
              </p>
              
              <Button
                variant="outline"
                onClick={logout}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}