'use client';

import { useState, useEffect, useCallback } from 'react';

// Force dynamic rendering to avoid SSR issues with HeroUI
export const dynamic = 'force-dynamic';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { ChevronLeft, ChevronRight, MessageCircle, User, Search, Clock, Eye, Star, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { fixR2ImageUrl } from '@/lib/utils';
import { Card, CardBody, CardHeader, Button, Skeleton, Divider } from '@heroui/react';

interface Manga {
  _id: string;
  title: string;
  coverImage: string;
  description: string;
  views: number;
  chaptersCount: number;
  author: string;
  status: string;
  genres: string[];
  likes?: number;
  updatedAt?: string;
  latestChapterUpdate?: string; // Add this field for chapter creation time
  latestChapter?: {
    _id: string;
    chapterNumber: number;
    title: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function HomePage() {
  const { data: session } = useSession();
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [latestManga, setLatestManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPopularIndex, setCurrentPopularIndex] = useState(0);

  // Fallback sample data in case API fails
  const sampleManga: Manga = {
    _id: 'sample-1',
    title: 'Tiêu đề Manga Mẫu - Đây là một tiêu đề rất dài để kiểm tra bố cục',
    coverImage: 'https://via.placeholder.com/384x384/6366f1/ffffff?text=Sample+Manga',
    description: 'Đây là mô tả manga mẫu để hiển thị cách bố cục sẽ trông như thế nào khi có nội dung thực tế. Nó phải đủ dài để thể hiện việc gói văn bản và khoảng cách.',
    views: 1234,
    chaptersCount: 15,
    author: 'Tác giả Mẫu',
    status: 'ongoing',
    genres: ['SUGGESTIVE', 'ACTION', 'ADVENTURE', 'COMEDY', 'FANTASY', 'ISEKAI'],
    likes: 567,
    updatedAt: new Date().toISOString(),
    latestChapter: {
      _id: 'sample-chapter-1',
      chapterNumber: 15,
      title: 'Chương cuối cùng',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  // Fetch home data with error handling
  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both popular and latest manga in parallel
      const [popularResponse, latestResponse] = await Promise.allSettled([
        fetch('/api/manga?sort=popular&limit=10'),
        fetch('/api/manga?sortBy=latestChapter&sortOrder=desc&limit=18')
      ]);

      // Handle popular manga response
      if (popularResponse.status === 'fulfilled' && popularResponse.value.ok) {
        const popularData = await popularResponse.value.json();
        const popularList = popularData.mangas || popularData.manga || [];
        setPopularManga(popularList);
        console.log('Popular manga loaded:', popularList.length);
      } else {
        console.warn('Failed to fetch popular manga');
        setPopularManga([]); // Set empty array instead of leaving undefined
      }

      // Handle latest manga response
      if (latestResponse.status === 'fulfilled' && latestResponse.value.ok) {
        const latestData = await latestResponse.value.json();
        const latestList = latestData.mangas || latestData.manga || [];
        setLatestManga(latestList);
        console.log('Latest manga loaded:', latestList.length);
      } else {
        console.warn('Failed to fetch latest manga');
        setLatestManga([]); // Set empty array instead of leaving undefined
      }

    } catch (error) {
      console.error('Error fetching home data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      // Set empty arrays to prevent undefined errors
      setPopularManga([]);
      setLatestManga([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  // Auto-advance timer for popular manga carousel
  useEffect(() => {
    if (popularManga.length > 1) {
      const timer = setInterval(() => {
        setCurrentPopularIndex((prev) =>
          prev >= popularManga.length - 1 ? 0 : prev + 1
        );
      }, 8000); // 8 seconds

      return () => clearInterval(timer);
    }
  }, [popularManga.length]);

  // Simplified carousel navigation
  const nextPopular = useCallback(() => {
    if (popularManga.length > 0) {
      setCurrentPopularIndex((prev) =>
        prev >= popularManga.length - 1 ? 0 : prev + 1
      );
    }
  }, [popularManga.length]);

  const prevPopular = useCallback(() => {
    if (popularManga.length > 0) {
      setCurrentPopularIndex((prev) =>
        prev === 0 ? popularManga.length - 1 : prev - 1
      );
    }
  }, [popularManga.length]);

  // Get current popular manga (simplified)
  const currentPopularManga = popularManga.length > 0 ? popularManga[currentPopularIndex] : sampleManga;

  // Get ranking position (simplified)
  const getRankingPosition = useCallback((manga: Manga) => {
    if (popularManga.length === 0) return 1;
    const position = popularManga.findIndex(m => m._id === manga._id);
    return position !== -1 ? position + 1 : 1;
  }, [popularManga]);

  // Format time to show exact timestamp
  const formatExactTime = useCallback((dateString: string) => {
    try {
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
    } catch (error) {
      console.warn('Error formatting date:', dateString);
      return 'Không xác định';
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-12">
            {/* Popular Section Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <div className="flex gap-8">
                <Skeleton className="w-96 h-96 rounded-lg" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-3/4 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  <Skeleton className="h-20 w-full rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              </div>
            </div>

            {/* Latest Section Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {[...Array(15)].map((_, i) => (
                  <Card key={i}>
                    <CardBody className="p-0">
                      <div className="relative">
                        <Skeleton className="w-full h-48 rounded-t-xl" />
                      </div>
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-6 w-full rounded" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-3/4 rounded" />
                        </div>
                        <Skeleton className="h-4 w-1/2 rounded" />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <MessageCircle className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchHomeData} color="primary">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Popular New Titles Section */}
        {popularManga.length > 0 ? (
          <div className="mb-8">
            {/* TIÊU ĐIỂM Header - Fixed position above the card */}
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">TIÊU ĐIỂM</h2>
                <div className="flex-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <div className="text-gray-600 font-medium">
                  TOP {getRankingPosition(currentPopularManga)}
                </div>
              </div>
            </div>

            <Card className="relative overflow-hidden">
              {/* Background Image - Covers entire section */}
              <div
                key={currentPopularManga._id || currentPopularIndex}
                className="absolute inset-0 overflow-hidden"
                style={{
                  backgroundImage: `url(${fixR2ImageUrl(currentPopularManga.coverImage)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.2) blur(1px)',
                }}
              />
              
              {/* Dark overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />

              {/* Content */}
              <CardBody className="relative z-10 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8">
                  {/* Left Side - Cover Image */}
                  <div className="flex-shrink-0 flex justify-center sm:justify-start">
                    <img
                      key={currentPopularManga._id || currentPopularIndex}
                      src={fixR2ImageUrl(currentPopularManga.coverImage)}
                      alt={currentPopularManga.title}
                      className="w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 object-cover rounded-2xl shadow-2xl"
                    />
                  </div>

                  {/* Right Side - Manga Details */}
                  <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6">
                    {/* Title */}
                    <h1
                      key={`title-${currentPopularManga._id || currentPopularIndex}`}
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight drop-shadow-lg text-center sm:text-left line-clamp-2"
                    >
                      {currentPopularManga.title}
                    </h1>

                    {/* Description */}
                    <p className="text-white/90 leading-relaxed text-xs sm:text-sm md:text-base lg:text-lg text-center sm:text-left drop-shadow-md line-clamp-2">
                      {currentPopularManga.description || 'Không có mô tả cho manga này.'}
                    </p>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {currentPopularManga.genres && currentPopularManga.genres.slice(0, 6).map((genre, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-yellow-500 text-black shadow-lg"
                        >
                          {genre.toUpperCase()}
                        </span>
                      ))}
                      {currentPopularManga.genres && currentPopularManga.genres.length > 6 && (
                        <span
                          className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-white shadow-lg"
                        >
                          +{currentPopularManga.genres.length - 6}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row gap-3 justify-center sm:justify-start">
                      <Button
                        as={Link}
                        href={`/manga/${currentPopularManga._id}`}
                        color="primary"
                        size="lg"
                        className="font-bold shadow-xl bg-blue-600 hover:bg-blue-700 text-white border-0 flex-1 sm:flex-none"
                        startContent={<BookOpen className="h-5 w-5" />}
                      >
                        Đọc ngay
                      </Button>
                      
                      <Button
                        color="secondary"
                        variant="solid"
                        size="lg"
                        className="font-bold shadow-xl bg-gray-700/90 hover:bg-gray-600 text-white border-0 flex-1 sm:flex-none"
                        startContent={<Eye className="h-5 w-5" />}
                      >
                        <span className="hidden sm:inline">{currentPopularManga.views?.toLocaleString() || 0} lượt xem</span>
                        <span className="sm:hidden">{currentPopularManga.views?.toLocaleString() || 0}</span>
                      </Button>
                    </div>

                    {/* Stats and Navigation */}
                    <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 text-white bg-black/40 px-2 sm:px-3 py-2 rounded-full backdrop-blur-sm">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span className="text-xs sm:text-sm font-bold">
                          {currentPopularManga.likes || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3 bg-black/40 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm">
                        <Button
                          isIconOnly
                          variant="solid"
                          onClick={prevPopular}
                          className="text-white bg-gray-600/80 hover:bg-gray-500 border-0 shadow-lg"
                          size="sm"
                          aria-label="Manga trước đó"
                        >
                          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        
                        <div className="flex gap-1">
                          {popularManga.slice(0, 5).map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 rounded-full transition-all ${
                                index === currentPopularIndex
                                  ? 'bg-white w-4 sm:w-6 shadow-lg'
                                  : 'bg-white/60 w-2'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <Button
                          isIconOnly
                          variant="solid"
                          onClick={nextPopular}
                          className="text-white bg-gray-600/80 hover:bg-gray-500 border-0 shadow-lg"
                          size="sm"
                          aria-label="Manga tiếp theo"
                        >
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <Card className="mb-8">
            <CardBody className="text-center py-12">
              <p className="text-gray-500">Chưa có manga nổi bật nào</p>
              <Button
                as={Link}
                href="/browse"
                color="primary"
                className="mt-4"
              >
                Duyệt manga
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Latest Updates Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Cập Nhật Mới Nhất</h2>
            <Button
              as={Link}
              href="/browse"
              variant="light"
              isIconOnly
              aria-label="Xem tất cả manga mới nhất"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {latestManga.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {latestManga.slice(0, 18).map((manga) => (
                <Card key={manga._id} as={Link} href={`/manga/${manga._id}`} className="group cursor-pointer hover:scale-105 transition-transform duration-200">
                <CardBody className="p-0">
                  <div className="relative">
                    <img
                      src={fixR2ImageUrl(manga.coverImage)}
                      alt={manga.title}
                      className="w-full h-64 sm:h-72 lg:h-80 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <div className="p-3 sm:p-4 lg:p-5">
                    <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 sm:mb-3 lg:mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
                      {manga.title}
                    </h3>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium truncate">{manga.author || 'Chưa có tác giả'}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-primary font-medium">
                        {manga.latestChapterUpdate ? formatExactTime(manga.latestChapterUpdate) : 'Không có chương'}
                      </div>
                    </div>
                  </div>
                </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có manga nào được cập nhật</p>
              <Button
                as={Link}
                href="/browse"
                color="primary"
                className="mt-4"
              >
                Duyệt manga
              </Button>
            </div>
          )}

          {/* See More Button */}
          {latestManga.length > 0 && (
            <div className="text-center mt-8">
              <Button
                as={Link}
                href="/browse"
                color="primary"
                size="lg"
                className="px-8"
              >
                <span>Xem thêm</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

