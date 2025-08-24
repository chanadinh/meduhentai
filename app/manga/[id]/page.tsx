'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  BookOpen, 
  Eye, 
  Calendar, 
  User, 
  Heart,
  Play,
  Bookmark,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Comments from '@/components/Comments';
import toast from 'react-hot-toast';
import { fixR2ImageUrl } from '@/lib/utils';

interface Manga {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  author: string;
  artist: string;
  status: string;
  views: number;
  likes: number;
  dislikes: number;
  genres: string[];
  chaptersCount: number;
  chapters: Chapter[];
  userId?: {
    _id: string;
    username: string;
    role: string;
    avatar: string;
  };
}

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  createdAt: string;
}

export default function MangaDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('chapters');
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [reactionCounts, setReactionCounts] = useState({ likes: 0, dislikes: 0 });

  useEffect(() => {
    if (params.id) {
      fetchManga();
      if (session) {
        fetchUserReaction();
      }
    }
  }, [params.id, session]);

  const fetchManga = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/manga/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch manga');
      }
      
      const data = await response.json();
      setManga(data.manga);
      setReactionCounts({
        likes: data.manga.likes || 0,
        dislikes: data.manga.dislikes || 0
      });
    } catch (error) {
      console.error('Error fetching manga:', error);
      toast.error('Không thể tải thông tin manga');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReaction = async () => {
    try {
      const response = await fetch(`/api/manga/${params.id}/reactions`);
      if (response.ok) {
        const data = await response.json();
        setUserReaction(data.userReaction);
        setReactionCounts({
          likes: data.likes,
          dislikes: data.dislikes
        });
      }
    } catch (error) {
      console.error('Error fetching user reaction:', error);
    }
  };

  const handleFavorite = async () => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mangaId: manga?._id }),
      });

      if (response.ok) {
        setFavorited(!favorited);
        toast.success(favorited ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
      } else {
        toast.error('Không thể cập nhật yêu thích');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast.error('Không thể cập nhật yêu thích');
    }
  };

  const handleReaction = async (reaction: 'like' | 'dislike') => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để thích/không thích');
      return;
    }

    try {
      const response = await fetch(`/api/manga/${params.id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserReaction(data.reaction);
        
        // Update reaction counts based on the action
        if (data.action === 'added') {
          setReactionCounts(prev => ({
            ...prev,
            [reaction + 's']: prev[reaction + 's'] + 1
          }));
        } else if (data.action === 'removed') {
          setReactionCounts(prev => ({
            ...prev,
            [reaction + 's']: prev[reaction + 's'] - 1
          }));
        } else if (data.action === 'updated') {
          // If reaction was changed, we need to fetch updated counts
          fetchUserReaction();
        }
        
        toast.success(data.message);
      } else {
        toast.error('Không thể cập nhật phản ứng');
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Không thể cập nhật phản ứng');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex gap-8">
              <div className="w-80 h-96 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="flex gap-3">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy manga</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Left Column - Cover Image */}
          <div className="w-full lg:w-80 flex-shrink-0 flex justify-center lg:justify-start">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 w-64 lg:w-80">
              <img 
                src={fixR2ImageUrl(manga.coverImage)} 
                alt={manga.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Right Column - Manga Details */}
          <div className="flex-1">
            {/* Title and Subtitle */}
            <div className="mb-4 lg:mb-6 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{manga.title}</h1>
              {manga.description && (
                <p className="text-base sm:text-lg text-gray-600 mb-4">{manga.description}</p>
              )}
              <p className="text-gray-500">by {manga.artist || manga.author}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 lg:mb-6">
              <button
                onClick={handleFavorite}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  favorited 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${favorited ? 'fill-current' : ''}`} />
                {favorited ? 'Đã yêu thích' : '+ Thêm vào thư viện'}
              </button>
              
              {manga.chapters && manga.chapters.length > 0 && (
                <a
                  href={`/manga/${manga._id}/read/${manga.chapters[0]._id}`}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  Đọc ngay
                </a>
              )}

              {/* Like/Dislike Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleReaction('like')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    userReaction === 'like'
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${userReaction === 'like' ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{reactionCounts.likes}</span>
                </button>
                
                <button
                  onClick={() => handleReaction('dislike')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    userReaction === 'dislike'
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <ThumbsDown className={`h-4 w-4 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{reactionCounts.dislikes}</span>
                </button>
              </div>
              

            </div>

            {/* Status and Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {manga.status === 'completed' ? 'COMPLETED' : 'ONGOING'}
              </span>
              {manga.genres && manga.genres.slice(0, 3).map((genre, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  {genre.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-gray-500" />
                <span className="text-lg font-semibold text-gray-900">{manga.views}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-500" />
                <span className="text-lg font-semibold text-gray-900">{manga.chaptersCount || manga.chapters?.length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold text-gray-900">{reactionCounts.likes}</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-red-500" />
                <span className="text-lg font-semibold text-gray-900">{reactionCounts.dislikes}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tác giả</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {manga.author}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Đăng bởi</h3>
                <div className="flex flex-wrap gap-2">
                  {manga.userId ? (
                    <Link 
                      href={`/profile/${manga.userId._id}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors duration-200 cursor-pointer flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-purple-600" />
                      </span>
                      {manga.userId.username}
                      {manga.userId.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Admin</span>
                      )}
                      {manga.userId.role === 'uploader' && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Uploader</span>
                      )}
                    </Link>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                      Không xác định
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Thể loại</h3>
                <div className="flex flex-wrap gap-2">
                  {manga.genres && manga.genres.map((genre, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              

            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'chapters'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                DS Chương ({manga.chapters?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'comments'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bình luận
              </button>
              <button
                onClick={() => setActiveTab('covers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'covers'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ảnh bìa
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'chapters' && (
              <div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">No Volume</h3>
                  </div>
                  
                  {manga.chapters && manga.chapters.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {manga.chapters.map((chapter) => (
                        <div key={chapter._id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Play className="h-4 w-4 text-purple-500" />
                              <a
                                href={`/manga/${manga._id}/read/${chapter._id}`}
                                className="font-medium text-gray-900 hover:text-purple-600 transition-colors duration-200 cursor-pointer"
                              >
                                Ch. {chapter.chapterNumber} - {chapter.title}
                              </a>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">No Group</span>
                              <span className="text-sm text-gray-500">{formatDate(chapter.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      Chưa có chương nào
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div>
                <Comments mangaId={manga._id} />
              </div>
            )}

            {activeTab === 'covers' && (
              <div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={fixR2ImageUrl(manga.coverImage)} 
                        alt={manga.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
