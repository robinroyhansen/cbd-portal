'use client';

import { useState, useRef } from 'react';

interface AuthorImageUploadProps {
  currentImageUrl?: string;
  currentImageAlt?: string;
  authorId?: string;
  authorName: string;
  onImageUploaded: (imageUrl: string, filename: string) => void;
  onImageDeleted: () => void;
}

export default function AuthorImageUpload({
  currentImageUrl,
  currentImageAlt,
  authorId,
  authorName,
  onImageUploaded,
  onImageDeleted,
}: AuthorImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (authorId) {
        formData.append('authorId', authorId);
      }

      const response = await fetch('/api/admin/authors/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onImageUploaded(data.url, data.filename);
      setPreviewUrl(null);

    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async () => {
    if (!currentImageUrl) return;

    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setUploading(true);

      // Extract the path from the URL for deletion
      const urlParts = currentImageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const path = `authors/${filename}`;

      const response = await fetch(`/api/admin/authors/upload?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      onImageDeleted();

    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete image');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const imageToShow = previewUrl || currentImageUrl;

  return (
    <div className="space-y-4">
      {/* Current/Preview Image */}
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          {imageToShow ? (
            <div className="relative">
              <img
                src={imageToShow}
                alt={currentImageAlt || `${authorName} profile`}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {previewUrl && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="text-white text-xs">Preview</div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
              {getInitials(authorName)}
            </div>
          )}
        </div>

        <div className="flex-1">
          {currentImageUrl && !previewUrl && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Current profile image</p>
              <button
                type="button"
                onClick={deleteImage}
                disabled={uploading}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                Delete current image
              </button>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">Ready to upload</p>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel preview
              </button>
            </div>
          )}

          {!currentImageUrl && !previewUrl && (
            <p className="text-sm text-gray-500">No profile image uploaded</p>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!uploading ? triggerFileInput : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-primary-600 font-medium">Uploading image...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <p className="text-gray-600">
                <span className="font-medium text-primary-600 hover:text-primary-500">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPEG, PNG or WebP up to 5MB
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose File
            </button>
          </div>
        )}
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Square format (1:1 ratio) works best for profile photos</li>
          <li>• Minimum 200x200 pixels recommended</li>
          <li>• Professional headshot or portrait style preferred</li>
          <li>• Clear, well-lit photos with good contrast</li>
          <li>• File types: JPEG, PNG, or WebP</li>
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>
    </div>
  );
}