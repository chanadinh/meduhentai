'use client';

import Link from 'next/link';
import { Heart, Eye, Star, BookOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { fixR2ImageUrl } from '@/lib/utils';

interface MangaCardProps {
  manga: {
    _id: string;
    title: string;
    coverImage: string;
    author: string;
    views: number;
    totalChapters: number;
    status: string;
    genres: string[];
  };
  showStats?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function MangaCard({ manga, showStats = true, size = 'medium' }: MangaCardProps) {
  const { data: session } = useSession();

  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64',
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

  return (
    <div className="group manga-card">
      <Link href={`/manga/${manga._id}`} className="block">
        <div className={`relative overflow-hidden rounded-lg bg-dark-200 mb-3 ${sizeClasses[size]}`}>
          <img
            src={fixR2ImageUrl(manga.coverImage)}
            alt={manga.title}
            className={`w-full ${sizeClasses[size]} object-cover group-hover:scale-105 transition-transform duration-300`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`status-badge ${
              manga.status === 'completed' ? 'status-completed' :
              manga.status === 'ongoing' ? 'status-ongoing' :
              manga.status === 'hiatus' ? 'status-hiatus' :
              'status-cancelled'
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
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-secondary-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </Link>

      <div className="space-y-1">
        <Link href={`/manga/${manga._id}`}>
          <h3 className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {manga.title}
          </h3>
        </Link>
        
        <p className="text-sm text-secondary-600">{manga.author}</p>
        
        {showStats && (
          <div className="flex items-center justify-between text-xs text-secondary-500">
            <span className="flex items-center">
              <BookOpen className="h-3 w-3 mr-1" />
              {manga.totalChapters} chapters
            </span>
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {manga.views.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
