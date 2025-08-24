'use client';

import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatFileSize, isFileSizeValid, isValidImageFile } from '@/lib/utils';

export default function DirectUploadPage() {
  const [mangaFiles, setMangaFiles] = useState<File[]>([]);
  const [chapterFiles, setChapterFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    manga: PutBlobResult[];
    chapters: PutBlobResult[];
  }>({ manga: [], chapters: [] });

  const handleMangaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        if (!isValidImageFile(file)) {
          alert(`File ${file.name} không phải là hình ảnh hợp lệ`);
          return false;
        }
        if (!isFileSizeValid(file.size)) {
          alert(`File ${file.name} quá lớn. Kích thước tối đa là 1GB`);
          return false;
        }
        return true;
      });
      setMangaFiles(validFiles);
    }
  };

  const handleChapterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        if (!isValidImageFile(file)) {
          alert(`File ${file.name} không phải là hình ảnh hợp lệ`);
          return false;
        }
        if (!isFileSizeValid(file.size)) {
          alert(`File ${file.name} quá lớn. Kích thước tối đa là 1GB`);
          return false;
        }
        return true;
      });
      setChapterFiles(validFiles);
    }
  };

  const uploadFiles = async (files: File[], type: 'manga' | 'chapters') => {
    setUploading(true);
    const results: PutBlobResult[] = [];

    try {
      for (const file of files) {
        const newBlob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: `/api/upload/direct/${type}`,
        });
        results.push(newBlob);
      }

      setUploadResults(prev => ({
        ...prev,
        [type]: results
      }));

      // Clear files after successful upload
      if (type === 'manga') {
        setMangaFiles([]);
      } else {
        setChapterFiles([]);
      }

    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Failed to upload ${type} files`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Direct Upload to Blob Storage</h1>
          <p className="text-gray-600">
            Upload large files directly to Vercel Blob storage, bypassing server limits.
            Supports files up to 1GB.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manga Upload Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Manga Files</h2>
            <div className="space-y-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMangaFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="text-sm text-gray-500">
                Selected: {mangaFiles.length} file(s)
                {mangaFiles.length > 0 && (
                  <div className="mt-2">
                    {mangaFiles.map((file, index) => (
                      <div key={index} className="text-xs">
                        {file.name} ({formatFileSize(file.size)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => uploadFiles(mangaFiles, 'manga')}
                disabled={mangaFiles.length === 0 || uploading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Manga Files'}
              </button>
            </div>
          </div>

          {/* Chapter Upload Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Chapter Files</h2>
            <div className="space-y-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleChapterFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="text-sm text-gray-500">
                Selected: {chapterFiles.length} file(s)
                {chapterFiles.length > 0 && (
                  <div className="mt-2">
                    {chapterFiles.map((file, index) => (
                      <div key={index} className="text-xs">
                        {file.name} ({formatFileSize(file.size)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => uploadFiles(chapterFiles, 'chapters')}
                disabled={chapterFiles.length === 0 || uploading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Chapter Files'}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Results */}
        {(uploadResults.manga.length > 0 || uploadResults.chapters.length > 0) && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Results</h2>
            
            {uploadResults.manga.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Manga Files:</h3>
                <div className="space-y-2">
                  {uploadResults.manga.map((blob, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">File {index + 1}:</span>{' '}
                      <a 
                        href={blob.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 break-all"
                      >
                        {blob.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadResults.chapters.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Chapter Files:</h3>
                <div className="space-y-2">
                  {uploadResults.chapters.map((blob, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">File {index + 1}:</span>{' '}
                      <a 
                        href={blob.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 break-all"
                      >
                        {blob.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
