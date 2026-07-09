import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/ArticleContent";
import { ArticleFooter } from "@/components/ArticleFooter";
import { CourseLayout } from "@/components/CourseLayout";
import { getPublishedCourseBySlug } from "@/lib/supabase";
import { mergeToc } from "@/lib/markdown";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);
  if (!course) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  return {
    title: course.seo_title || course.title,
    description: course.seo_description || course.description,
    keywords: course.seo_keywords,
    alternates: {
      canonical: siteUrl ? `${siteUrl}/courses/${course.slug}` : `/courses/${course.slug}`
    },
    openGraph: {
      title: course.seo_title || course.title,
      description: course.seo_description || course.description,
      type: "article",
      images: course.course_image ? [course.course_image] : []
    }
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);
  if (!course) notFound();

  const toc = mergeToc(course.table_of_contents, course.markdown_content);

  return (
    <CourseLayout course={course} toc={toc}>
      <div className="min-w-0 rounded-lg border border-[#dbe5df] bg-white px-5 py-3 sm:px-8 lg:px-10">
        <ArticleContent markdown={course.markdown_content} />
        <ArticleFooter />
      </div>
    </CourseLayout>
  );
}
