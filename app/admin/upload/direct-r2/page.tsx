'use client';

import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatFileSize, isFileSizeValid, isValidImageFile } from '@/lib/utils';

interface UploadResult {
  key: string;
  url: string;
  filename: string;
  size: number;
  uploadedAt: number;
}

export default function DirectR2UploadPage() {
  const [mangaFiles, setMangaFiles] = useState<File[]>([]);
  const [chapterFiles, setChapterFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    manga: UploadResult[];
    chapters: UploadResult[];
  }>({ manga: [], chapters: [] });
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

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

  const uploadFileToR2 = async (file: File, folder: string): Promise<UploadResult> => {
    // Step 1: Get presigned URL from server
    const presignedResponse = await fetch('/api/upload/direct-r2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        folder,
        fileSize: file.size,
      }),
    });

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json();
      throw new Error(errorData.error || 'Failed to get upload URL');
    }

    const { presignedUrl, key, bucket } = await presignedResponse.json();

    // Step 2: Upload file directly to R2 using presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    // Step 3: Construct the public URL
    const publicUrl = `https://${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || 'your-r2-domain.com'}/${key}`;

    return {
      key,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      uploadedAt: Date.now(),
    };
  };

  const uploadFiles = async (files: File[], type: 'manga' | 'chapters') => {
    setUploading(true);
    const results: UploadResult[] = [];
    const folder = type === 'manga' ? 'manga' : 'chapters';

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${type}_${i}`;
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        try {
          const result = await uploadFileToR2(file, folder);
          results.push(result);
          
          // Update progress to 100%
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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

      // Clear progress
      setUploadProgress({});

    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Failed to upload ${type} files`);
    } finally {
      setUploading(false);
    }
  };

  const getProgressBarColor = (progress: number) => {
    if (progress < 50) return 'bg-red-500';
    if (progress < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Direct Upload to R2 Storage</h1>
          <p className="text-gray-600">
            Upload large files directly to Cloudflare R2 storage using presigned URLs.
            Supports files up to 1GB with no server processing limits.
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
                  <div className="mt-2 space-y-1">
                    {mangaFiles.map((file, index) => (
                      <div key={index} className="text-xs">
                        <div className="flex justify-between items-center">
                          <span>{file.name}</span>
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                        {uploadProgress[`manga_${index}`] !== undefined && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(uploadProgress[`manga_${index}`])}`}
                              style={{ width: `${uploadProgress[`manga_${index}`]}%` }}
                            ></div>
                          </div>
                        )}
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
                  <div className="mt-2 space-y-1">
                    {chapterFiles.map((file, index) => (
                      <div key={index} className="text-xs">
                        <div className="flex justify-between items-center">
                          <span>{file.name}</span>
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                        {uploadProgress[`chapters_${index}`] !== undefined && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(uploadProgress[`chapters_${index}`])}`}
                              style={{ width: `${uploadProgress[`chapters_${index}`]}%` }}
                            ></div>
                          </div>
                        )}
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
                  {uploadResults.manga.map((result, index) => (
                    <div key={index} className="text-sm p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{result.filename}</div>
                          <div className="text-gray-600 text-xs">
                            Size: {formatFileSize(result.size)} | 
                            Key: {result.key}
                          </div>
                        </div>
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 text-xs ml-2"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadResults.chapters.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Chapter Files:</h3>
                <div className="space-y-2">
                  {uploadResults.chapters.map((result, index) => (
                    <div key={index} className="text-sm p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{result.filename}</div>
                          <div className="text-gray-600 text-xs">
                            Size: {formatFileSize(result.size)} | 
                            Key: {result.key}
                          </div>
                        </div>
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 text-xs ml-2"
                        >
                          View
                        </a>
                      </div>
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
