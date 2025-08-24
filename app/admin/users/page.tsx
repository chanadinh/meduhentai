'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch users
      // For now, using mock data
      const mockUsers: User[] = [
        {
          _id: '1',
          username: 'admin',
          email: 'admin@meduhentai.com',
          role: 'admin',
          status: 'active',
          createdAt: '2024-01-01',
          lastLogin: '2024-01-15'
        },
        {
          _id: '2',
          username: 'user1',
          email: 'user1@example.com',
          role: 'user',
          status: 'active',
          createdAt: '2024-01-05',
          lastLogin: '2024-01-14'
        },
        {
          _id: '3',
          username: 'user2',
          email: 'user2@example.com',
          role: 'user',
          status: 'suspended',
          createdAt: '2024-01-10',
          lastLogin: '2024-01-12'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      // TODO: Implement API call to update user status
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    try {
      // TODO: Implement API call to update user role
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'banned': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: User['role']) => {
    return role === 'admin' ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage platform users and their permissions</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Users ({filteredUsers.length})</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value as User['role'])}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)} border-0`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user._id, e.target.value as User['status'])}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)} border-0`}
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-purple-600 hover:text-purple-900 mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
