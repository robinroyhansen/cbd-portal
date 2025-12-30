'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    const { data } = await supabase
      .from('kb_media')
      .select('*')
      .order('created_at', { ascending: false });

    setMedia(data || []);
    setLoading(false);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase.from('kb_media').insert({
        filename: file.name,
        url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        alt_text: '',
      });

      if (dbError) throw dbError;

      fetchMedia();
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // Extract path from URL
      const urlParts = url.split('/');
      const filePath = `uploads/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      await supabase.storage.from('media').remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('kb_media')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchMedia();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        uploadFile(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {uploading ? '📤 Uploading...' : '📤 Upload Image'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && media.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No images uploaded yet</p>
        </div>
      )}

      {!loading && media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow overflow-hidden group cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
              <div className="aspect-square relative">
                <img
                  src={item.url}
                  alt={item.alt_text || item.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-sm">Click to view</span>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate">{item.filename}</p>
                <p className="text-xs text-gray-400">
                  {(item.file_size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Image Details</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <img
                src={selectedImage.url}
                alt={selectedImage.alt_text || selectedImage.filename}
                className="max-w-full mb-4"
              />

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Filename:</span> {selectedImage.filename}
                </div>
                <div>
                  <span className="font-medium">Size:</span>{' '}
                  {(selectedImage.file_size / 1024).toFixed(1)} KB
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedImage.mime_type}
                </div>
                {selectedImage.width && selectedImage.height && (
                  <div>
                    <span className="font-medium">Dimensions:</span>{' '}
                    {selectedImage.width} × {selectedImage.height}px
                  </div>
                )}
                <div>
                  <span className="font-medium">URL:</span>
                  <input
                    type="text"
                    value={selectedImage.url}
                    readOnly
                    className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    copyToClipboard(selectedImage.url);
                    setSelectedImage(null);
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => {
                    deleteMedia(selectedImage.id, selectedImage.url);
                    setSelectedImage(null);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}