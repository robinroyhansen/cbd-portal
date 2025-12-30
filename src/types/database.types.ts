export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category_id?: string;
  featured_image?: string;
  author?: string;
  reading_time?: number;
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  id: string;
  article_id: string;
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  doi?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  alt_text?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  created_at: string;
  created_by?: string;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  native_name?: string;
  flag?: string;
  is_active: boolean;
  is_primary: boolean;
  rtl: boolean;
  created_at: string;
  updated_at: string;
}