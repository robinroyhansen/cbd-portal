export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      authors: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          name: string;
          title: string | null;
          email: string | null;
          bio_short: string | null;
          bio_full: string | null;
          credentials: string[];
          expertise_areas: string[];
          years_experience: number;
          location: string | null;
          image_url: string | null;
          image_alt: string | null;
          social_links: Json;
          meta_title: string | null;
          meta_description: string | null;
          is_primary: boolean;
          is_verified: boolean;
          is_active: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          slug: string;
          name: string;
          title?: string | null;
          email?: string | null;
          bio_short?: string | null;
          bio_full?: string | null;
          credentials?: string[];
          expertise_areas?: string[];
          years_experience?: number;
          location?: string | null;
          image_url?: string | null;
          image_alt?: string | null;
          social_links?: Json;
          meta_title?: string | null;
          meta_description?: string | null;
          is_primary?: boolean;
          is_verified?: boolean;
          is_active?: boolean;
          display_order?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          slug?: string;
          name?: string;
          title?: string | null;
          email?: string | null;
          bio_short?: string | null;
          bio_full?: string | null;
          credentials?: string[];
          expertise_areas?: string[];
          years_experience?: number;
          location?: string | null;
          image_url?: string | null;
          image_alt?: string | null;
          social_links?: Json;
          meta_title?: string | null;
          meta_description?: string | null;
          is_primary?: boolean;
          is_verified?: boolean;
          is_active?: boolean;
          display_order?: number;
        };
      };
      kb_articles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          featured_image: string | null;
          status: 'draft' | 'pending_review' | 'published';
          featured: boolean;
          category_id: string | null;
          author_id: string | null;
          published_at: string | null;
          reading_time: number | null;
          meta_title: string | null;
          meta_description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          featured_image?: string | null;
          status?: 'draft' | 'pending_review' | 'published';
          featured?: boolean;
          category_id?: string | null;
          author_id?: string | null;
          published_at?: string | null;
          reading_time?: number | null;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          status?: 'draft' | 'pending_review' | 'published';
          featured?: boolean;
          category_id?: string | null;
          author_id?: string | null;
          published_at?: string | null;
          reading_time?: number | null;
          meta_title?: string | null;
          meta_description?: string | null;
        };
      };
      kb_categories: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          slug: string;
          description: string | null;
          article_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          slug: string;
          description?: string | null;
          article_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          article_count?: number;
        };
      };
      kb_citations: {
        Row: {
          id: string;
          created_at: string;
          article_id: string;
          title: string;
          authors: string | null;
          publication: string | null;
          year: number | null;
          url: string | null;
          doi: string | null;
          accessed_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          article_id: string;
          title: string;
          authors?: string | null;
          publication?: string | null;
          year?: number | null;
          url?: string | null;
          doi?: string | null;
          accessed_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          article_id?: string;
          title?: string;
          authors?: string | null;
          publication?: string | null;
          year?: number | null;
          url?: string | null;
          doi?: string | null;
          accessed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      article_status: 'draft' | 'pending_review' | 'published';
    };
  };
}
