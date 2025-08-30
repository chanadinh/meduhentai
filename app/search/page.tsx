'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List } from 'lucide-react';
import Navigation from '@/components/Navigation';
import MangaGrid from '@/components/MangaGrid';
import toast from 'react-hot-toast';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  ButtonGroup,
  Skeleton,
  Chip
} from '@heroui/react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [status, setStatus] = useState('all');
  const [genre, setGenre] = useState('all');

  const query = searchParams.get('q') || '';
  const searchType = searchParams.get('type') || 'all';

  const buildSearchEndpoint = () => {
    const params = new URLSearchParams();
    params.set('q', query);
    if (searchType !== 'all') params.set('type', searchType);
    if (sortBy !== 'relevance') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (status !== 'all') params.set('status', status);
    if (genre !== 'all') params.set('genre', genre);
    
    return `/api/search?${params.toString()}`;
  };

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-dark-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Card className="max-w-md mx-auto">
              <CardBody className="text-center py-8">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Nhập từ khóa tìm kiếm
                </h1>
                <p className="text-gray-600">
                  Sử dụng thanh tìm kiếm ở trên để bắt đầu tìm kiếm manga
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex items-center space-x-3 mb-4">
              <Search className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">
                Kết quả tìm kiếm
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Chip color="primary" variant="flat" size="lg">
                Tìm kiếm: "{query}"
              </Chip>
              {searchType !== 'all' && (
                <Chip color="secondary" variant="flat" size="lg">
                  Trong: {searchType === 'genre' ? 'Thể loại' :
                           searchType === 'author' ? 'Tác giả' : 'Tất cả'}
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Filters and Controls */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Bộ lọc:</span>
                </div>

                {/* Status Filter */}
                <Select
                  label="Trạng thái"
                  selectedKeys={[status]}
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0] as string;
                    setStatus(selectedValue);
                  }}
                  className="w-48"
                >
                  <SelectItem key="all">Tất cả trạng thái</SelectItem>
                  <SelectItem key="ongoing">Đang tiến hành</SelectItem>
                  <SelectItem key="completed">Hoàn thành</SelectItem>
                </Select>

                {/* Genre Filter */}
                <Select
                  label="Thể loại"
                  selectedKeys={[genre]}
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0] as string;
                    setGenre(selectedValue);
                  }}
                  className="w-48"
                >
                  <SelectItem key="all">Tất cả thể loại</SelectItem>
                  <SelectItem key="action">Hành động</SelectItem>
                  <SelectItem key="adventure">Phiêu lưu</SelectItem>
                  <SelectItem key="comedy">Hài hước</SelectItem>
                  <SelectItem key="drama">Drama</SelectItem>
                  <SelectItem key="fantasy">Fantasy</SelectItem>
                  <SelectItem key="horror">Kinh dị</SelectItem>
                  <SelectItem key="mystery">Bí ẩn</SelectItem>
                  <SelectItem key="romance">Lãng mạn</SelectItem>
                  <SelectItem key="sci-fi">Khoa học viễn tưởng</SelectItem>
                  <SelectItem key="slice-of-life">Đời thường</SelectItem>
                  <SelectItem key="sports">Thể thao</SelectItem>
                  <SelectItem key="supernatural">Siêu nhiên</SelectItem>
                  <SelectItem key="thriller">Giật gân</SelectItem>
                </Select>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sắp xếp:</span>
                  <Select
                    selectedKeys={[sortBy]}
                    onSelectionChange={(keys) => {
                      const selectedValue = Array.from(keys)[0] as string;
                      setSortBy(selectedValue);
                    }}
                    className="w-40"
                  >
                    <SelectItem key="relevance">Liên quan</SelectItem>
                    <SelectItem key="createdAt">Ngày tạo</SelectItem>
                    <SelectItem key="updatedAt">Ngày cập nhật</SelectItem>
                    <SelectItem key="views">Lượt xem</SelectItem>
                    <SelectItem key="title">Tên</SelectItem>
                  </Select>

                  <Select
                    selectedKeys={[sortOrder]}
                    onSelectionChange={(keys) => {
                      const selectedValue = Array.from(keys)[0] as string;
                      setSortOrder(selectedValue);
                    }}
                    className="w-32"
                  >
                    <SelectItem key="desc">Giảm dần</SelectItem>
                    <SelectItem key="asc">Tăng dần</SelectItem>
                  </Select>
                </div>

                {/* View Mode Toggle */}
                <ButtonGroup>
                  <Button
                    isIconOnly
                    variant={viewMode === 'grid' ? 'solid' : 'light'}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    isIconOnly
                    variant={viewMode === 'list' ? 'solid' : 'light'}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Search Results */}
        <div className={viewMode === 'list' ? 'space-y-4' : ''}>
          <MangaGrid 
            endpoint={buildSearchEndpoint()}
            showPagination={true}
            limit={20}
          />
        </div>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-dark-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-6 w-64" />
          </div>

          {/* Filters Skeleton */}
          <Card>
            <CardBody>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-48" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <Card key={i}>
                <CardBody className="p-0">
                  <Skeleton className="w-full h-48 rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
