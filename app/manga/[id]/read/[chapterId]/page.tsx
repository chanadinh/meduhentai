'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Home, RotateCcw, RotateCw, MessageCircle, Eye, BookOpen, ThumbsUp, ThumbsDown, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Comments from '@/components/Comments';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Skeleton,
  Divider,
  Chip
} from '@heroui/react';

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
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [reactionCounts, setReactionCounts] = useState({ likes: 0, dislikes: 0 });

  useEffect(() => {
    if (params.id && params.chapterId) {
      fetchMangaAndChapter(params.id as string, params.chapterId as string);
      fetchChapterReactions(params.chapterId as string);
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

  const handleReaction = async (reaction: 'like' | 'dislike') => {
    try {
      const response = await fetch(`/api/chapters/${currentChapter?._id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserReaction(data.reaction);
        setReactionCounts({
          likes: data.likes,
          dislikes: data.dislikes
        });
        toast.success(data.message);
      } else {
        toast.error('Vui lòng đăng nhập để thích/không thích');
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Không thể cập nhật phản ứng');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchChapterReactions = async (chapterId: string) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}/reactions`);
      if (response.ok) {
        const data = await response.json();
        setUserReaction(data.userReaction);
        setReactionCounts({
          likes: data.likes,
          dislikes: data.dislikes
        });
      }
    } catch (error) {
      console.error('Error fetching chapter reactions:', error);
      // Set default values if fetch fails
      setReactionCounts({ likes: 0, dislikes: 0 });
      setUserReaction(null);
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
              <div className="space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-64 mx-auto rounded" />
                  <Skeleton className="h-4 w-48 mx-auto rounded" />
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-96 w-full rounded-2xl" />
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
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <h2 className="text-2xl font-bold text-danger">Chapter Not Found</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600 mb-6">
                    The requested chapter could not be loaded.
                  </p>
                  <Button
                    color="primary"
                    startContent={<Home className="h-4 w-4" />}
                    onClick={() => router.push('/')}
                  >
                    Back to Home
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            overflow-x: hidden !important;
          }
          body::-webkit-scrollbar {
            display: none !important;
          }
          html {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            overflow-x: hidden !important;
          }
          html::-webkit-scrollbar {
            display: none !important;
          }
        `
      }} />
        {/* Main Navigation and Chapter Info Bar Container */}
      <div className={`transition-transform duration-300 ${showBars ? 'translate-y-0' : '-translate-y-full'}`}>
        <Navigation />
        
        {/* Chapter Info Bar */}
        <Card className="fixed top-16 left-0 right-0 z-40 border-b shadow-lg bg-white/95 backdrop-blur-sm">
          <CardBody className="py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <Button
                  onClick={() => router.push(`/manga/${manga._id}`)}
                  variant="ghost"
                  startContent={<Home className="h-4 w-4" />}
                  size="sm"
                >
                  <span className="hidden sm:inline">Về trang chủ</span>
                  <span className="sm:hidden">Về</span>
                </Button>
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{manga.title}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Chương {currentChapter.chapterNumber}: {currentChapter.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <BookOpen className="h-3 w-3" />
                  {currentChapter.pages.length} trang
                </span>
                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <Eye className="h-3 w-3" />
                  {currentChapter.views.toLocaleString()} lượt xem
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>



      {/* Main Content */}
      <div className="pt-28 sm:pt-32 pb-20 sm:pb-24">
        {/* Mobile Chapter Progress Indicator */}
        <div className="lg:hidden mb-4 px-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Chapter {currentChapter.chapterNumber}</span>
                <span>{manga.chapters.length} total</span>
              </div>
              <Progress
                value={(currentChapter.chapterNumber / manga.chapters.length) * 100}
                color="primary"
                size="sm"
                className="w-full"
              />
            </CardBody>
          </Card>
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
            <div className="text-center py-12 sm:py-16">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <h2 className="text-xl sm:text-2xl font-bold text-warning">Không có trang nào</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600 mb-6">
                    Chương này chưa có trang nào được tải lên.
                  </p>
                  <Button
                    color="primary"
                    startContent={<Home className="h-4 w-4" />}
                    onClick={() => router.push(`/manga/${manga._id}`)}
                  >
                    Về trang Manga
                  </Button>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">Bình luận</h2>
              </div>
            </CardHeader>
            <CardBody>
              <Comments mangaId={manga._id} />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <Card className={`fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg bg-white/95 backdrop-blur-sm transition-transform duration-300 ${showBars ? 'translate-y-0' : 'translate-y-full'}`}>
        <CardBody className="py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Section - Reactions */}
            <div className="order-3 lg:order-1 flex items-center justify-center lg:justify-start gap-2">
              <button
                onClick={() => handleReaction('like')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  userReaction === 'like' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">{reactionCounts.likes}</span>
              </button>
              
              <button
                onClick={() => handleReaction('dislike')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  userReaction === 'dislike' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm font-medium">{reactionCounts.dislikes}</span>
              </button>

              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200"
                aria-label="Cuộn lên đầu trang"
              >
                <ArrowUp className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">Lên đầu</span>
              </button>
            </div>

            {/* Center Section - Chapter Navigation */}
            <div className="order-1 lg:order-2 flex items-center justify-center space-x-4">
              <Button
                onClick={goToPrevChapter}
                disabled={!hasPrevChapter}
                variant="ghost"
                startContent={<RotateCcw className="h-4 w-4" />}
                size="lg"
                className="font-semibold"
              >
                <span className="hidden sm:inline">Chương trước</span>
                <span className="sm:hidden">Trước</span>
              </Button>

              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                Chương {currentChapter.chapterNumber} / {manga.chapters.length}
              </span>

              <Button
                onClick={goToNextChapter}
                disabled={!hasNextChapter}
                color="primary"
                endContent={<RotateCw className="h-4 w-4" />}
                size="lg"
                className="font-semibold"
              >
                <span className="hidden sm:inline">Chương sau</span>
                <span className="sm:hidden">Sau</span>
              </Button>
            </div>

            {/* Right Section - Additional Actions */}
            <div className="order-2 lg:order-3 flex items-center justify-center lg:justify-end">
              <Button
                onClick={() => router.push(`/manga/${manga._id}`)}
                variant="ghost"
                startContent={<Home className="h-4 w-4" />}
                size="sm"
                className="font-medium"
              >
                <span className="hidden sm:inline">Về manga</span>
                <span className="sm:hidden">Về</span>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
