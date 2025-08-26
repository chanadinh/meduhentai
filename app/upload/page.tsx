'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  BookOpen, 
  FileImage, 
  X, 
  Save, 
  Plus,
  Trash2,
  Edit3,
  ImageIcon
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import toast from 'react-hot-toast';
import { fixR2ImageUrl } from '@/lib/utils';

interface MangaForm {
  title: string;
  description: string;
  author: string;
  artist: string;
  status: string;
  type: string;
  genres: string[];
}

interface ChapterForm {
  title: string;
  chapterNumber: number;
  volume: string;
  mangaId: string;
  pages: Array<{
    pageNumber: number;
    imageUrl: string;
    width: number;
    height: number;
  }>;
}

const GENRES = [
  'Action', 'Adventure', 'Anal', 'Ahegao', 'BDSM', 'Beach', 'Big Breasts', 'Big Dick', 'Bikini', 
  'Blindfold', 'Blonde', 'Bondage', 'Bukkake', 'Bunny Costume', 'Cheating', 
  'Chikan', 'Chubby', 'Closed Eyes', 'Clit Stimulation', 'Comedy', 'Cosplay', 'Costume', 'Defloration', 
  'Deepthroat', 'Demon', 'Dildo', 'Drama', 'Drugs', 'Ecchi', 'Ebony', 'Elbow Gloves', 'Electrocution', 'Elf', 
  'Enema', 'Exhibitionist', 'Fantasy', 'Fat', 'Femdom', 'Fisting', 'Flatchest', 
  'Footjob', 'Futa', 'Futanari', 'Gangbang', 'Gape', 'Glasses', 'Glory Hole', 'High Heels',
  'Gyaru', 'Handjob', 'Harem', 'Huge Ass', 'Huge Breast', 'Huge Dick', 'Horror', 
  'Incest', 'Lady Suit', 'Latex', 'Legwear', 'Lesbian', 'Maid', 'Masturbation', 
  'MILF', 'Mind Break', 'Mind Control', 'Monster', 'Mother', 'Mother and Daughter', 'Multiple Orgasms', 'Nakadashi', 'Nerd', 
  'Nipple Stimulation', 'NTR', 'Nun', 'Oral', 'Orc', 'Orgy', 'Pantyhose', 'Petplay', 'Piercing', 'Piss', 
  'Pregnant', 'Princess', 'Prolapse', 'Prostitution', 'Public', 'Public Toilet', 
  'Public Vibrator', 'Rape', 'Romance', 'School Life', 'Sci-Fi', 'Sex Toys', 'Short Hair', 
  'Sister', 'Slave', 'Slice of Life', 'Slut', 'Slut Dress', 'Sole Female', 'Sports', 'Squirt', 
  'Stomach Bulge', 'Supernatural', 'Swimsuit', 'Tail', 'Tan', 'Tan Lines', 
  'Tattoo', 'Teacher', 'Tentacles', 'Thriller', 'Tomboy', 'Train', 'Trap', 
  'Uncensored', 'Vanilla', 'Vibrator', 'Warrior', 'Wife', 'X-ray', 'Yaoi', 'Yuri'
];

