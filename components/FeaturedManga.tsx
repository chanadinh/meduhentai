'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Eye, BookOpen, Heart, Calendar, Users, TrendingUp } from 'lucide-react';
import { fixR2ImageUrl } from '@/lib/utils';

interface FeaturedManga {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  author: string;
  rating: number;
  views: number;
  totalChapters: number;
  status: string;
  genres: string[];
}

export default function FeaturedManga() {
  const [featuredManga, setFeaturedManga] = useState<FeaturedManga[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedManga();
  }, []);

  const fetchFeaturedManga = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manga?sortBy=rating&sortOrder=desc&limit=5');
      const data = await response.json();
      
      if (data.mangas) {
        setFeaturedManga(data.mangas);
      }
    } catch (error) {
      console.error('Error fetching featured manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === featuredManga.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? featuredManga.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="relative h-96 bg-dark-200 rounded-2xl animate-pulse overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-dark-100 text-dark-600 rounded-lg mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Loading featured manga...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (featuredManga.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex flex-col items-center p-8 bg-white rounded-xl shadow-soft">
          <BookOpen className="h-16 w-16 text-dark-300 mb-4" />
          <p className="text-dark-500 text-lg font-medium">No featured manga available</p>
          <p className="text-dark-400 text-sm">Check back later for updates</p>
        </div>
      </div>
    );
  }

  const currentManga = featuredManga[currentIndex];

  return (
    <div className="relative h-48 bg-dark-200 rounded-2xl overflow-hidden shadow-strong">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{ backgroundImage: `url(${fixR2ImageUrl(currentManga.coverImage)})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-between z-10">
        {/* Left side - Main content */}
        <div className="px-6 text-white max-w-2xl">
          <div className="mb-3">
            <span className={`badge mb-2 ${
              currentManga.status === 'completed' ? 'badge-success' :
              currentManga.status === 'ongoing' ? 'badge-primary' :
              'badge-secondary'
            }`}>
              {currentManga.status}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{currentManga.title}</h3>
            <p className="text-dark-200 text-sm mb-3 line-clamp-2 leading-relaxed">{currentManga.description}</p>
          </div>

          <div className="flex items-center space-x-4 mb-4 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-warning-400 text-warning-400 mr-1" />
              <span className="font-semibold">{currentManga.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span className="font-semibold">{currentManga.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="font-semibold">{currentManga.totalChapters} chapters</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              href={`/manga/${currentManga._id}`}
              className="btn-primary text-sm px-4 py-1.5 shadow-medium hover:shadow-strong"
            >
              Đọc ngay
            </Link>
            <button className="btn-outline text-sm px-3 py-1.5 border-white text-white hover:bg-white hover:text-dark-900">
              <Heart className="h-3 w-3 mr-1" />
              Thêm vào yêu thích
            </button>
            <span className="text-dark-300 text-sm">by {currentManga.author}</span>
          </div>
          
          {/* Navigation Number */}
          <div className="flex items-center justify-between mt-auto pt-8 lg:pt-16">
            <div className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">
              NO. {currentIndex + 1}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={prevSlide}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Additional info */}
        <div className="block px-6 py-4 text-white text-right min-w-[280px] relative z-10">

          {/* Genres */}
          <div className="mb-4">
            <h4 className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md mb-2">Thể loại</h4>
            <div className="flex flex-wrap gap-2 justify-end">
              {currentManga.genres?.slice(0, 6).map((genre, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs sm:text-sm text-white/80 font-medium drop-shadow-md"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mb-4">
            <h4 className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md mb-2">Thống kê</h4>
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-end space-x-3">
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">Đánh giá:</span>
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">{currentManga.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">Lượt xem:</span>
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">{currentManga.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">Chương:</span>
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">{currentManga.totalChapters}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-4">
            <h4 className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md mb-2">Thông tin</h4>
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-end space-x-3">
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">Tác giả:</span>
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">{currentManga.author}</span>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">Trạng thái:</span>
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md capitalize">{currentManga.status}</span>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">Độ phổ biến:</span>
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">
                  {currentManga.views > 10000 ? 'Cao' : 
                   currentManga.views > 5000 ? 'Trung bình' : 'Thấp'}
                </span>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">Cập nhật:</span>
                <span className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-md">Gần đây</span>
              </div>
            </div>
          </div>

          {/* Reading Progress */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-white/90">Tiến độ đọc</h4>
            <div className="space-y-3 text-right">
              <div className="flex items-center justify-end space-x-3">
                <span className="text-white/70">Chương hiện tại:</span>
                <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold">Ch. {currentManga.totalChapters}</span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-white/70">Tình trạng:</span>
                <div className={`px-3 py-1 rounded-lg backdrop-blur-sm ${
                  currentManga.totalChapters > 50 ? 'bg-green-500/30' :
                  currentManga.totalChapters > 20 ? 'bg-yellow-500/30' :
                  'bg-blue-500/30'
                }`}>
                  <span className="font-semibold">
                    {currentManga.totalChapters > 50 ? 'Dài' : 
                     currentManga.totalChapters > 20 ? 'Trung bình' : 'Ngắn'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Community Info */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-white/90">Cộng đồng</h4>
            <div className="space-y-3 text-right">
              <div className="flex items-center justify-end space-x-3">
                <span className="text-white/70">Đánh giá:</span>
                <div className="flex items-center bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                  <Star className="h-4 w-4 fill-warning-400 text-warning-400 mr-1" />
                  <span className="font-semibold">{currentManga.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-white/70">Lượt xem:</span>
                <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold">{currentManga.views.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-white/70">Độ hot:</span>
                <div className={`px-3 py-1 rounded-lg backdrop-blur-sm ${
                  currentManga.views > 100000 ? 'bg-red-500/30' :
                  currentManga.views > 50000 ? 'bg-orange-500/30' :
                  currentManga.views > 10000 ? 'bg-yellow-500/30' :
                  'bg-blue-500/30'
                }`}>
                  <span className="font-semibold">
                    {currentManga.views > 100000 ? '🔥 Rất hot' : 
                     currentManga.views > 50000 ? '🔥 Hot' :
                     currentManga.views > 10000 ? '⭐ Phổ biến' : '📖 Mới'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-white/90">Thao tác</h4>
            <div className="space-y-2">
              <Link 
                href={`/manga/${currentManga._id}`}
                className="block w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors"
              >
                Xem chi tiết
              </Link>
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                Thêm vào yêu thích
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                📚 Đọc chương mới nhất
              </button>
            </div>
          </div>

          {/* Manga Insights */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-white/90">Thông tin chi tiết</h4>
            <div className="space-y-3 text-right">
              <div className="flex items-center justify-end space-x-3">
                <span className="text-white/70">Chất lượng:</span>
                <div className={`px-3 py-1 rounded-lg backdrop-blur-sm ${
                  currentManga.rating >= 4.5 ? 'bg-green-500/30' :
                  currentManga.rating >= 4.0 ? 'bg-yellow-500/30' :
                  'bg-blue-500/30'
                }`}>
                  <span className="font-semibold">
                    {currentManga.rating >= 4.5 ? '🎯 Xuất sắc' : 
                     currentManga.rating >= 4.0 ? '⭐ Tốt' : '📖 Khá'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-white/70">Độ hoàn thành:</span>
                <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold">
                    {currentManga.status === 'completed' ? '✅ Hoàn thành' : '🔄 Đang tiến hành'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <span className="text-white/70">Thể loại chính:</span>
                <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold">{currentManga.genres[0] || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Popularity Indicator */}
          <div className="mt-6">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentManga.rating >= 4.5 ? 'bg-green-400' :
                  currentManga.rating >= 4.0 ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}></div>
                <span className="text-sm font-medium">
                  {currentManga.rating >= 4.5 ? 'Xuất sắc' :
                   currentManga.rating >= 4.0 ? 'Tốt' :
                   'Khá'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-friendly additional info */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 px-8 pb-6 bg-gradient-to-t from-dark-900/90 to-transparent">
        <div className="grid grid-cols-2 gap-4 text-white">
          {/* Genres */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-white/90">Thể loại</h4>
            <div className="flex flex-wrap gap-1">
              {currentManga.genres.slice(0, 4).map((genre, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-white/90">Thống kê</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Đánh giá:</span>
                <span className="font-semibold">{currentManga.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Chương:</span>
                <span className="font-semibold">{currentManga.totalChapters}</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {featuredManga.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-primary-500 shadow-lg' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-700 ease-linear" 
           style={{ width: `${((currentIndex + 1) / featuredManga.length) * 100}%` }} />
    </div>
  );
}
