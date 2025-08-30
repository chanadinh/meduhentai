'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Eye, Star, BookOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { fixR2ImageUrl } from '@/lib/utils';

interface Manga {
  _id: string;
  title: string;
  coverImage: string;
  author: string;
  views: number;
  totalChapters: number;
  status: string;
  genres: string[];
}

interface MangaGridProps {
  endpoint: string;
  showPagination?: boolean;
  limit?: number;
}

export default function MangaGrid({ endpoint, showPagination = true, limit = 20 }: MangaGridProps) {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    fetchMangas();
  }, [endpoint, currentPage]);

  const fetchMangas = async () => {
    try {
      setLoading(true);
      const url = new URL(endpoint, window.location.origin);
      if (showPagination) {
        url.searchParams.set('page', currentPage.toString());
        url.searchParams.set('limit', limit.toString());
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.mangas) {
        setMangas(data.mangas);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error fetching mangas:', error);
      toast.error('Failed to load manga');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (mangaId: string) => {
    if (!session) {
      toast.error('Please sign in to add favorites');
      return;
    }

    try {
      const response = await fetch(`/api/user/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mangaId }),
      });

      if (response.ok) {
        toast.success('Added to favorites!');
      } else {
        toast.error('Failed to add to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Failed to add to favorites');
    }
  };

  if (loading) {
    return (
      <div className="manga-grid">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-dark-200 rounded-xl h-48 mb-3"></div>
            <div className="bg-dark-200 rounded-lg h-4 mb-2"></div>
            <div className="bg-dark-200 rounded-lg h-3 w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (mangas.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex flex-col items-center p-8 bg-white rounded-xl shadow-soft">
          <BookOpen className="h-16 w-16 text-dark-300 mb-4" />
          <p className="text-dark-500 text-lg font-medium">No manga found</p>
          <p className="text-dark-400 text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="manga-grid">
        {mangas.map((manga) => (
          <div key={manga._id} className="manga-card manga-card-hover group">
            <Link href={`/manga/${manga._id}`} className="block">
                          <div className="manga-cover h-64 sm:h-72 lg:h-80 w-full">
              <img
                src={fixR2ImageUrl(manga.coverImage)}
                alt={manga.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
                <div className="manga-overlay" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`badge ${
                    manga.status === 'completed' ? 'badge-success' :
                    manga.status === 'ongoing' ? 'badge-primary' :
                    'badge-secondary'
                  }`}>
                    {manga.status}
                  </span>
                </div>



                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleFavorite(manga._id);
                  }}
                  className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                  aria-label="Thêm vào yêu thích"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            </Link>

            <div className="p-4 space-y-3">
              <Link href={`/manga/${manga._id}`}>
                <h3 className="manga-title text-sm">
                  {manga.title}
                </h3>
              </Link>
              
              <p className="manga-author text-xs">
                {manga.author}
              </p>
              
              <div className="manga-stats">
                <span className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {manga.totalChapters}
                </span>
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {manga.views.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 mt-12">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              if (totalPages <= 5) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                      page === currentPage
                        ? 'bg-primary-600 text-white shadow-medium'
                        : 'bg-white text-dark-700 hover:bg-dark-50 border border-dark-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              
              // Show first page, current page, and last page with ellipsis
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                      page === currentPage
                        ? 'bg-primary-600 text-white shadow-medium'
                        : 'bg-white text-dark-700 hover:bg-dark-50 border border-dark-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="text-dark-400">...</span>;
              }
              
              return null;
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