const MANGA_TYPES = ['manga', 'manhwa', 'manhua', 'doujinshi'];
const STATUS_OPTIONS = ['ongoing', 'completed'];

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'manga' | 'chapter'>('manga');
  
  // Upload method state
  const [uploadMethod, setUploadMethod] = useState<'server' | 'r2'>('r2');
  const [showCompressionSettings, setShowCompressionSettings] = useState(false);
  const [compressionOptions, setCompressionOptions] = useState({
    quality: 0.8,
    maxSizeMB: 2.0
  });
  
  // Manga form state
  const [mangaForm, setMangaForm] = useState<MangaForm>({
    title: '',
    description: '',
    author: '',
    artist: '',
    status: 'ongoing',
    type: 'manga',
    genres: [],
  });
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [mangaLoading, setMangaLoading] = useState(false);
  
  // Chapter form state
  const [chapterForm, setChapterForm] = useState<ChapterForm>({
    title: '',
    chapterNumber: 1,
    volume: '',
    mangaId: '',
    pages: []
  });
  
  const [selectedManga, setSelectedManga] = useState<any>(null);
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [pageFiles, setPageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    
    console.log('Session status:', status);
    console.log('Session data:', session);
    console.log('User role:', session?.user?.role);
    
    if (!session) {
      console.log('No session, redirecting to signin');
      router.push('/auth/signin');
      return;
    }

    // Check if user has upload permissions
    if (session.user?.role !== 'uploader' && session.user?.role !== 'admin') {
      console.log('User role not allowed:', session.user?.role);
      console.log('Redirecting to home');
      router.push('/');
      return;
    }

    console.log('User has upload permissions, proceeding');
    
    // Auto-fill artist field with current user's username
    if (session.user?.username && !mangaForm.artist) {
      setMangaForm(prev => ({
        ...prev,
        artist: session.user.username
      }));
    }

    // Fetch user's manga for chapter uploads
    fetchUserManga();
  }, [session, status, router]);

  const fetchUserManga = async () => {
    try {
      const response = await fetch('/api/manga/my');
      if (response.ok) {
        const data = await response.json();
        setMangaList(data.mangas || []);
      }
    } catch (error) {
      console.error('Error fetching user manga:', error);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File size too large. Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        e.target.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        e.target.value = '';
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPageFiles(files);
    
    // Create page objects for the form
    const pages = files.map((file, index) => ({
      pageNumber: index + 1,
      imageUrl: '', // Will be set after upload
      width: 800,
      height: 1200
    }));
    
    setChapterForm(prev => ({ ...prev, pages }));
  };

  const handleMangaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coverImage) {
      toast.error('Vui lòng chọn ảnh bìa');
      return;
    }

    try {
      setMangaLoading(true);
      
      if (uploadMethod === 'r2') {
        // R2 Direct Upload Method
        await handleR2MangaUpload();
      } else {
        // Server Upload Method
        await handleServerMangaUpload();
      }
      
    } catch (error) {
      console.error('Error uploading manga:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tải lên manga');
    } finally {
      setMangaLoading(false);
    }
  };

  const handleR2MangaUpload = async () => {
    try {
      // Get presigned URL for cover image
      const presignedResponse = await fetch('/api/upload/user-r2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'manga-cover',
          fileName: `cover_${Date.now()}.${coverImage!.name.split('.').pop()}`,
          contentType: coverImage!.type,
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get presigned URL for cover');
      }

      const { presignedUrl, fileKey } = await presignedResponse.json();

      // Upload cover image directly to R2
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: coverImage,
        headers: {
          'Content-Type': coverImage!.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload cover image to R2');
      }

      // Create manga with R2 cover image URL
      const mangaData = {
        ...mangaForm,
        coverImage: `https://${process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${fileKey}`,
      };

      const response = await fetch('/api/manga', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mangaData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.details || 'Failed to create manga');
      }

      toast.success('Manga đã được tải lên thành công qua R2!');
      resetMangaForm();
      fetchUserManga();
      
    } catch (error) {
      console.error('R2 upload failed:', error);
      toast.error('R2 upload failed, trying server upload as fallback...');
      
      // Fallback to server upload
      await handleServerMangaUpload();
    }
  };

  const handleServerMangaUpload = async () => {
    const formData = new FormData();
    formData.append('coverImage', coverImage!);
    formData.append('data', JSON.stringify(mangaForm));
    formData.append('uploadMethod', 'server');

    const response = await fetch('/api/manga', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || 'Failed to upload manga');
    }

    toast.success('Manga đã được tải lên thành công qua server!');
    resetMangaForm();
    fetchUserManga();
  };

  const resetMangaForm = () => {
    setMangaForm({
      title: '',
      description: '',
      author: '',
      artist: '',
      status: 'ongoing',
      type: 'manga',
      genres: [],
    });
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedManga) {
      toast.error('Vui lòng chọn manga');
      return;
    }

    if (pageFiles.length === 0) {
      toast.error('Vui lòng chọn ảnh chương');
      return;
    }

    try {
      setChapterLoading(true);
      
      if (uploadMethod === 'r2') {
        // R2 Direct Upload Method
        await handleR2ChapterUpload();
      } else {
        // Server Upload Method
        await handleServerChapterUpload();
      }
      
    } catch (error) {
      console.error('Error uploading chapter:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tải lên chương');
    } finally {
      setChapterLoading(false);
    }
  };

  const handleR2ChapterUpload = async () => {
    try {
      // Get presigned URL for R2 upload
      const presignedResponse = await fetch('/api/upload/user-r2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chapter-pages',
          mangaId: selectedManga._id,
          title: chapterForm.title,
          chapterNumber: chapterForm.chapterNumber,
          volume: chapterForm.volume,
          pageCount: pageFiles.length,
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get presigned URLs');
      }

      const { presignedUrls, fileKeys, chapterId } = await presignedResponse.json();

      // Upload each page directly to R2
      const uploadPromises = pageFiles.map(async (file, index) => {
        const presignedUrl = presignedUrls[index];
        if (!presignedUrl) {
          throw new Error(`No presigned URL for page ${index + 1}`);
        }

        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload page ${index + 1} to R2`);
        }

        return {
          pageNumber: index + 1,
          imageUrl: `https://${process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${fileKeys[index]}`,
          width: 800,
          height: 1200
        };
      });

      const uploadedPages = await Promise.all(uploadPromises);

      // Create chapter with uploaded pages
      const chapterResponse = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mangaId: selectedManga._id,
          title: chapterForm.title,
          chapterNumber: chapterForm.chapterNumber,
          volume: chapterForm.volume,
          pages: uploadedPages,
        }),
      });

      if (!chapterResponse.ok) {
        throw new Error('Failed to create chapter');
      }

      toast.success('Chương đã được tải lên thành công qua R2!');
      resetChapterForm();
      
    } catch (error) {
      console.error('R2 upload failed:', error);
      toast.error('R2 upload failed, trying server upload as fallback...');
      
      // Fallback to server upload
      await handleServerChapterUpload();
    }
  };

  const handleServerChapterUpload = async () => {
    const formData = new FormData();
    formData.append('mangaId', selectedManga._id);
    formData.append('title', chapterForm.title);
    formData.append('chapterNumber', chapterForm.chapterNumber.toString());
    formData.append('volume', chapterForm.volume);
    formData.append('uploadMethod', 'server');
    formData.append('compressionQuality', compressionOptions.quality.toString());
    formData.append('maxSizeMB', compressionOptions.maxSizeMB.toString());
    
    // Append page files
    pageFiles.forEach((file, index) => {
      formData.append('pages', file);
    });

    const response = await fetch('/api/chapters', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload chapter');
    }

    toast.success('Chương đã được tải lên thành công qua server!');
    resetChapterForm();
  };

  const resetChapterForm = () => {
    setChapterForm({
      title: '',
      chapterNumber: 1,
      volume: '',
      mangaId: '',
      pages: []
    });
    setSelectedManga(null);
    setPageFiles([]);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-dark-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user?.role !== 'uploader' && session.user?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-4">Access Denied</h1>
          <p className="text-dark-600 mb-4">
            You don't have permission to upload content. Only uploaders and admins can access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info (Development Only)</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>Session Status: {status}</p>
              <p>User ID: {session?.user?.id || 'None'}</p>
              <p>Username: {session?.user?.username || 'None'}</p>
              <p>User Role: {session?.user?.role || 'None'}</p>
              <p>Has Upload Permission: {(session?.user?.role === 'uploader' || session?.user?.role === 'admin') ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-900">Tải lên Nội dung</h1>
          <p className="text-dark-600 mt-2">
            Tải lên manga mới hoặc thêm chương cho manga hiện có
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('manga')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'manga'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Tải lên Manga
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('chapter')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'chapter'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Tải lên Chương
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'manga' ? (
          <div className="bg-white rounded-xl p-6 border border-dark-200">
            <h2 className="text-xl font-semibold text-dark-900 mb-6">Tải lên Manga mới</h2>
            
            {/* Upload Method Toggle */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Phương thức tải lên:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('server')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      uploadMethod === 'server'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Server Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('r2')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      uploadMethod === 'r2'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    R2 Direct Upload
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                {uploadMethod === 'server' ? (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Server Upload: Tải lên qua server (giới hạn 10MB, có nén ảnh)</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>R2 Direct Upload: Tải lên trực tiếp lên R2 (không giới hạn kích thước, không nén)</span>
                  </div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleMangaSubmit} className="space-y-6">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Ảnh bìa
                </label>
                <div className="flex items-center space-x-4">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-32 h-48 object-cover rounded-lg border border-dark-200"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="block w-full text-sm text-dark-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <p className="text-xs text-dark-500 mt-1">
                      Chọn ảnh bìa cho manga (JPG, PNG, GIF)
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={mangaForm.title}
                    onChange={(e) => setMangaForm(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input-beautiful w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    value={mangaForm.author}
                    onChange={(e) => setMangaForm(prev => ({ ...prev, author: e.target.value }))}
                    className="form-input-beautiful w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Họa sĩ
                  </label>
                  <input
                    type="text"
                    value={mangaForm.artist}
                    onChange={(e) => setMangaForm(prev => ({ ...prev, artist: e.target.value }))}
                    className="form-input-beautiful w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Loại
                  </label>
                  <select
                    value={mangaForm.type}
                    onChange={(e) => setMangaForm(prev => ({ ...prev, type: e.target.value }))}
                    className="form-input-beautiful w-full"
                  >
                    {MANGA_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={mangaForm.status}
                    onChange={(e) => setMangaForm(prev => ({ ...prev, status: e.target.value }))}
                    className="form-input-beautiful w-full"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={mangaForm.description}
                  onChange={(e) => setMangaForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="form-input-beautiful w-full"
                  required
                />
              </div>

              {/* Genres */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Thể loại
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-dark-200 rounded-lg">
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => {
                        if (mangaForm.genres.includes(genre)) {
                          setMangaForm(prev => ({
                            ...prev,
                            genres: prev.genres.filter(g => g !== genre)
                          }));
                        } else {
                          setMangaForm(prev => ({
                            ...prev,
                            genres: [...prev.genres, genre]
                          }));
                        }
                      }}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        mangaForm.genres.includes(genre)
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={mangaLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mangaLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang tải lên...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Tải lên Manga
                  </div>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 border border-dark-200">
            <h2 className="text-xl font-semibold text-dark-900 mb-6">Tải lên Chương mới</h2>
            
            {/* Upload Method Toggle */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Phương thức tải lên:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('server')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      uploadMethod === 'server'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Server Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('r2')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      uploadMethod === 'r2'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    R2 Direct Upload
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                {uploadMethod === 'server' ? (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Server Upload: Tải lên qua server (giới hạn 100MB, có nén ảnh)</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>R2 Direct Upload: Tải lên trực tiếp lên R2 (không giới hạn kích thước, không nén)</span>
                  </div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleChapterSubmit} className="space-y-6">
              {/* Manga Selection */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Chọn Manga
                </label>
                <select
                  value={selectedManga?._id || ''}
                  onChange={(e) => {
                    const manga = mangaList.find(m => m._id === e.target.value);
                    setSelectedManga(manga);
                    setChapterForm(prev => ({ ...prev, mangaId: e.target.value }));
                  }}
                  className="form-input-beautiful w-full"
                  required
                >
                  <option value="">Chọn manga để tải lên chương</option>
                  {mangaList.map(manga => (
                    <option key={manga._id} value={manga._id}>
                      {manga.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Tiêu đề chương
                  </label>
                  <input
                    type="text"
                    value={chapterForm.title}
                    onChange={(e) => setChapterForm(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input-beautiful w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Số chương
                  </label>
                  <input
                    type="number"
                    value={chapterForm.chapterNumber}
                    onChange={(e) => setChapterForm(prev => ({ ...prev, chapterNumber: parseInt(e.target.value) }))}
                    className="form-input-beautiful w-full"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={chapterForm.volume}
                    onChange={(e) => setChapterForm(prev => ({ ...prev, volume: e.target.value }))}
                    className="form-input-beautiful w-full"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Page Upload */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Trang chương *
                </label>
                
                {/* Upload Area */}
                <div className="mb-6">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dark-300 border-dashed rounded-xl cursor-pointer bg-dark-50 hover:bg-dark-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-dark-400" />
                      <p className="mb-2 text-sm text-dark-500">
                        <span className="font-semibold">Click để tải</span> trang chương
                      </p>
                      <p className="text-xs text-dark-400">
                        PNG, JPG hoặc WEBP 
                        {uploadMethod === 'server' 
                          ? ' (TỐI ĐA 25MB mỗi ảnh - Server limit)' 
                          : ' (Không giới hạn kích thước - R2 direct)'
                        }
                      </p>
                      <p className="text-xs text-dark-500 mt-1">
                        {uploadMethod === 'server' 
                          ? 'Ảnh sẽ được nén tự động để giảm payload size'
                          : 'Ảnh sẽ được tải lên trực tiếp lên R2 không qua server'
                        }
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handlePageFilesChange}
                    />
                  </label>
                  
                  {/* Compression Settings */}
                  {uploadMethod === 'server' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">⚡ Cài đặt nén ảnh:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCompressionSettings(!showCompressionSettings)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          {showCompressionSettings ? 'Ẩn' : 'Hiện'}
                        </button>
                      </div>
                      
                      {showCompressionSettings && (
                        <div className="mt-3 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-green-700 mb-1">Chất lượng:</label>
                              <select
                                value={compressionOptions.quality}
                                onChange={(e) => setCompressionOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                                className="w-full text-xs border border-green-200 rounded px-2 py-1"
                              >
                                <option value={0.9}>90% (Chất lượng cao)</option>
                                <option value={0.8}>80% (Chất lượng tốt)</option>
                                <option value={0.7}>70% (Chất lượng trung bình)</option>
                                <option value={0.6}>60% (Chất lượng thấp)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-green-700 mb-1">Kích thước tối đa:</label>
                              <select
                                value={compressionOptions.maxSizeMB}
                                onChange={(e) => setCompressionOptions(prev => ({ ...prev, maxSizeMB: parseFloat(e.target.value) }))}
                                className="w-full text-xs border border-green-200 rounded px-2 py-1"
                              >
                                <option value={1.0}>1.0 MB</option>
                                <option value={2.0}>2.0 MB</option>
                                <option value={5.0}>5.0 MB</option>
                                <option value={10.0}>10.0 MB</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {pageFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-dark-600 mb-2">
                      Đã chọn {pageFiles.length} ảnh:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {pageFiles.map((file, index) => (
                        <div key={index} className="text-xs text-dark-500">
                          {index + 1}. {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={chapterLoading || !selectedManga}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chapterLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang tải lên...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Tải lên Chương
                  </div>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
