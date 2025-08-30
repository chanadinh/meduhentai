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
  ThumbsDown,
  MessageCircle
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Comments from '@/components/Comments';
import toast from 'react-hot-toast';
import { fixR2ImageUrl } from '@/lib/utils';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Skeleton,
  Tabs,
  Tab,
  Chip,
  Divider
} from '@heroui/react';

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

  const formatExactTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Vừa cập nhật';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    // For older dates, show exact date and time
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cover Image Skeleton */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex justify-center lg:justify-start">
              <Skeleton className="w-48 sm:w-64 lg:w-80 xl:w-96 h-64 sm:h-80 lg:h-96 xl:h-[32rem] rounded-2xl" />
            </div>

            {/* Details Skeleton */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-32" />
              </div>

              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section with Background */}
        <div className="relative mb-8 rounded-3xl overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${fixR2ImageUrl(manga.coverImage)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.3)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
          
          {/* Content */}
          <div className="relative z-10 p-6 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Left - Cover Image */}
              <div className="flex-shrink-0 flex justify-center lg:justify-start">
                <div className="relative">
                  <img
                    src={fixR2ImageUrl(manga.coverImage)}
                    alt={manga.title}
                    className="w-64 sm:w-80 lg:w-96 h-auto object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                </div>
              </div>

              {/* Right - Details */}
              <div className="flex-1 text-center lg:text-left space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    {manga.title}
                  </h1>
                  {manga.description && (
                    <p className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-6">
                      {manga.description}
                    </p>
                  )}
                  <p className="text-gray-400 text-lg">
                    by <span className="text-purple-300 font-semibold">{manga.artist || manga.author}</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {manga.chapters && manga.chapters.length > 0 && (
                    <Button
                      as={Link}
                      href={`/manga/${manga._id}/read/${manga.chapters[0]._id}`}
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      startContent={<Play className="h-5 w-5" />}
                    >
                      Đọc ngay
                    </Button>
                  )}

                  <Button
                    onClick={handleFavorite}
                    color={favorited ? "danger" : "secondary"}
                    variant="bordered"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                    startContent={<Heart className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`} />}
                  >
                    {favorited ? 'Đã yêu thích' : '+ Thêm vào thư viện'}
                  </Button>
                </div>

                {/* Stats and Reactions */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Button
                      onClick={() => handleReaction('like')}
                      color={userReaction === 'like' ? 'success' : 'default'}
                      variant={userReaction === 'like' ? 'solid' : 'ghost'}
                      size="sm"
                      className="text-white"
                      startContent={<ThumbsUp className={`h-4 w-4 ${userReaction === 'like' ? 'fill-current' : ''}`} />}
                    >
                      {reactionCounts.likes}
                    </Button>

                    <Button
                      onClick={() => handleReaction('dislike')}
                      color={userReaction === 'dislike' ? 'danger' : 'default'}
                      variant={userReaction === 'dislike' ? 'solid' : 'ghost'}
                      size="sm"
                      className="text-white"
                      startContent={<ThumbsDown className={`h-4 w-4 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />}
                    >
                      {reactionCounts.dislikes}
                    </Button>
                  </div>

                  <Chip
                    color="default"
                    variant="flat"
                    size="lg"
                    className="bg-black/20 text-white"
                    startContent={<Eye className="h-4 w-4" />}
                  >
                    {manga.views.toLocaleString()} lượt xem
                  </Chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Stats */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <h3 className="text-xl font-bold text-white">Thông tin</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Trạng thái:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    manga.status === 'completed' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-yellow-600 text-white'
                  }`}>
                    {manga.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Số chương:</span>
                  <Chip color="primary" variant="solid" size="sm">
                    {manga.chaptersCount || manga.chapters?.length || 0}
                  </Chip>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Tác giả:</span>
                  <span className="text-purple-300 font-semibold">{manga.author}</span>
                </div>

                {manga.userId && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Đăng bởi:</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${manga.userId._id}`}
                        className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
                      >
                        {manga.userId.username}
                      </Link>
                      {manga.userId.role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                          Admin
                        </span>
                      )}
                      {manga.userId.role === 'uploader' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
                          Uploader
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Right Column - Genres (Organized) */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <h3 className="text-xl font-bold text-white">Thể loại</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {manga.genres && manga.genres.map((genre, index) => (
                    <Chip 
                      key={index} 
                      variant="solid"
                      className="font-semibold text-center justify-center bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200"
                      size="sm"
                    >
                      {genre}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Mobile Floating Action Button for Reading */}
        {manga.chapters && manga.chapters.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 lg:hidden">
            <Button
              as={Link}
              href={`/manga/${manga._id}/read/${manga.chapters[0]._id}`}
              color="primary"
              isIconOnly
              size="lg"
              className="rounded-full shadow-lg"
              aria-label="Đọc chương đầu tiên"
            >
              <Play className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2",
              tab: "text-gray-300 data-[selected=true]:text-white",
              cursor: "bg-gradient-to-r from-purple-500 to-pink-500",
              panel: "pt-6"
            }}
          >
            <Tab
              key="chapters"
              title={
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>DS Chương ({manga.chapters?.length || 0})</span>
                </div>
              }
            />
            <Tab
              key="comments"
              title={
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Bình luận</span>
                </div>
              }
            />
            <Tab
              key="covers"
              title={
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Ảnh bìa</span>
                </div>
              }
            />
          </Tabs>

          {/* Tab Content */}
          <div className="mt-6 sm:mt-8">
            {activeTab === 'chapters' && (
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <h3 className="font-semibold text-white">Danh sách chương</h3>
                </CardHeader>
                <CardBody>
                  {manga.chapters && manga.chapters.length > 0 ? (
                    <div className="space-y-3">
                      {manga.chapters.map((chapter) => (
                        <div key={chapter._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/10 transition-colors duration-200 border border-white/10 bg-white/5">
                          <div className="flex items-center space-x-4">
                            <Button
                              as={Link}
                              href={`/manga/${manga._id}/read/${chapter._id}`}
                              color="primary"
                              variant="solid"
                              isIconOnly
                              size="sm"
                              aria-label={`Đọc chương ${chapter.chapterNumber}`}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Link
                              href={`/manga/${manga._id}/read/${chapter._id}`}
                              className="font-medium text-white hover:text-purple-300 transition-colors duration-200"
                            >
                              Ch. {chapter.chapterNumber} - {chapter.title}
                            </Link>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-400">
                            <span>{formatExactTime(chapter.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Chưa có chương nào</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {activeTab === 'comments' && (
              <div>
                <Comments mangaId={manga._id} />
              </div>
            )}

            {activeTab === 'covers' && (
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <h3 className="font-semibold text-white">Ảnh bìa</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div className="relative group">
                      <img
                        src={fixR2ImageUrl(manga.coverImage)}
                        alt={manga.title}
                        className="w-full h-auto object-cover rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

