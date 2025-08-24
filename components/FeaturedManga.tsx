'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Eye, BookOpen, Heart } from 'lucide-react';

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
    <div className="relative h-96 bg-dark-200 rounded-2xl overflow-hidden shadow-strong">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{ backgroundImage: `url(${currentManga.coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="px-8 text-white max-w-2xl">
          <div className="mb-6">
            <span className={`badge mb-4 ${
              currentManga.status === 'completed' ? 'badge-success' :
              currentManga.status === 'ongoing' ? 'badge-primary' :
              'badge-secondary'
            }`}>
              {currentManga.status}
            </span>
            <h3 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{currentManga.title}</h3>
            <p className="text-dark-200 text-lg mb-6 line-clamp-3 leading-relaxed">{currentManga.description}</p>
          </div>

          <div className="flex items-center space-x-8 mb-8 text-sm">
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-warning-400 text-warning-400 mr-2" />
              <span className="font-semibold">{currentManga.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              <span className="font-semibold">{currentManga.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              <span className="font-semibold">{currentManga.totalChapters} chapters</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href={`/manga/${currentManga._id}`}
              className="btn-primary text-lg px-8 py-3 shadow-medium hover:shadow-strong"
            >
              Read Now
            </Link>
            <button className="btn-outline text-lg px-6 py-3 border-white text-white hover:bg-white hover:text-dark-900">
              <Heart className="h-5 w-5 mr-2" />
              Add to Favorites
            </button>
            <span className="text-dark-300 text-lg">by {currentManga.author}</span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-dark-900/50 hover:bg-dark-900/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm shadow-soft hover:shadow-medium"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-dark-900/50 hover:bg-dark-900/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm shadow-soft hover:shadow-medium"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

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
