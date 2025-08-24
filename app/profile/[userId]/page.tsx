'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Camera, 
  Trash2,
  Save,
  Edit3,
  Upload
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import toast from 'react-hot-toast';

interface UserProfile {
  username: string;
  email: string;
  avatar: string;
  role: string;
  createdAt: string;
  preferences: {
    theme: string;
    language: string;
  };
  stats: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    theme: 'auto',
    language: 'vi'
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user is viewing their own profile or has permission to view this profile
    if (session.user?.id !== userId) {
      // For now, only allow users to view their own profile
      // In the future, you could add admin permissions or public profiles
      router.push(`/profile/${session.user?.id}`);
      return;
    }

    fetchProfile();
  }, [session, status, router, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data.profile);
      setFormData({
        username: data.profile.username,
        email: data.profile.email,
        theme: data.profile.preferences?.theme || 'auto',
        language: data.profile.preferences?.language || 'vi'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      setProfile(prev => prev ? { ...prev, avatar: data.avatar } : null);
      setAvatarFile(null);
      setAvatarPreview('');
      toast.success('Avatar đã được cập nhật!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Không thể cập nhật avatar');
    }
  };

  const handleAvatarRemove = async () => {
    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove avatar');
      }

      setProfile(prev => prev ? { ...prev, avatar: '/medusa.ico' } : null);
      toast.success('Avatar đã được xóa!');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Không thể xóa avatar');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(prev => prev ? { ...prev, ...data.profile } : null);
      setEditing(false);
      toast.success('Hồ sơ đã được cập nhật!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật hồ sơ');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-dark-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-dark-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-dark-900">Không thể tải hồ sơ</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="profile-avatar">
                <img
                  src={avatarPreview || profile?.avatar || '/medusa.ico'}
                  alt={profile?.username || 'User'}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-strong"
                />
                <button
                  onClick={() => document.getElementById('avatar-input')?.click()}
                  className="absolute bottom-0 right-0 p-3 bg-primary-600 text-white rounded-full shadow-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            
            <h1 className="text-3xl font-bold text-white mt-4 mb-2">
              {profile?.username || 'User'}
            </h1>
            <p className="text-white/90 text-lg">
              {profile?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </p>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <p className="text-white/70 text-sm font-mono">
                ID: {session?.user?.id || 'N/A'}
              </p>
              <button
                onClick={() => {
                  if (session?.user?.id) {
                    navigator.clipboard.writeText(session.user.id);
                    toast.success('User ID đã được sao chép!');
                  }
                }}
                className="text-white/60 hover:text-white/80 transition-colors"
                title="Sao chép User ID"
              >
                📋
              </button>
            </div>
            
            {avatarFile && (
              <div className="mt-4 space-x-2">
                <button
                  onClick={handleAvatarUpload}
                  className="btn-primary btn-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu Avatar
                </button>
                <button
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview('');
                  }}
                  className="btn-outline btn-sm"
                >
                  Hủy
                </button>
              </div>
            )}
            
            <button
              onClick={handleAvatarRemove}
              className="mt-2 text-white/80 hover:text-white text-sm underline"
            >
              Xóa avatar
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="mt-8 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 border border-dark-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-dark-900">Thông tin cơ bản</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="btn-outline btn-sm"
              >
                {editing ? (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-primary-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Tên người dùng
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-dark-900">{profile?.username || 'N/A'}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-dark-900">{profile?.email || 'N/A'}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-primary-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    User ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-dark-900 font-mono text-sm">
                      {session?.user?.id || 'N/A'}
                    </p>
                    <button
                      onClick={() => {
                        if (session?.user?.id) {
                          navigator.clipboard.writeText(session.user.id);
                          toast.success('User ID đã được sao chép!');
                        }
                      }}
                      className="text-dark-500 hover:text-primary-600 transition-colors"
                      title="Sao chép User ID"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-primary-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Ngày tham gia
                  </label>
                  <p className="text-dark-900">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {editing && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleSaveProfile}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      username: profile?.username || '',
                      email: profile?.email || '',
                      theme: profile?.preferences?.theme || 'auto',
                      language: profile?.preferences?.language || 'vi'
                    });
                  }}
                  className="btn-outline"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl p-6 border border-dark-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-dark-900">Tùy chọn</h2>
              <Settings className="h-6 w-6 text-primary-600" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Giao diện
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  className="w-full px-3 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="auto">Tự động</option>
                  <option value="light">Sáng</option>
                  <option value="dark">Tối</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Ngôn ngữ
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl p-6 border border-dark-200">
            <h2 className="text-xl font-semibold text-dark-900 mb-4">Thống kê</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {(profile.stats?.totalViews || 0).toLocaleString()}
                </div>
                <div className="text-dark-600">Lượt xem</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">
                  {(profile.stats?.totalLikes || 0).toLocaleString()}
                </div>
                <div className="text-dark-600">Lượt thích</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(profile.stats?.totalComments || 0).toLocaleString()}
                </div>
                <div className="text-dark-600">Bình luận</div>
              </div>
            </div>
          </div>

          {/* My Uploaded Manga */}
          <div className="bg-white rounded-xl p-6 border border-dark-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-dark-900">Manga đã tải lên</h2>
              <Link href="/admin/upload" className="btn-primary btn-sm">
                <Upload className="h-4 w-4 mr-2" />
                Tải lên Manga mới
              </Link>
            </div>
            
            <MyMangaList />
          </div>
        </div>
      </main>
    </div>
  );
}

// MyMangaList Component
function MyMangaList() {
  const [mangas, setMangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMyManga();
  }, [page]);

  const fetchMyManga = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/manga/my?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch manga');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setMangas(data.mangas);
      } else {
        setMangas(prev => [...prev, ...data.mangas]);
      }
      
      setHasMore(data.pagination.hasNextPage);
    } catch (error) {
      console.error('Error fetching my manga:', error);
      toast.error('Không thể tải danh sách manga');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-dark-600">Đang tải...</p>
      </div>
    );
  }

  if (mangas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-dark-600 mb-4">Bạn chưa tải lên manga nào</p>
        <Link href="/admin/upload" className="btn-primary">
          <Upload className="h-4 w-4 mr-2" />
          Tải lên Manga đầu tiên
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mangas.map((manga) => (
          <div key={manga._id} className="bg-dark-50 rounded-lg p-4 border border-dark-200">
            <div className="flex items-center space-x-3">
              <img
                src={manga.coverImage}
                alt={manga.title}
                className="w-16 h-20 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-dark-900 truncate">{manga.title}</h3>
                <p className="text-sm text-dark-600">Chương: {manga.chaptersCount}</p>
                <p className="text-sm text-dark-600">Lượt xem: {manga.views}</p>
                <p className="text-sm text-dark-600">Đánh giá: {manga.rating}/5</p>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <Link
                href={`/manga/${manga._id}`}
                className="btn-outline btn-sm flex-1 text-center"
              >
                Xem
              </Link>
              <Link
                href={`/admin/manga/${manga._id}`}
                className="btn-primary btn-sm flex-1 text-center"
              >
                Chỉnh sửa
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-outline"
          >
            {loading ? 'Đang tải...' : 'Tải thêm'}
          </button>
        </div>
      )}
    </div>
  );
}
