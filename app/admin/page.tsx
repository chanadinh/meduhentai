'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  Upload, 
  Settings, 
  BarChart3,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';

interface Stats {
  totalManga: number;
  totalChapters: number;
  totalUsers: number;
  totalComments: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-dark-600">Đang tải...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-900">Bảng quản trị</h1>
            <p className="text-dark-600 mt-2">
              Chào mừng trở lại, {session.user.username}!
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-dark-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-600">Tổng Manga</p>
                  <p className="text-3xl font-bold text-primary-600">{stats.totalManga}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-dark-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-600">Tổng Chương</p>
                  <p className="text-3xl font-bold text-accent-600">{stats.totalChapters}</p>
                </div>
                <div className="p-3 bg-accent-100 rounded-lg">
                  <Upload className="h-6 w-6 text-accent-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-dark-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-600">Tổng Người dùng</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-dark-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-600">Tổng Bình luận</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalComments}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-dark-200">
          <h2 className="text-xl font-semibold text-dark-900 mb-6">Thao tác nhanh</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/manage')}
              className="flex items-center space-x-3 p-4 border border-dark-200 rounded-lg hover:bg-dark-50 transition-colors duration-200"
            >
              <div className="p-2 bg-primary-100 rounded-lg">
                <Plus className="h-5 w-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-dark-900">Quản lý Nội dung</p>
                <p className="text-sm text-dark-600">Tải lên, chỉnh sửa manga và chương</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center space-x-3 p-4 border border-dark-200 rounded-lg hover:bg-dark-50 transition-colors duration-200"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-dark-900">Quản lý Người dùng</p>
                <p className="text-sm text-dark-600">Xem và quản lý tài khoản</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-dark-200">
          <h2 className="text-xl font-semibold text-dark-900 mb-6">Hoạt động gần đây</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-dark-50 rounded-lg">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Plus className="h-4 w-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900">Manga mới được thêm</p>
                <p className="text-xs text-dark-600">2 giờ trước</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-dark-50 rounded-lg">
              <div className="p-2 bg-accent-100 rounded-lg">
                <Upload className="h-4 w-4 text-accent-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900">Chương mới được cập nhật</p>
                <p className="text-xs text-dark-600">5 giờ trước</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-dark-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900">Người dùng mới đăng ký</p>
                <p className="text-xs text-dark-600">1 ngày trước</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
