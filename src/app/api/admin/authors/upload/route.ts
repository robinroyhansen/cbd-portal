import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const authorId = formData.get('authorId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
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

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const timestamp = Date.now();
    const fileName = authorId
      ? `${authorId}-${timestamp}.${fileExt}`
      : `temp-${timestamp}.${fileExt}`;
    const filePath = `authors/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

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
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
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