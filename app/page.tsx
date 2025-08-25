'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { ChevronLeft, ChevronRight, MessageCircle, User, Search, Clock, Eye, Star } from 'lucide-react';
import Link from 'next/link';
import { fixR2ImageUrl } from '@/lib/utils';

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
  const [loading, setLoading] = useState(true);
  const [currentPopularIndex, setCurrentPopularIndex] = useState(0);

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Auto-advance timer for popular manga
  useEffect(() => {
    if (popularManga && popularManga.length > 1) {
      const timer = setInterval(() => {
        setCurrentPopularIndex((prevIndex) => 
          prevIndex === popularManga.length - 1 ? 0 : prevIndex + 1
        );
      }, 8000); // 8 seconds
      
      return () => clearInterval(timer);
    }
  }, [popularManga]);

  // Ensure currentPopularIndex doesn't exceed the top 10 limit
  useEffect(() => {
    if (popularManga && popularManga.length > 0 && currentPopularIndex >= Math.min(popularManga.length, 10)) {
      setCurrentPopularIndex(0);
    }
  }, [popularManga, currentPopularIndex]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch popular manga
      const popularResponse = await fetch('/api/manga?sort=popular&limit=10');
      if (popularResponse.ok) {
        const popularData = await popularResponse.json();
        console.log('Popular manga data:', popularData);
        setPopularManga(popularData.mangas || popularData.manga || []);
      } else {
        console.error('Failed to fetch popular manga:', popularResponse.status);
      }
      
      // Fetch latest manga
      const latestResponse = await fetch('/api/manga?sortBy=latestChapter&sortOrder=desc&limit=15');
      if (latestResponse.ok) {
        const latestData = await latestResponse.json();
        console.log('Latest manga data:', latestData);
        setLatestManga(latestData.mangas || latestData.manga || []);
      } else {
        console.error('Failed to fetch latest manga:', latestResponse.status);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextPopular = () => {
    if (sortedPopularManga && sortedPopularManga.length > 0) {
      setCurrentPopularIndex((prev) => 
        prev === sortedPopularManga.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPopular = () => {
    if (sortedPopularManga && sortedPopularManga.length > 0) {
      setCurrentPopularIndex((prev) => 
        prev === 0 ? sortedPopularManga.length - 1 : prev - 1
      );
    }
  };

  // Sort manga by ranking (likes first, then views) and limit to top 10
  const sortedPopularManga = popularManga && popularManga.length > 0 
    ? [...popularManga].sort((a, b) => {
        // First sort by likes (descending)
        if (a.likes !== b.likes) {
          return (b.likes || 0) - (a.likes || 0);
        }
        // If likes are equal, sort by views (descending)
        return (b.views || 0) - (a.views || 0);
      }).slice(0, 10) // Only show top 10
    : [];

  const currentPopularManga = sortedPopularManga.length > 0 ? sortedPopularManga[currentPopularIndex] : sampleManga;

  // Calculate the actual ranking position based on likes and views
  const getRankingPosition = (manga: any) => {
    if (!sortedPopularManga || sortedPopularManga.length === 0) return 1;
    
    // Find the position of the current manga in the sorted array
    const position = sortedPopularManga.findIndex(m => m._id === manga._id);
    return position + 1; // Add 1 because index is 0-based
  };

  // Format time to show exact timestamp
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
          <div className="animate-pulse space-y-12">
            {/* Popular Section Skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
              <div className="flex gap-8">
                <div className="w-96 h-96 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
            
            {/* Latest Section Skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
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
        <section className="mb-8 relative overflow-hidden rounded-2xl">
          {/* Background Image - Covers entire section */}
          {currentPopularManga && (
            <div 
              key={currentPopularManga._id || currentPopularIndex}
              className="absolute inset-0 rounded-2xl overflow-hidden animate-slide-bg-left"
              style={{
                backgroundImage: `url(${fixR2ImageUrl(currentPopularManga.coverImage)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.3)',
              }}
            />
          )}
          
          {/* Content */}
          <div className="relative z-10 p-3 sm:p-5 lg:p-6">
            {currentPopularManga ? (
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-6">
                {/* Left Side - Cover Image */}
                <div className="w-full lg:w-64 flex-shrink-0 flex justify-center lg:justify-start lg:absolute lg:bottom-0">
                  {/* Tiêu điểm Label and Bar */}
                  <div className="absolute -top-10 -left-36 right-0 z-20 text-center">
                    <h2 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">TIÊU ĐIỂM:</h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
                  </div>
                  
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 w-48 lg:w-64">
                    <img 
                      key={currentPopularManga._id || currentPopularIndex}
                      src={fixR2ImageUrl(currentPopularManga.coverImage)} 
                      alt={currentPopularManga.title}
                      className="w-full h-64 lg:h-80 object-cover transition-all duration-700 ease-in-out transform hover:scale-105 animate-slide-in-left"
                    />
                  </div>
                </div>

                {/* Right Side - Manga Details (Text Only) */}
                <div className="flex-1 p-3 lg:p-6 flex flex-col lg:ml-64 lg:pt-12">
                  <h1 
                    key={`title-${currentPopularManga._id || currentPopularIndex}`}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg transition-all duration-500 ease-in-out animate-slide-in-right text-center lg:text-left"
                  >
                    {currentPopularManga.title}
                  </h1>
                  
                  {/* Manga Description */}
                  <div 
                    key={`desc-${currentPopularManga._id || currentPopularIndex}`}
                    className="mb-3 transition-all duration-500 ease-in-out animate-slide-in-left"
                  >
                    <p className="text-white/90 leading-relaxed text-sm sm:text-base text-center lg:text-left drop-shadow-md line-clamp-3">
                      {currentPopularManga.description || 'Không có mô tả cho manga này.'}
                    </p>
                  </div>
                  
                  {/* Genres */}
                  <div 
                    key={`genres-${currentPopularManga._id || currentPopularIndex}`}
                    className="mb-4 transition-all duration-500 ease-in-out animate-slide-in-up"
                  >
                    <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                      {currentPopularManga.genres && currentPopularManga.genres.slice(0, 8).map((genre, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg animate-bounce-in border border-orange-400" 
                          style={{animationDelay: `${index * 0.08}s`}}
                        >
                          {genre.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Manga Description and Read Button */}
                  <div className="mb-4">
                    <Link 
                      href={`/manga/${currentPopularManga._id}`}
                      className="inline-flex items-center px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg border border-purple-500 backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      Đọc ngay
                    </Link>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-auto pt-3 lg:pt-6">
                    <div className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">
                      NO. {getRankingPosition(currentPopularManga)}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button
                        onClick={prevPopular}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={nextPopular}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="h-64 lg:h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <p>Chưa có manga nào</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Latest Updates Section */}
        <section>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Cập Nhật Mới Nhất</h2>
            <a href="/browse" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </div>
          
          <div className="manga-grid">
            {(latestManga && latestManga.length > 0 ? latestManga.slice(0, 15) : Array(15).fill(sampleManga)).map((manga) => (
              <Link key={manga._id} href={`/manga/${manga._id}`} className="group block">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <div className="relative">
                    <img 
                      src={fixR2ImageUrl(manga.coverImage)} 
                      alt={manga.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors duration-200">
                      {manga.title}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{manga.author || 'Chưa có tác giả'}</span>
                        <span>•</span>
                        <span className="text-purple-600 font-medium">
                          {manga.latestChapter?.updatedAt ? formatExactTime(manga.latestChapter.updatedAt) : 'Không có chương'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* See More Button */}
          <div className="text-center mt-8">
            <Link 
              href="/browse" 
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl border border-purple-500"
            >
              <span>Xem thêm</span>
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

