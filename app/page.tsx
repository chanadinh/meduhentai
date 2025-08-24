'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { ChevronLeft, ChevronRight, MessageCircle, User, Search, Clock } from 'lucide-react';
import Link from 'next/link';

interface Manga {
  _id: string;
  title: string;
  coverImage: string;
  description: string;
  rating: number;
  views: number;
  chaptersCount: number;
  author: string;
  status: string;
  genres: string[];
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
    rating: 4.5,
    views: 1234,
    chaptersCount: 15,
    author: 'Tác giả Mẫu',
    status: 'ongoing',
    genres: ['SUGGESTIVE', 'ACTION', 'ADVENTURE', 'COMEDY', 'FANTASY', 'ISEKAI']
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

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch popular manga
      const popularResponse = await fetch('/api/manga?sort=views&limit=10');
      if (popularResponse.ok) {
        const popularData = await popularResponse.json();
        console.log('Popular manga data:', popularData);
        setPopularManga(popularData.mangas || popularData.manga || []);
      } else {
        console.error('Failed to fetch popular manga:', popularResponse.status);
      }
      
      // Fetch latest manga
      const latestResponse = await fetch('/api/manga?sort=createdAt&limit=12');
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
    if (popularManga && popularManga.length > 0) {
      setCurrentPopularIndex((prev) => 
        prev === popularManga.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPopular = () => {
    if (popularManga && popularManga.length > 0) {
      setCurrentPopularIndex((prev) => 
        prev === 0 ? popularManga.length - 1 : prev - 1
      );
    }
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

  const currentPopularManga = popularManga && popularManga.length > 0 ? popularManga[currentPopularIndex] : sampleManga;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Popular New Titles Section */}
        <section className="mb-16 relative overflow-hidden rounded-2xl">
          {/* Background Image - Covers entire section */}
          {currentPopularManga && (
            <div 
              key={currentPopularManga._id || currentPopularIndex}
              className="absolute inset-0 rounded-2xl overflow-hidden animate-slide-bg-left"
              style={{
                backgroundImage: `url(${currentPopularManga.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.3)',
              }}
            />
          )}
          
          {/* Content */}
          <div className="relative z-10 p-8">
            {currentPopularManga ? (
              <div className="flex gap-8">
                {/* Left Side - Cover Image */}
                <div className="w-96 flex-shrink-0">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                    <img 
                      key={currentPopularManga._id || currentPopularIndex}
                      src={currentPopularManga.coverImage} 
                      alt={currentPopularManga.title}
                      className="w-full h-96 object-cover transition-all duration-700 ease-in-out transform hover:scale-105 animate-slide-in-left"
                    />
                  </div>
                </div>

                {/* Right Side - Manga Details (Text Only) */}
                <div className="flex-1 p-8 flex flex-col">
                  <h1 
                    key={`title-${currentPopularManga._id || currentPopularIndex}`}
                    className="text-2xl font-bold text-white mb-4 leading-tight drop-shadow-lg transition-all duration-500 ease-in-out animate-slide-in-right"
                  >
                    {currentPopularManga.title}
                  </h1>
                  
                  {/* Tags */}
                  <div 
                    key={`tags-${currentPopularManga._id || currentPopularIndex}`}
                    className="flex flex-wrap gap-2 mb-6 transition-all duration-500 ease-in-out animate-slide-in-up"
                  >
                    {currentPopularManga.genres && currentPopularManga.genres.slice(0, 6).map((genre, index) => (
                      <span key={index} className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full shadow-sm transition-all duration-300 hover:scale-110 animate-bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
                        {genre.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  
                  {/* Description */}
                  <p 
                    key={`desc-${currentPopularManga._id || currentPopularIndex}`}
                    className="text-white/90 leading-relaxed mb-6 drop-shadow-md transition-all duration-500 ease-in-out animate-slide-in-left"
                  >
                    {currentPopularManga.description}
                  </p>
                  
                  {/* Author */}
                  <p 
                    key={`author-${currentPopularManga._id || currentPopularIndex}`}
                    className="text-white/70 text-sm drop-shadow-md transition-all duration-500 ease-in-out animate-slide-in-down"
                  >
                    {currentPopularManga.author}
                  </p>
                  
                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-auto pt-16">
                    <div className="text-sm text-white/80 font-medium drop-shadow-md">
                      NO. {currentPopularIndex + 1}
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={prevPopular}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextPopular}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <p>Chưa có manga nào</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Latest Updates Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Cập Nhật Mới Nhất</h2>
            <a href="/browse" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
              <ChevronRight className="h-6 w-6" />
            </a>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {(latestManga && latestManga.length > 0 ? latestManga.slice(0, 9) : [sampleManga, sampleManga, sampleManga]).map((manga) => (
              <Link key={manga._id} href={`/manga/${manga._id}`} className="group block">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <div className="relative">
                    <img 
                      src={manga.coverImage} 
                      alt={manga.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {manga.title}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Vol. 1 Ch. {(manga.chaptersCount || 1)}</span>
                        <MessageCircle className="h-3 w-3" />
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>Không có nhóm</span>
                        <span>•</span>
                        <span>4 phút trước</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

