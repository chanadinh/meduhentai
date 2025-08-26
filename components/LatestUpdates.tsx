'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Eye, Star, BookOpen } from 'lucide-react';
import { fixR2ImageUrl } from '@/lib/utils';

interface LatestUpdate {
  _id: string;
  title: string;
  coverImage: string;
  author: string;
  views: number;
  totalChapters: number;
  status: string;
  latestChapterUpdate: string; // This now represents the latest chapter creation time
  latestChapter?: {
    title: string;
    chapterNumber: number;
    uploadDate: string;
  };
}

export default function LatestUpdates() {
  const [latestUpdates, setLatestUpdates] = useState<LatestUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestUpdates();
  }, []);

  const fetchLatestUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manga?sortBy=lastUpdated&sortOrder=desc&limit=8');
      const data = await response.json();
      
      if (data.mangas) {
        setLatestUpdates(data.mangas);
      }
    } catch (error) {
      console.error('Error fetching latest updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays - 1} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="manga-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-dark-200 rounded-xl h-48 mb-3"></div>
            <div className="bg-dark-200 rounded-lg h-4 mb-2"></div>
            <div className="bg-dark-200 rounded-lg h-3 w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (latestUpdates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex flex-col items-center p-8 bg-white rounded-xl shadow-soft">
          <Clock className="h-16 w-16 text-dark-300 mb-4" />
          <p className="text-dark-500 text-lg font-medium">No updates available</p>
          <p className="text-dark-400 text-sm">Check back later for new releases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manga-grid">
      {latestUpdates.map((manga) => (
        <div key={manga._id} className="manga-card manga-card-hover group">
          <Link href={`/manga/${manga._id}`} className="block">
            <div className="manga-cover h-48 w-full">
              <img
                src={fixR2ImageUrl(manga.coverImage)}
                alt={manga.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="manga-overlay" />
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <span className={`badge ${
                  manga.status === 'completed' ? 'badge-success' :
                  manga.status === 'ongoing' ? 'badge-primary' :
                  'badge-secondary'
                }`}>
                  {manga.status}
                </span>
              </div>


            </div>
          </Link>

          <div className="p-3 space-y-2">
            <Link href={`/manga/${manga._id}`}>
              <h3 className="manga-title text-sm">
                {manga.title}
              </h3>
            </Link>
            
            <div className="flex items-center justify-between text-xs text-dark-500">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span title="Thời gian chương mới nhất được tạo">Cập nhật: {formatDate(manga.latestChapterUpdate)}</span>
              </span>
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {manga.views.toLocaleString()}
              </div>
            </div>

            {manga.latestChapter && (
              <div className="text-xs text-dark-600 bg-dark-50 p-2 rounded-lg">
                <span className="font-medium">Latest:</span> Ch.{manga.latestChapter.chapterNumber} - {manga.latestChapter.title}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
