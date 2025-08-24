'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Plus, 
  BookOpen, 
  Edit3, 
  FileImage,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fixR2ImageUrl } from '@/lib/utils';
import imageCompression from 'browser-image-compression';

// Manga Form Interface
interface MangaForm {
  _id?: string;
  title: string;
  description: string;
  author: string;
  artist: string;
  status: string;
  type: string;
  genres: string[];
  tags: string[];
  rating: number;
}

// Chapter Form Interface
interface ChapterForm {
  mangaId: string;
  title: string;
  chapterNumber: number;
  volume: number;
}

// Page File Interface
interface PageFile {
  file: File;
  preview: string;
  pageNumber: number;
}

// Manga List Item Interface
interface MangaListItem {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  status: string;
  chaptersCount: number;
  createdAt: string;
}

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 
  'Harem', 'Horror', 'Romance', 'School Life', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller', 'Yaoi', 'Yuri'
];

const MANGA_TYPES = ['manga', 'manhwa', 'manhua', 'doujinshi'];
const STATUS_OPTIONS = ['ongoing', 'completed', 'hiatus', 'cancelled'];

type TabType = 'upload' | 'edit' | 'chapters';

export default function ManageContent() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  
  // Manga form state
  const [mangaForm, setMangaForm] = useState<MangaForm>({
    title: '',
    description: '',
    author: '',
    artist: '',
    status: 'ongoing',
    type: 'manga',
    genres: [],
    tags: [],
    rating: 0,
  });
  
  // Chapter form state
  const [chapterForm, setChapterForm] = useState<ChapterForm>({
    mangaId: '',
    title: '',
    chapterNumber: 1,
    volume: 1,
  });
  
  // UI state
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingManga, setEditingManga] = useState<MangaForm | null>(null);
  
  // Manga list state
  const [mangaList, setMangaList] = useState<MangaListItem[]>([]);
  const [selectedManga, setSelectedManga] = useState<MangaListItem | null>(null);
  const [mangaLoading, setMangaLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Chapter upload state
  const [pageFiles, setPageFiles] = useState<PageFile[]>([]);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  
  // Chapter editing state
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [editChapterForm, setEditChapterForm] = useState<ChapterForm>({
    mangaId: '',
    title: '',
    chapterNumber: 1,
    volume: 1,
  });
  const [editChapterLoading, setEditChapterLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Image compression options
  const [compressionOptions, setCompressionOptions] = useState({
    maxSizeMB: 2, // Compress to max 2MB
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true,
    fileType: 'image/jpeg',
    quality: 0.8, // 80% quality
  });
  
  const [showCompressionSettings, setShowCompressionSettings] = useState(false);

  useEffect(() => {
    if (activeTab === 'edit' || activeTab === 'chapters') {
      fetchMangaList();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedManga && activeTab === 'chapters') {
      fetchChapters(selectedManga._id);
    }
  }, [selectedManga, activeTab]);

  // Handle edit query parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editMangaId = urlParams.get('edit');
    
    if (editMangaId) {
      // Fetch the manga data and set it for editing
      fetch(`/api/manga/${editMangaId}`)
        .then(res => res.json())
        .then(data => {
          const manga = data.manga; // The API returns data in a 'manga' object
          setMangaForm({
            _id: manga._id,
            title: manga.title,
            description: manga.description,
            author: manga.author,
            artist: manga.artist,
            status: manga.status,
            type: manga.type,
            genres: manga.genres || [],
            tags: manga.tags || [],
            rating: manga.rating || 0,
          });
          setCoverPreview(manga.coverImage);
          setEditingManga(manga);
          setActiveTab('upload');
        })
        .catch(error => {
          console.error('Error fetching manga for editing:', error);
          toast.error('Không thể tải thông tin manga để chỉnh sửa');
        });
    }
  }, []);

  // Ensure page numbers are always sequential when pageFiles changes
  useEffect(() => {
    if (pageFiles.length > 0) {
      const hasGaps = pageFiles.some((page, index) => page.pageNumber !== index + 1);
      if (hasGaps) {
        normalizePageNumbers();
      }
    }
  }, [pageFiles]);

  const fetchMangaList = async () => {
    try {
      setMangaLoading(true);
      const response = await fetch('/api/manga?limit=100');
      const data = await response.json();
      if (data.mangas) {
        setMangaList(data.mangas);
      }
    } catch (error) {
      console.error('Error fetching manga list:', error);
      toast.error('Không thể tải danh sách manga');
    } finally {
      setMangaLoading(false);
    }
  };

  const fetchChapters = async (mangaId: string) => {
    try {
      setChaptersLoading(true);
      const response = await fetch(`/api/chapters?mangaId=${mangaId}`);
      const data = await response.json();
      if (data.chapters) {
        setChapters(data.chapters);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Không thể tải danh sách chương');
    } finally {
      setChaptersLoading(false);
    }
  };

  // Manga form handlers
  const handleMangaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMangaForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) : value
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setMangaForm(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && (!mangaForm.tags || !mangaForm.tags.includes(newTag.trim()))) {
      setMangaForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setMangaForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Kích thước ảnh phải nhỏ hơn 5MB');
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

  const handleMangaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mangaForm.title || !mangaForm.author) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // For new manga, cover image is required
    if (!editingManga && !coverImage) {
      toast.error('Vui lòng tải ảnh bìa cho manga mới');
      return;
    }

    setLoading(true);

    try {
      let coverImageUrl = coverPreview; // Use existing image if editing

      // Only upload new image if one was selected
      if (coverImage) {
        const imageFormData = new FormData();
        imageFormData.append('images', coverImage);
        imageFormData.append('folder', 'manga');

        const imageResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          throw new Error('Không thể tải ảnh bìa');
        }

        const imageData = await imageResponse.json();
        
        if (!imageData.uploads || !Array.isArray(imageData.uploads) || imageData.uploads.length === 0) {
          throw new Error('Định dạng phản hồi tải lên không hợp lệ');
        }
        
        coverImageUrl = imageData.uploads[0]?.url;

        if (!coverImageUrl) {
          throw new Error('Không thể lấy URL ảnh bìa');
        }
      }

      // Then create or update the manga
      const url = editingManga ? `/api/manga/${editingManga._id}` : '/api/manga';
      const method = editingManga ? 'PUT' : 'POST';
      
      const mangaResponse = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mangaForm,
          coverImage: coverImageUrl,
        }),
      });

      if (!mangaResponse.ok) {
        throw new Error(editingManga ? 'Không thể cập nhật manga' : 'Không thể tạo manga');
      }

      toast.success(editingManga ? 'Manga đã được cập nhật thành công!' : 'Manga đã được tải lên thành công!');
      
      // Reset form
      resetMangaForm();
      
      // Refresh manga list if on edit tab
      if (activeTab === 'edit') {
        fetchMangaList();
      }
      
    } catch (error) {
      console.error('Error uploading manga:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tải lên manga');
    } finally {
      setLoading(false);
    }
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
      tags: [],
      rating: 0,
    });
    setCoverImage(null);
    setCoverPreview(null);
    setEditingManga(null);
  };

  // Chapter form handlers
  const handleChapterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setChapterForm(prev => ({
      ...prev,
      [name]: name === 'chapterNumber' || name === 'volume' ? parseInt(value) : value
    }));
  };

  const handleMangaSelect = (mangaId: string) => {
    const manga = mangaList.find(m => m._id === mangaId);
    setSelectedManga(manga || null);
    setChapterForm(prev => ({ ...prev, mangaId }));
  };

  const handlePageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    toast.success(`Đang nén ${files.length} ảnh...`);

    try {
      const compressedPages: PageFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Compress image
        const compressedFile = await imageCompression(file, compressionOptions);
        
        const pageFile: PageFile = {
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          pageNumber: pageFiles.length + i + 1,
        };
        
        compressedPages.push(pageFile);
      }

      setPageFiles(prev => [...prev, ...compressedPages]);
      
      // Show compression results
      const totalOriginalSize = files.reduce((sum, f) => sum + f.size, 0);
      const totalCompressedSize = compressedPages.reduce((sum, p) => sum + p.file.size, 0);
      const savings = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1);
      
      toast.success(`Nén hoàn tất! Tiết kiệm ${savings}% dung lượng`);
      
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Lỗi khi nén ảnh. Sử dụng ảnh gốc.');
      
      // Fallback to original files
      const fallbackPages: PageFile[] = files.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        pageNumber: pageFiles.length + index + 1,
      }));
      
      setPageFiles(prev => [...prev, ...fallbackPages]);
    }
  };

  const removePage = (index: number) => {
    setPageFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((page, i) => ({ ...page, pageNumber: i + 1 }));
    });
  };

  const reorderPages = (fromIndex: number, toIndex: number) => {
    setPageFiles(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated.map((page, i) => ({ ...page, pageNumber: i + 1 }));
    });
  };

  const normalizePageNumbers = () => {
    setPageFiles(prev => 
      prev.map((page, index) => ({ ...page, pageNumber: index + 1 }))
    );
  };

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chapterForm.mangaId || !chapterForm.title || pageFiles.length === 0) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc và tải ít nhất một trang');
      return;
    }

    // Ensure page numbers are sequential before submitting
    normalizePageNumbers();

    // Check file sizes before uploading (considering Vercel overhead)
    const maxFileSize = 25 * 1024 * 1024; // 25MB per file (Vercel will see ~100MB)
    const oversizedFiles = pageFiles.filter(page => page.file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(page => page.file.name).join(', ');
      toast.error(`File quá lớn: ${fileNames}. Kích thước tối đa là 25MB mỗi file (Vercel overhead).`);
      return;
    }

    // Check total payload size (Vercel limit)
    const totalSize = pageFiles.reduce((total, page) => total + page.file.size, 0);
    const maxTotalSize = 30 * 1024 * 1024; // 30MB total (Vercel will see ~100MB)
    if (totalSize > maxTotalSize) {
      toast.error(`Tổng kích thước file quá lớn: ${(totalSize / (1024 * 1024)).toFixed(2)}MB. Tối đa 30MB để tránh lỗi Vercel.`);
      return;
    }

    setChapterLoading(true);

    try {
      // First upload all page images
      const imageFormData = new FormData();
      pageFiles.forEach(page => {
        imageFormData.append('images', page.file);
      });
      imageFormData.append('folder', 'chapters');

      const imageResponse = await fetch('/api/upload', {
        method: 'POST',
        body: imageFormData,
      });

      if (!imageResponse.ok) {
        if (imageResponse.status === 413) {
          throw new Error('File quá lớn. Kích thước tối đa là 100MB mỗi file.');
        }
        const errorData = await imageResponse.json().catch(() => ({}));
        const errorMessage = errorData.error || `Upload failed with status: ${imageResponse.status}`;
        throw new Error(`Không thể tải ảnh trang: ${errorMessage}`);
      }

      const imageData = await imageResponse.json();
      const pageUrls = imageData.uploads;

      if (!pageUrls || pageUrls.length !== pageFiles.length) {
        throw new Error('Một số ảnh tải lên thất bại');
      }

      // Create pages array with URLs and metadata
      const pages = pageUrls.map((result: any, index: number) => ({
        pageNumber: pageFiles[index].pageNumber, // Use the actual page number from pageFiles
        imageUrl: result.url,
        width: 800, // You might want to get actual dimensions
        height: 1200,
      }));

      // Then create the chapter
      const chapterResponse = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...chapterForm,
          pages,
        }),
      });

      if (!chapterResponse.ok) {
        throw new Error('Không thể tạo chương');
      }

      toast.success('Chương đã được tải lên thành công!');
      
      // Reset form
      setChapterForm({
        mangaId: '',
        title: '',
        chapterNumber: 1,
        volume: 1,
      });
      setSelectedManga(null);
      setPageFiles([]);
      
    } catch (error) {
      console.error('Error uploading chapter:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tải lên chương');
    } finally {
      setChapterLoading(false);
    }
  };

  // Edit manga handlers
  const handleEditManga = (manga: MangaListItem) => {
    // Fetch full manga data for editing
    fetch(`/api/manga/${manga._id}`)
      .then(res => res.json())
      .then(data => {
        setMangaForm({
          _id: data._id,
          title: data.title,
          description: data.description,
          author: data.author,
          artist: data.artist,
          status: data.status,
          type: data.type,
          genres: data.genres || [],
          tags: data.tags || [],
          rating: data.rating || 0,
        });
        setCoverPreview(data.coverImage);
        setEditingManga(data);
        setActiveTab('upload');
      })
      .catch(error => {
        console.error('Error fetching manga:', error);
        toast.error('Không thể tải thông tin manga');
      });
  };

  const handleDeleteManga = async (mangaId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa manga này?')) return;
    
    try {
      const response = await fetch(`/api/manga/${mangaId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Manga đã được xóa thành công!');
        fetchMangaList();
      } else {
        throw new Error('Không thể xóa manga');
      }
    } catch (error) {
      console.error('Error deleting manga:', error);
      toast.error('Không thể xóa manga');
    }
  };

  const handleEditChapter = async (chapter: any) => {
    try {
      // Fetch full chapter data
      const response = await fetch(`/api/chapters/${chapter._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chapter data');
      }
      
      const data = await response.json();
      const fullChapter = data.chapter;
      
      // Set editing state
      setEditingChapter(fullChapter);
      setEditChapterForm({
        mangaId: fullChapter.manga._id || fullChapter.manga,
        title: fullChapter.title || '',
        chapterNumber: fullChapter.chapterNumber || 1,
        volume: fullChapter.volume || 1,
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching chapter for editing:', error);
      toast.error('Không thể tải thông tin chương để chỉnh sửa');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chương này? Hành động này không thể hoàn tác.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete chapter');
      }
      
      toast.success('Chương đã được xóa thành công!');
      
      // Refresh chapters list
      if (selectedManga) {
        fetchChapters(selectedManga._id);
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể xóa chương');
    }
  };

  const handleEditChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingChapter) return;
    
    try {
      setEditChapterLoading(true);
      
      const response = await fetch(`/api/chapters/${editingChapter._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editChapterForm.title,
          chapterNumber: editChapterForm.chapterNumber,
          volume: editChapterForm.volume,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update chapter');
      }
      
      toast.success('Chương đã được cập nhật thành công!');
      
      // Close modal and refresh chapters list
      setShowEditModal(false);
      setEditingChapter(null);
      if (selectedManga) {
        fetchChapters(selectedManga._id);
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật chương');
    } finally {
      setEditChapterLoading(false);
    }
  };

  // Filter manga list
  const filteredMangaList = mangaList.filter(manga => {
    const matchesSearch = manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         manga.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || manga.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">
                {editingManga ? 'Chỉnh sửa Manga' : 'Tải lên Manga Mới'}
              </h3>
              
              <form onSubmit={handleMangaSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Tiêu đề *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={mangaForm.title}
                      onChange={handleMangaInputChange}
                      className="form-input-beautiful w-full"
                      placeholder="Nhập tiêu đề manga"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Tác giả *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={mangaForm.author}
                      onChange={handleMangaInputChange}
                      className="form-input-beautiful w-full"
                      placeholder="Nhập tên tác giả"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Họa sĩ
                    </label>
                    <input
                      type="text"
                      name="artist"
                      value={mangaForm.artist}
                      onChange={handleMangaInputChange}
                      className="form-input-beautiful w-full"
                      placeholder="Nhập tên họa sĩ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={mangaForm.status}
                      onChange={handleMangaInputChange}
                      className="form-input-beautiful w-full"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Loại
                    </label>
                    <select
                      name="type"
                      value={mangaForm.type}
                      onChange={handleMangaInputChange}
                      className="form-input-beautiful w-full"
                    >
                      {MANGA_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Đánh giá
                    </label>
                    <input
                      type="number"
                      name="rating"
                      min="0"
                      max="10"
                      step="0.1"
                      value={mangaForm.rating}
                      onChange={handleMangaInputChange}
                      className="form-input-beautiful w-full"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={mangaForm.description}
                    onChange={handleMangaInputChange}
                    rows={4}
                    className="form-input-beautiful w-full"
                    placeholder="Nhập mô tả manga"
                  />
                </div>

                {/* Genres */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Thể loại
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="form-input-beautiful flex-1"
                      placeholder="Nhập tag mới"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mangaForm.tags.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-2 px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-accent-600 hover:text-accent-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Ảnh bìa *
                  </label>
                  <div className="flex items-center gap-4">
                    {coverPreview && (
                      <div className="w-32 h-48 bg-dark-100 rounded-lg overflow-hidden">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-32 h-48 border-2 border-dark-300 border-dashed rounded-lg cursor-pointer bg-dark-50 hover:bg-dark-100 transition-colors">
                      <ImageIcon className="w-8 h-8 mb-2 text-dark-400" />
                      <p className="text-xs text-dark-500 text-center">
                        {coverPreview ? 'Thay đổi ảnh' : 'Tải ảnh bìa'}
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                  {editingManga && (
                    <button
                      type="button"
                      onClick={resetMangaForm}
                      className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                    <span>
                      {loading ? 'Đang tải...' : editingManga ? 'Cập nhật Manga' : 'Tải lên Manga'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'edit':
        return (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="card p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-input-beautiful w-full pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-input-beautiful"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Manga List */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">Danh sách Manga</h3>
              
              {mangaLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-dark-600">Đang tải...</p>
                </div>
              ) : filteredMangaList.length === 0 ? (
                <div className="text-center py-8 text-dark-500">
                  {searchQuery || statusFilter !== 'all' ? 'Không tìm thấy manga nào phù hợp' : 'Chưa có manga nào'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMangaList.map(manga => (
                    <div key={manga._id} className="bg-white rounded-lg border border-dark-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-24 bg-dark-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={fixR2ImageUrl(manga.coverImage)}
                            alt={manga.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-dark-900 truncate">{manga.title}</h4>
                          <p className="text-sm text-dark-600">{manga.author}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              manga.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                              manga.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              manga.status === 'hiatus' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {manga.status}
                            </span>
                            <span className="text-xs text-dark-500">
                              {manga.chaptersCount} chương
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleEditManga(manga)}
                          className="flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                        >
                          <Edit3 className="h-4 w-4" />
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteManga(manga._id)}
                          className="flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                        >
                          <X className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'chapters':
        return (
          <div className="space-y-6">
            {/* Chapter Upload Form */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">Tải lên Chương Mới</h3>
              
              <form onSubmit={handleChapterSubmit} className="space-y-6">
                {/* Manga Selection - Horizontal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Chọn Manga *
                    </label>
                    <select
                      name="mangaId"
                      value={chapterForm.mangaId}
                      onChange={handleChapterInputChange}
                      className="form-input-beautiful w-full"
                      required
                    >
                      <option value="">Chọn manga...</option>
                      {mangaList.map(manga => (
                        <option key={manga._id} value={manga._id}>
                          {manga.title} - {manga.author}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Tiêu đề chương
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={chapterForm.title}
                      onChange={handleChapterInputChange}
                      className="form-input-beautiful w-full"
                      placeholder="Nhập tiêu đề chương"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Số chương
                    </label>
                    <input
                      type="number"
                      name="chapterNumber"
                      min="1"
                      value={chapterForm.chapterNumber}
                      onChange={handleChapterInputChange}
                      className="form-input-beautiful w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Volume
                    </label>
                    <input
                      type="number"
                      name="volume"
                      min="1"
                      value={chapterForm.volume}
                      onChange={handleChapterInputChange}
                      className="form-input-beautiful w-full"
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
                        <p className="text-xs text-dark-400">PNG, JPG hoặc WEBP (TỐI ĐA 25MB mỗi ảnh - Vercel limit)</p>
                        <p className="text-xs text-dark-500 mt-1">
                          Ảnh sẽ được nén tự động để giảm payload size
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handlePageUpload}
                      />
                    </label>
                    
                    {/* Compression Settings */}
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
                                <option value={1}>1MB</option>
                                <option value={2}>2MB</option>
                                <option value={3}>3MB</option>
                                <option value={5}>5MB</option>
                              </select>
                            </div>
                          </div>
                          <p className="text-xs text-green-600">
                            Nén ảnh giúp giảm payload size và tránh lỗi Vercel 413
                          </p>
                        </div>
                      )}
                    </div>

                    {/* File Size Warning */}
                    {pageFiles.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">Thông tin file:</span>
                        </div>
                        <div className="mt-2 text-sm text-blue-600">
                          <p>• Tổng số file: {pageFiles.length}</p>
                          <p>• Tổng kích thước: {(pageFiles.reduce((total, page) => total + page.file.size, 0) / (1024 * 1024)).toFixed(2)} MB</p>
                          <p>• File lớn nhất: {(Math.max(...pageFiles.map(page => page.file.size)) / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        
                        {/* Vercel Overhead Warning */}
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-center space-x-2 text-yellow-700">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs font-medium">⚠️ Vercel Overhead:</span>
                          </div>
                          <p className="text-xs text-yellow-600 mt-1">
                            Vercel sẽ thấy payload lớn hơn ~3-4x do encoding và overhead. 
                            Giữ tổng size dưới 30MB để tránh lỗi.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Page Grid - Enhanced Horizontal Layout */}
                  {pageFiles.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-dark-700">
                          Trang đã tải lên ({pageFiles.length})
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-dark-500">Sắp xếp:</span>
                          <button
                            type="button"
                            onClick={() => normalizePageNumbers()}
                            className="px-3 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-md text-sm transition-colors"
                          >
                            Tự động
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {pageFiles.map((page, index) => (
                          <div key={index} className="relative group bg-white rounded-lg shadow-sm border border-dark-200 hover:shadow-md transition-all duration-200">
                            <div className="aspect-[3/4] bg-dark-100 rounded-lg overflow-hidden">
                              <img
                                src={page.preview}
                                alt={`Page ${page.pageNumber}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Page Number Badge */}
                            <div className="absolute top-2 left-2 bg-dark-900/90 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                              {page.pageNumber}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <div className="absolute top-2 right-2">
                                <button
                                  type="button"
                                  onClick={() => removePage(index)}
                                  className="bg-error-500 hover:bg-error-600 text-white p-1.5 rounded-full shadow-sm transition-colors"
                                  title="Xóa trang"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              
                              {/* Reorder Controls */}
                              <div className="absolute bottom-2 left-2 right-2 flex space-x-1">
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => reorderPages(index, index - 1)}
                                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-1.5 px-2 rounded text-xs shadow-sm transition-colors"
                                    title="Di chuyển trái"
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </button>
                                )}
                                {index < pageFiles.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => reorderPages(index, index + 1)}
                                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-1.5 px-2 rounded text-xs shadow-sm transition-colors"
                                    title="Di chuyển phải"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Drag Handle */}
                            <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-2 h-2 bg-dark-400 rounded-full cursor-move"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {pageFiles.length > 0 && (
                    <p className="mt-4 text-sm text-dark-600">
                      {pageFiles.length} trang đã được tải lên. 
                      Sử dụng nút mũi tên để sắp xếp lại thứ tự trang.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={chapterLoading || pageFiles.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center space-x-2"
                  >
                    {chapterLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                    <span>
                      {chapterLoading ? 'Đang tải...' : 'Tải lên Chương'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Chapter Management Section */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">Quản lý Chương</h3>
              
              {/* Manga Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Lọc theo Manga
                </label>
                <select
                  value={selectedManga?._id || ''}
                  onChange={(e) => {
                    const manga = mangaList.find(m => m._id === e.target.value);
                    setSelectedManga(manga || null);
                  }}
                  className="form-input-beautiful w-full max-w-md"
                >
                  <option value="">Tất cả manga</option>
                  {mangaList.map(manga => (
                    <option key={manga._id} value={manga._id}>
                      {manga.title} - {manga.author}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapters Grid */}
              {selectedManga && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-dark-700">
                      Chương của "{selectedManga.title}"
                    </h4>
                    <button
                      onClick={() => fetchChapters(selectedManga._id)}
                      className="px-3 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-md text-sm transition-colors"
                    >
                      Làm mới
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {chaptersLoading ? (
                      <div className="col-span-full flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : chapters.length > 0 ? (
                      chapters.map((chapter) => (
                        <div key={chapter._id} className="bg-white rounded-lg p-4 border border-dark-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                                Chương {chapter.chapterNumber}
                              </span>
                              {chapter.volume > 1 && (
                                <span className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full text-xs font-medium">
                                  V{chapter.volume}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditChapter(chapter)}
                                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteChapter(chapter._id)}
                                className="p-1.5 text-error-600 hover:bg-error-50 rounded transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <h5 className="font-medium text-dark-900 mb-2 line-clamp-2">
                            {chapter.title || `Chương ${chapter.chapterNumber}`}
                          </h5>
                          
                          <div className="flex items-center justify-between text-sm text-dark-500">
                            <span>{chapter.pages?.length || 0} trang</span>
                            <span>{new Date(chapter.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-dark-50 rounded-lg p-8 border border-dark-200">
                        <div className="text-center text-dark-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-3 text-dark-300" />
                          <p className="text-lg font-medium mb-2">Chưa có chương nào</p>
                          <p className="text-sm">Tải lên chương đầu tiên để bắt đầu</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Quản lý Nội dung</h1>
          <p className="text-dark-600 mt-2">
            Tải lên, chỉnh sửa manga và quản lý chương
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {editingManga ? 'Chỉnh sửa' : 'Tải lên Manga'}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'edit'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Chỉnh sửa Manga
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'chapters'
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
        {renderTabContent()}
      </div>

      {/* Edit Chapter Modal */}
      {showEditModal && editingChapter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-dark-900">
                Chỉnh sửa Chương {editingChapter.chapterNumber}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-dark-400 hover:text-dark-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditChapterSubmit} className="space-y-6">
              {/* Chapter Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Tiêu đề chương
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editChapterForm.title}
                    onChange={(e) => setEditChapterForm(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input-beautiful w-full"
                    placeholder="Nhập tiêu đề chương"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Số chương
                  </label>
                  <input
                    type="number"
                    name="chapterNumber"
                    min="1"
                    value={editChapterForm.chapterNumber}
                    onChange={(e) => setEditChapterForm(prev => ({ ...prev, chapterNumber: parseInt(e.target.value) }))}
                    className="form-input-beautiful w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Volume
                  </label>
                  <input
                    type="number"
                    name="volume"
                    min="1"
                    value={editChapterForm.volume}
                    onChange={(e) => setEditChapterForm(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                    className="form-input-beautiful w-full"
                  />
                </div>
              </div>

              {/* Current Pages Info */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Trang hiện tại ({editingChapter.pages?.length || 0})
                </label>
                <div className="bg-dark-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {editingChapter.pages?.map((page: any, index: number) => (
                      <div key={index} className="relative group">
                        <div className="aspect-[3/4] bg-dark-100 rounded-lg overflow-hidden">
                          <img
                            src={page.imageUrl}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 left-2 bg-dark-900/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {page.pageNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-dark-500 mt-3">
                    Để thay đổi trang, hãy xóa chương này và tạo lại với trang mới.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-dark-600 hover:text-dark-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editChapterLoading}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {editChapterLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                  <span>
                    {editChapterLoading ? 'Đang cập nhật...' : 'Cập nhật Chương'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
