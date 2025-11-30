export interface BlogPost {
    id: number | string;
    title: string;
    description: string;
    published_at: string;
    url: string;
    cover_image?: string;
    tag_list?: string[];
    reading_time_minutes?: number;
    body_markdown?: string;
    page_views_count?: number;
    type?: 'substack' | 'medium' | 'devto';
    substackEmbedUrl?: string;
  }