'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Home, RotateCcw, RotateCw, MessageCircle, Eye, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import Comments from '@/components/Comments';
import Navigation from '@/components/Navigation';

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  pages: Array<{
    _id: string;
    pageNumber: number;
    imageUrl: string;
    width: number;
    height: number;
  }>;
  views: number;
  createdAt: string;
}

interface Manga {
  _id: string;
  title: string;
  chapters: Chapter[];
}

export default function ChapterReader() {
  const params = useParams();
  const router = useRouter();
  const [manga, setManga] = useState<Manga | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBars, setShowBars] = useState(true);

  useEffect(() => {
    if (params.id && params.chapterId) {
      fetchMangaAndChapter(params.id as string, params.chapterId as string);
    }
  }, [params.id, params.chapterId]);

  // Scroll handling for hiding/showing navigation bars
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      const scrollPosition = currentScrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show bars when scrolling up
      if (scrollDirection === 'up') {
        setShowBars(true);
        clearTimeout(scrollTimeout);
        return;
      }
      
      // Show bars when near the bottom (comment section)
      if (scrollPosition + windowHeight >= documentHeight - 200) {
        setShowBars(true);
        clearTimeout(scrollTimeout);
        return;
      }
      
      // Hide bars when scrolling down
      if (scrollDirection === 'down') {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          // Only hide if still scrolling down and not near bottom
          if (window.scrollY > currentScrollY && window.scrollY + windowHeight < documentHeight - 200) {
            setShowBars(false);
          }
        }, 300);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const fetchMangaAndChapter = async (mangaId: string, chapterId: string) => {
    try {
      console.log('Fetching manga:', mangaId, 'chapter:', chapterId);
      
      const response = await fetch(`/api/manga/${mangaId}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', errorText);
        throw new Error(`Failed to fetch manga: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (!data.manga) {
        console.error('No manga data in response:', data);
        throw new Error('Invalid response format: no manga data');
      }
      
      if (!data.manga.chapters || !Array.isArray(data.manga.chapters)) {
        console.error('No chapters array in response:', data.manga);
        throw new Error('Invalid response format: no chapters array');
      }
      
      setManga(data.manga);
      
      const chapter = data.manga.chapters.find((c: Chapter) => c._id === chapterId);
      console.log('Looking for chapter ID:', chapterId);
      console.log('Available chapters:', data.manga.chapters.map(c => ({ id: c._id, title: c.title })));
      
      if (chapter) {
        console.log('Found chapter:', chapter);
        console.log('Chapter pages:', chapter.pages);
        setCurrentChapter(chapter);
        // Increment view count
        fetch(`/api/chapters/${chapter._id}/view`, { method: 'POST' });
      } else {
        console.error('Chapter not found in chapters array');
        toast.error('Chapter not found');
        router.push(`/manga/${mangaId}`);
      }
    } catch (error) {
      console.error('Error fetching manga:', error);
      toast.error('Failed to load chapter');
    } finally {
      setLoading(false);
    }
  };

  const goToNextChapter = () => {
    if (manga && currentChapter && hasNextChapter) {
      const nextChapter = manga.chapters[currentIndex + 1];
      router.push(`/manga/${manga._id}/read/${nextChapter._id}`);
    }
  };

  const goToPrevChapter = () => {
    if (manga && currentChapter && hasPrevChapter) {
      const prevChapter = manga.chapters[currentIndex - 1];
      router.push(`/manga/${manga._id}/read/${prevChapter._id}`);
    }
  };

  // Calculate chapter navigation state
  const currentIndex = manga ? manga.chapters.findIndex(c => c._id === currentChapter?._id) : -1;
  const hasPrevChapter = currentIndex > 0;
  const hasNextChapter = currentIndex < (manga?.chapters.length || 0) - 1;



  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 pb-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center py-16">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!manga || !currentChapter) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 pb-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md mx-auto shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-red-600">Chapter Not Found</h2>
                <p className="text-gray-600 mb-6">
                  The requested chapter could not be loaded.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Navigation and Chapter Info Bar Container */}
      <div className={`transition-transform duration-300 ${showBars ? 'translate-y-0' : '-translate-y-full'}`}>
        <Navigation />
        
        {/* Chapter Info Bar */}
        <div className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-sm z-40 border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <button
                  onClick={() => router.push(`/manga/${manga._id}`)}
                  className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 text-sm sm:text-base"
                >
                  <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Back to Manga</span>
                  <span className="sm:hidden">Back</span>
                </button>
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{manga.title}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Chapter {currentChapter.chapterNumber}: {currentChapter.title}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1 sm:gap-2">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                  <span className="hidden sm:inline">{currentChapter.pages.length} pages</span>
                  <span className="sm:hidden">{currentChapter.pages.length}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  <span className="hidden sm:inline">{currentChapter.views.toLocaleString()} views</span>
                  <span className="sm:hidden">{currentChapter.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="pt-28 sm:pt-32 pb-20 sm:pb-24">
        {/* Mobile Chapter Progress Indicator */}
        <div className="lg:hidden mb-4 px-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Chapter {currentChapter.chapterNumber}</span>
              <span>{manga.chapters.length} total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentChapter.chapterNumber) / manga.chapters.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          {currentChapter.pages && currentChapter.pages.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {currentChapter.pages.map((page, index) => (
                <div key={page._id || index} className="flex justify-center">
                  <img
                    src={page.imageUrl}
                    alt={`Page ${page.pageNumber || index + 1}`}
                    className="max-w-full h-auto rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl w-full transition-all duration-300 hover:shadow-xl sm:hover:shadow-2xl cursor-pointer"
                    loading="lazy"
                    onClick={() => {
                      // Toggle navigation bars on image tap for mobile
                      if (window.innerWidth < 768) {
                        setShowBars(!showBars);
                      }
                    }}
                    onError={(e) => {
                      console.error(`Failed to load page ${page.pageNumber || index + 1}:`, page.imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-900 py-12 sm:py-16">
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-6 sm:p-8 max-w-md mx-auto shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-600">No Pages Available</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  This chapter doesn't have any pages uploaded yet.
                </p>
                <button
                  onClick={() => router.push(`/manga/${manga._id}`)}
                  className="px-4 sm:px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-all duration-200 flex items-center gap-2 mx-auto text-sm sm:text-base"
                >
                  <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                  Back to Manga
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Bình luận</h2>
            </div>
            <Comments mangaId={manga._id} />
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-t border-gray-200 shadow-lg transition-transform duration-300 ${showBars ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-4">
              <button
                onClick={goToPrevChapter}
                disabled={!hasPrevChapter}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Previous Chapter</span>
                <span className="sm:hidden">Prev</span>
              </button>
              
              <button
                onClick={goToNextChapter}
                disabled={!hasNextChapter}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Next Chapter</span>
                <span className="sm:hidden">Next</span>
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
            
            <div className="text-center sm:text-right text-xs sm:text-sm text-gray-500">
              Chapter {currentChapter.chapterNumber} of {manga.chapters.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
