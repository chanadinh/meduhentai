'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Tag {
  _id: string;
  name: string;
  description: string;
  count: number;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch tags
      // For now, using mock data
      const mockTags: Tag[] = [
        { _id: '1', name: 'Action', description: 'Action-packed manga', count: 25 },
        { _id: '2', name: 'Romance', description: 'Romantic stories', count: 18 },
        { _id: '3', name: 'Fantasy', description: 'Fantasy worlds', count: 22 },
        { _id: '4', name: 'Comedy', description: 'Funny manga', count: 15 }
      ];
      setTags(mockTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.name.trim()) return;

    try {
      // TODO: Implement API call to add tag
      const tag: Tag = {
        _id: Date.now().toString(),
        name: newTag.name,
        description: newTag.description,
        count: 0
      };
      setTags([...tags, tag]);
      setNewTag({ name: '', description: '' });
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      // TODO: Implement API call to delete tag
      setTags(tags.filter(tag => tag._id !== tagId));
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tags & Genres Management</h1>
          <p className="text-gray-600">Manage manga tags and genres</p>
        </div>

        {/* Add New Tag */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Tag</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag Name
              </label>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Action"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddTag}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Tags List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Existing Tags</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading tags...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tag Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tags.map((tag) => (
                    <tr key={tag._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{tag.description}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{tag.count}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteTag(tag._id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
