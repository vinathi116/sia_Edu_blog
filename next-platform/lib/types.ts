export type TocItem = {
  level: number;
  title: string;
  anchor: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  markdown_content: string;
  course_image: string;
  table_of_contents: TocItem[];
  publish_date: string | null;
  author: string;
  category: string;
  tags: string[];
  reading_time: number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  canonical_url: string;
  status: "draft" | "published" | "unpublished" | "archived";
  created_at: string;
  updated_at: string;
};
