'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, Grid, List } from 'lucide-react';
import Navigation from '@/components/Navigation';
import MangaGrid from '@/components/MangaGrid';
import toast from 'react-hot-toast';

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [status, setStatus] = useState('all');
  const [genre, setGenre] = useState('all');

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/browse?${params.toString()}`);
  };

  const buildEndpoint = () => {
    const params = new URLSearchParams();
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (status !== 'all') params.set('status', status);
    if (genre !== 'all') params.set('genre', genre);
    
    return `/api/manga?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-dark-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-4">
            Duyệt Tất cả Manga
          </h1>
          <p className="text-xl text-dark-600">
            Khám phá bộ sưu tập manga hentai đa dạng của chúng tôi
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl p-6 border border-dark-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-dark-700">Bộ lọc:</span>
              </div>
              
              {/* Status Filter */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleFilterChange('status', e.target.value);
                }}
                className="px-3 py-2 border border-dark-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ongoing">Đang tiến hành</option>
                <option value="completed">Hoàn thành</option>

              </select>

              {/* Genre Filter */}
              <select
                value={genre}
                onChange={(e) => {
                  setGenre(e.target.value);
                  handleFilterChange('genre', e.target.value);
                }}
                className="px-3 py-2 border border-dark-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tất cả thể loại</option>
                <option value="action">Hành động</option>
                <option value="adventure">Phiêu lưu</option>
                <option value="comedy">Hài hước</option>
                <option value="drama">Drama</option>
                <option value="fantasy">Fantasy</option>
                <option value="horror">Kinh dị</option>
                <option value="mystery">Bí ẩn</option>
                <option value="romance">Lãng mạn</option>
                <option value="sci-fi">Khoa học viễn tưởng</option>
                <option value="slice-of-life">Đời thường</option>
                <option value="sports">Thể thao</option>
                <option value="supernatural">Siêu nhiên</option>
                <option value="thriller">Giật gân</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-dark-700">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-dark-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="createdAt">Ngày tạo</option>
                  <option value="updatedAt">Ngày cập nhật</option>
          
                  <option value="views">Lượt xem</option>
                  <option value="title">Tên</option>
                </select>
                
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 border border-dark-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-dark-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-dark-600 hover:text-dark-900'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-dark-600 hover:text-dark-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manga Grid */}
        <div className={viewMode === 'list' ? 'space-y-4' : ''}>
          <MangaGrid 
            endpoint={buildEndpoint()}
            showPagination={true}
            limit={24}
          />
        </div>
      </main>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowsePageContent />
    </Suspense>
  );
}
