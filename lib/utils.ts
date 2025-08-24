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
