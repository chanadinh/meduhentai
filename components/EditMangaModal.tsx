'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface MangaForm {
  _id?: string;
  title: string;
  description: string;
  author: string;
  artist: string;
  status: string;
  type: string;
  genres: string[];
}

interface EditMangaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mangaId: string;
  onSuccess: () => void;
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

export default function EditMangaModal({ isOpen, onClose, mangaId, onSuccess }: EditMangaModalProps) {
  const { data: session } = useSession();
  
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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch manga data when modal opens
  useEffect(() => {
    if (isOpen && mangaId) {
      fetchMangaData();
    }
  }, [isOpen, mangaId]);

  // Auto-fill artist field with current user's username
  useEffect(() => {
    if (session?.user?.username && !mangaForm.artist) {
      setMangaForm(prev => ({
        ...prev,
        artist: session.user.username
      }));
    }
  }, [session, mangaForm.artist]);

  const fetchMangaData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/manga/${mangaId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch manga data');
      }
      
      const data = await response.json();
      const manga = data.manga;
      
      setMangaForm({
        _id: manga._id || '',
        title: manga.title || '',
        description: manga.description || '',
        author: manga.author || '',
        artist: manga.artist || '',
        status: manga.status || 'ongoing',
        type: manga.type || 'manga',
        genres: manga.genres || [],
      });
      
      setCoverPreview(manga.coverImage);
    } catch (error) {
      console.error('Error fetching manga:', error);
      toast.error('Không thể tải thông tin manga');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMangaForm(prev => ({
      ...prev,
      [name]: value
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

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 1024) { // 1GB limit
        toast.error('Kích thước ảnh phải nhỏ hơn 1GB');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mangaForm.title || !mangaForm.author) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!mangaId) {
      toast.error('Không tìm thấy ID manga');
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
          const errorData = await imageResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || `Upload failed with status: ${imageResponse.status}`;
          throw new Error(`Không thể tải ảnh bìa: ${errorMessage}`);
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

      // Update the manga
      const response = await fetch(`/api/manga/${mangaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mangaForm,
          coverImage: coverImageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật manga');
      }

      toast.success('Manga đã được cập nhật thành công!');
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error updating manga:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật manga');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa Manga</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {initialLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải thông tin manga...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" style={{ pointerEvents: initialLoading ? 'none' : 'auto' }}>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={mangaForm.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề manga"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tác giả *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={mangaForm.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập tên tác giả"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họa sĩ
                  </label>
                  <input
                    type="text"
                    name="artist"
                    value={mangaForm.artist}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    placeholder="Tự động điền từ người đăng"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Tự động điền từ tài khoản của bạn</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={mangaForm.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại
                  </label>
                  <select
                    name="type"
                    value={mangaForm.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {MANGA_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={mangaForm.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập mô tả manga"
                />
              </div>

              {/* Genres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>



              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh bìa
                </label>
                <div className="flex items-center gap-4">
                  {coverPreview && (
                    <div className="w-32 h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-32 h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500 text-center">
                      {coverPreview ? 'Thay đổi ảnh' : 'Tải ảnh bìa'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
