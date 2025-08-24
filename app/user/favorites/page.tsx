'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MangaCard from '@/components/MangaCard';

interface Manga {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  genres: string[];

  author: string;
  artist: string;
  status: 'ongoing' | 'completed';
  views: number;
  chaptersCount: number;
  totalChapters?: number; // Add this for MangaCard compatibility
}

export default function UserFavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchFavorites();
  }, [session, status, router]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/favorites');
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách yêu thích');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (mangaId: string) => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mangaId }),
      });

      if (!response.ok) {
        throw new Error('Không thể xóa khỏi danh sách yêu thích');
      }

      // Remove from local state
      setFavorites(prev => prev.filter(manga => manga._id !== mangaId));
    } catch (err) {
      console.error('Lỗi khi xóa khỏi danh sách yêu thích:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-light-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-dark-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-900 mb-2">Danh sách yêu thích của tôi</h1>
          <p className="text-dark-600">
            {favorites.length === 0 
              ? "Bạn chưa thêm manga nào vào danh sách yêu thích." 
              : `Bạn có ${favorites.length} manga yêu thích.`
            }
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-dark-600">Đang tải danh sách yêu thích...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchFavorites}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-dark-700 mb-2">Chưa có yêu thích nào</h3>
            <p className="text-dark-600 mb-6">Hãy bắt đầu khám phá manga và thêm vào danh sách yêu thích của bạn!</p>
            <button
              onClick={() => router.push('/browse')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Duyệt manga
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites.map((manga) => (
              <div key={manga._id} className="relative group">
                <MangaCard 
                  manga={{
                    ...manga,
                    totalChapters: manga.chaptersCount,
                    status: manga.status
                  }} 
                />
                <button
                  onClick={() => removeFromFavorites(manga._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Xóa khỏi danh sách yêu thích"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
