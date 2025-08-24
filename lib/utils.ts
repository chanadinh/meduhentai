import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fix R2 image URLs by ensuring they have the correct protocol
export function fixR2ImageUrl(url: string): string {
  if (!url) return url;
  
  // If it's already a complete URL, return as is
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  
  // If it's a relative path or non-R2 URL, return as is
  if (url.startsWith('/') && !url.includes('r2.dev')) {
    return url;
  }
  
  // If it contains r2.dev but missing protocol, add https://
  if (url.includes('r2.dev')) {
    // Remove any leading slash
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `https://${cleanUrl}`;
  }
  
  return url;
}

// Helper function to format file sizes
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to check if file size is within limits
export function isFileSizeValid(fileSize: number, maxSizeGB: number = 1): boolean {
  const maxSizeBytes = maxSizeGB * 1024 * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

// Helper function to validate file type
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}
