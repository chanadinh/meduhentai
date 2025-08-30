'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Calendar,
  Camera,
  Trash2,
  Save,
  Edit3,
  RefreshCw,
  Upload,
  Heart,
  MessageSquare
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import EditMangaModal from '@/components/EditMangaModal';
import toast from 'react-hot-toast';
import { fixR2ImageUrl } from '@/lib/utils';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Skeleton
} from '@heroui/react';

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
    username: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Check if user is viewing their own profile
  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Allow viewing any user's profile (public profiles)
    fetchProfile();
  }, [session, status, router, userId]);

  // Auto-refresh stats when page becomes visible (for real-time updates)
  useEffect(() => {
    if (!isOwnProfile) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh stats when page becomes visible
        refreshStats();
      }
    };

    const handleFocus = () => {
      // Refresh stats when window gains focus
      refreshStats();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isOwnProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch profile data for the specified userId
      const profileResponse = await fetch(`/api/profile/${userId}`);
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }
      const profileData = await profileResponse.json();
      
      // Fetch statistics data for the specified userId
      const statsResponse = await fetch(`/api/profile/${userId}/stats`);
      let stats = { totalViews: 0, totalLikes: 0, totalComments: 0 };
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        stats = statsData.stats;
      }
      
      // Combine profile and stats data
      const combinedProfile = {
        ...profileData.profile,
        stats
      };
      
      setProfile(combinedProfile);
      setFormData({
        username: combinedProfile.username
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      // Fetch fresh stats data
      const statsResponse = await fetch(`/api/profile/${userId}/stats?refresh=true`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        // Update profile with fresh stats
        setProfile(prev => prev ? {
          ...prev,
          stats: statsData.stats
        } : null);
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      toast.error('Không thể cập nhật thống kê');
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
    console.log('handleAvatarUpload called'); // Debug log
    if (!avatarFile) {
      console.log('No avatar file selected'); // Debug log
      return;
    }

    try {
      console.log('Uploading avatar file:', avatarFile.name); // Debug log
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
      console.log('Upload successful:', data); // Debug log
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
    console.log('handleAvatarRemove called'); // Debug log
    try {
      console.log('Sending DELETE request to /api/profile/avatar'); // Debug log
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove avatar');
      }

      console.log('Delete successful'); // Debug log
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-6 w-48 mx-auto mb-8" />
            <Skeleton className="h-12 w-40 mx-auto" />
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Không thể tải hồ sơ</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header - MIMI Style */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          {/* Pink/Purple Header Section */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 p-8">
            <div className="flex items-center gap-6">
              {/* Large Avatar */}
              <div className="relative">
                <img
                  src={fixR2ImageUrl(profile?.avatar || '/medusa.ico')}
                  alt={profile?.username || 'User'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                />
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      className="absolute -bottom-2 -right-2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 border-3 border-white"
                      aria-label="Thay đổi avatar"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">
                    {profile?.username || 'User'}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    profile?.role === 'admin' ? 'bg-yellow-500 text-black' :
                    profile?.role === 'uploader' ? 'bg-green-500 text-white' : 
                    'bg-gray-500 text-white'
                  }`}>
                    {profile?.role === 'admin' ? '👑 Chủ thốt' :
                     profile?.role === 'uploader' ? '📚 Chủ thớt' : '👤 Thành viên'}
                  </span>
                </div>
                
                <div className="text-white/80 text-lg mb-3">
                  {(profile.stats?.totalViews || 0).toLocaleString()} truyện
                </div>
                
                <div className="text-white/60 font-mono text-sm">
                  @{userId?.slice(-5) || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          {isOwnProfile && (
            <div className="bg-gray-800 px-8 py-4 flex gap-3">
              {avatarFile && (
                <>
                  <button
                    onClick={handleAvatarUpload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Hủy
                  </button>
                </>
              )}
              <button
                onClick={handleAvatarRemove}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
              >
                Xóa avatar
              </button>
            </div>
          )}
        </div>

        {/* Content Grid - MIMI Style */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <h3 className="text-lg font-bold text-white">Thông tin</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Upload className="h-4 w-4 text-blue-400" />
                      <span>Đã đăng:</span>
                    </div>
                    <span className="text-white font-bold">{(profile.stats?.totalViews || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span>Thích:</span>
                    </div>
                    <span className="text-white font-bold">{(profile.stats?.totalLikes || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <MessageSquare className="h-4 w-4 text-green-400" />
                      <span>Bình luận:</span>
                    </div>
                    <span className="text-white font-bold">{(profile.stats?.totalComments || 0).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-gray-400 text-xs">Mô tả:</div>
                    <div className="text-gray-300 mt-1">Thành viên tích cực của cộng đồng</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Content - Manga Grid */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <h3 className="text-lg font-bold text-white">
                  {isOwnProfile ? 'Truyện đã đăng' : `Truyện của ${profile?.username}`}
                </h3>
              </CardHeader>
              <CardBody>
                <MyMangaList userId={userId} isOwnProfile={isOwnProfile} />
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// MyMangaList Component
function MyMangaList({ userId, isOwnProfile }: { userId: string; isOwnProfile: boolean }) {
  const [mangas, setMangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Edit manga modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMangaId, setEditingMangaId] = useState<string>('');

  useEffect(() => {
    fetchUserManga();
  }, [page, userId]);

  const fetchUserManga = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/manga/user/${userId}?page=${page}&limit=10`);
      
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
      console.error('Error fetching user manga:', error);
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

  const handleEditManga = (mangaId: string) => {
    setEditingMangaId(mangaId);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchUserManga(); // Refresh the manga list
  };

  if (loading && page === 1) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
        <p className="mt-2 text-gray-300">Đang tải...</p>
      </div>
    );
  }

  if (mangas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300 mb-4">Chưa có manga nào được tải lên</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mangas.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {mangas.map((manga) => (
            <div key={manga._id} className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-colors duration-200 border border-gray-600">
              <div className="flex items-center gap-4">
                {/* Manga Cover */}
                <img
                  src={fixR2ImageUrl(manga.coverImage)}
                  alt={manga.title}
                  className="w-20 h-28 object-cover rounded-lg shadow-lg"
                />
                
                {/* Manga Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{manga.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {manga.genres?.slice(0, 8).map((genre: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded-md"
                      >
                        {genre}
                      </span>
                    ))}
                    {manga.genres?.length > 8 && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded-md">
                        +{manga.genres.length - 8}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Update: {manga.updatedAt ? new Date(manga.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/manga/${manga._id}`}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm text-center"
                  >
                    Xem
                  </Link>
                  {isOwnProfile && (
                    <button
                      onClick={() => handleEditManga(manga._id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                      aria-label={`Chỉnh sửa ${manga.title}`}
                    >
                      Sửa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            {loading ? 'Đang tải...' : 'Tải thêm'}
          </button>
        </div>
      )}
      
      {/* Edit Manga Modal */}
      <EditMangaModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mangaId={editingMangaId}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
