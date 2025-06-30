import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Settings, Users, BarChart3, FileText, Activity } from 'lucide-react';
import RealTimeMetrics from '../components/admin/RealTimeMetrics';
import AdminRoute from '../components/auth/AdminRoute';
import PermissionGate from '../components/auth/PermissionGate';
import { PERMISSIONS } from '../utils/rbac';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const { user, role, canAccessAnalytics, canManageUsers, canManageContent, canManageSystem } = usePermissions();

  const tabs = [
    { 
      id: 'analytics', 
      label: 'Real-time Analytics', 
      icon: Activity,
      permission: PERMISSIONS.ANALYTICS_ACCESS,
      available: canAccessAnalytics()
    },
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: BarChart3,
      permission: PERMISSIONS.ADMIN_DASHBOARD_ACCESS,
      available: true // Always available if user can access admin dashboard
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users,
      permission: PERMISSIONS.USER_MANAGEMENT,
      available: canManageUsers()
    },
    { 
      id: 'content', 
      label: 'Content', 
      icon: FileText,
      permission: PERMISSIONS.CONTENT_MANAGEMENT,
      available: canManageContent()
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      permission: PERMISSIONS.SYSTEM_SETTINGS,
      available: canManageSystem()
    }
  ];

  const availableTabs = tabs.filter(tab => tab.available);

  const adminStats = [
    { label: 'Total Users', value: '1,247', icon: Users, color: 'bg-blue-500' },
    { label: 'Monthly Visitors', value: '15,832', icon: BarChart3, color: 'bg-green-500' },
    { label: 'Content Views', value: '45,291', icon: FileText, color: 'bg-purple-500' },
    { label: 'Active Sessions', value: '892', icon: Settings, color: 'bg-orange-500' }
  ];

  const recentActivity = [
    { action: 'New user registration', user: 'John Doe', time: '2 minutes ago' },
    { action: 'Content viewed', user: 'Mary Smith', time: '5 minutes ago' },
    { action: 'Donation received', user: 'David Johnson', time: '12 minutes ago' },
    { action: 'Newsletter subscription', user: 'Sarah Wilson', time: '18 minutes ago' },
    { action: 'Contact form submitted', user: 'Michael Brown', time: '25 minutes ago' }
  ];

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                  <Settings className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">
                    Welcome back, {user?.user_metadata?.full_name || 'Admin'} • Role: {role}
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-red-700">
                  Admin Access Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <nav className="flex space-x-8 overflow-x-auto">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-red-100 text-red-700 border-2 border-red-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'analytics' && (
            <PermissionGate 
              permission={PERMISSIONS.ANALYTICS_ACCESS}
              fallback={
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                  <p className="text-gray-600">You don't have permission to view analytics data.</p>
                </div>
              }
            >
              <RealTimeMetrics />
            </PermissionGate>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminStats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="text-white" size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.user}</p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <PermissionGate permission={PERMISSIONS.USER_MANAGEMENT}>
                      <button className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200">
                        <Users className="text-red-600" size={20} />
                        <span className="font-medium text-gray-900">Manage Users</span>
                      </button>
                    </PermissionGate>
                    
                    <PermissionGate permission={PERMISSIONS.ANALYTICS_ACCESS}>
                      <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                        <BarChart3 className="text-blue-600" size={20} />
                        <span className="font-medium text-gray-900">View Analytics</span>
                      </button>
                    </PermissionGate>
                    
                    <PermissionGate permission={PERMISSIONS.CONTENT_MANAGEMENT}>
                      <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                        <FileText className="text-green-600" size={20} />
                        <span className="font-medium text-gray-900">Content Management</span>
                      </button>
                    </PermissionGate>
                    
                    <PermissionGate permission={PERMISSIONS.SYSTEM_SETTINGS}>
                      <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                        <Settings className="text-purple-600" size={20} />
                        <span className="font-medium text-gray-900">System Settings</span>
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>

              {/* Ministry Overview */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Ministry Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Growth</h3>
                    <p className="text-gray-600">Our community continues to grow with new members joining daily to experience God's transforming word.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="text-blue-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Impact Metrics</h3>
                    <p className="text-gray-600">Track the reach and impact of our multilingual spoken word ministry across different regions.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Library</h3>
                    <p className="text-gray-600">Manage and organize our growing collection of spoken word content in multiple languages.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder content for other tabs with permission checks */}
          {activeTab === 'users' && (
            <PermissionGate 
              permission={PERMISSIONS.USER_MANAGEMENT}
              fallback={
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                  <p className="text-gray-600">You don't have permission to manage users.</p>
                </div>
              }
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
                <p className="text-gray-600">User management functionality will be implemented here.</p>
              </div>
            </PermissionGate>
          )}

          {activeTab === 'content' && (
            <PermissionGate 
              permission={PERMISSIONS.CONTENT_MANAGEMENT}
              fallback={
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                  <p className="text-gray-600">You don't have permission to manage content.</p>
                </div>
              }
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Content Management</h2>
                <p className="text-gray-600">Content management functionality will be implemented here.</p>
              </div>
            </PermissionGate>
          )}

          {activeTab === 'settings' && (
            <PermissionGate 
              permission={PERMISSIONS.SYSTEM_SETTINGS}
              fallback={
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                  <p className="text-gray-600">You don't have permission to access system settings.</p>
                </div>
              }
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
                <p className="text-gray-600">System settings functionality will be implemented here.</p>
              </div>
            </PermissionGate>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminPage;