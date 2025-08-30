'use client';

import Link from 'next/link';
import { Heart, Eye, Star, BookOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { fixR2ImageUrl } from '@/lib/utils';
import { Card, CardBody, Button, Badge, Chip } from '@heroui/react';

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
    <Card as={Link} href={`/manga/${manga._id}`} className="group cursor-pointer hover:scale-105 transition-transform duration-200">
      <CardBody className="p-0">
        <div className="relative">
          <img
            src={fixR2ImageUrl(manga.coverImage)}
            alt={manga.title}
            className={`w-full ${sizeClasses[size]} object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300`}
            loading="lazy"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge
              color={manga.status === 'completed' ? 'success' : 'warning'}
              variant="flat"
              className="text-xs"
            >
              {manga.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}
            </Badge>
          </div>

          {/* Favorite Button */}
          <Button
            isIconOnly
            size="sm"
            variant="solid"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.preventDefault();
              handleFavorite(manga._id);
            }}
            aria-label="Thêm vào yêu thích"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {manga.title}
          </h3>

          <p className="text-sm text-gray-600">{manga.author || 'Chưa có tác giả'}</p>

          {showStats && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <Chip
                size="sm"
                variant="flat"
                startContent={<BookOpen className="h-3 w-3" />}
              >
                {manga.totalChapters} chương
              </Chip>
              <Chip
                size="sm"
                variant="flat"
                startContent={<Eye className="h-3 w-3" />}
              >
                {manga.views.toLocaleString()}
              </Chip>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
