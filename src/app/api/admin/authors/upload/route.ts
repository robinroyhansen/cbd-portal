import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

// Magic bytes for file type verification
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP starts with RIFF)
};

function verifyFileSignature(buffer: Uint8Array, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) return false;

  return signatures.some(sig =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

// Validate path pattern to prevent path traversal
const ALLOWED_PATH_PATTERN = /^authors\/[a-zA-Z0-9_-]+-\d+\.(jpg|jpeg|png|webp)$/;

export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const authorId = formData.get('authorId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (MIME type from client - will verify with magic bytes)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB.'
      }, { status: 400 });
    }

    // Convert file to buffer for verification
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Verify file content matches claimed MIME type (prevent spoofing)
    const normalizedMime = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
    if (!verifyFileSignature(buffer, normalizedMime)) {
      return NextResponse.json({
        error: 'File content does not match file type. Please upload a valid image.'
      }, { status: 400 });
    }

    // Sanitize authorId to prevent injection
    const sanitizedAuthorId = authorId?.replace(/[^a-zA-Z0-9_-]/g, '') || 'temp';

    // Generate safe filename
    const fileExt = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z]/g, '') || 'jpg';
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowedExts.includes(fileExt)) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 });
    }

    const timestamp = Date.now();
    const fileName = `${sanitizedAuthorId}-${timestamp}.${fileExt}`;
    const filePath = `authors/${fileName}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    // Update author with new image URL if authorId provided
    if (authorId && authorId !== 'temp') {
      const { error: updateError } = await supabase
        .from('kb_authors')
        .update({
          image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', authorId);

      if (updateError) {
        console.error('Error updating author image URL:', updateError);
        // Don't fail the upload if database update fails
        // The frontend can handle this case
      }
    }

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      filename: fileName
    });

  } catch (error) {
    console.error('Error uploading image:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('bucketId')) {
        return NextResponse.json({
          error: 'Storage bucket not configured. Please contact administrator.'
        }, { status: 500 });
      }
      if (error.message.includes('policy')) {
        return NextResponse.json({
          error: 'Upload permissions not configured. Please contact administrator.'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Failed to upload image. Please try again.'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Validate path to prevent path traversal attacks
    // Only allow deletion of files in authors/ directory with expected filename format
    if (!ALLOWED_PATH_PATTERN.test(filePath)) {
      return NextResponse.json({
        error: 'Invalid file path. Path traversal not allowed.'
      }, { status: 400 });
    }

    // Double-check: path should not contain ../ or start with /
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return NextResponse.json({
        error: 'Invalid file path format'
      }, { status: 400 });
    }

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}