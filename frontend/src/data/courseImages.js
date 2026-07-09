import { resolveMediaUrl } from "../utils/media";

export const DEFAULT_COURSE_IMAGE_URL = "/course-thumbnails/advanced-quantum-computing-using-hdqs.webp";
export const DEFAULT_BLOG_IMAGE_URL = "/images/course1/hero-quantum-lab.webp";

export const COURSE_IMAGE_URLS_BY_SLUG = {
  "advanced-quantum-computing-using-hdqs": "/course-thumbnails/advanced-quantum-computing-using-hdqs.webp",
  "quantum-algorithms-and-complex-computations": "/course-thumbnails/quantum-algorithms-and-complex-computations.webp",
  "data-science": "/course-thumbnails/data-science.webp",
  "ai-and-ml": "/course-thumbnails/ai-and-ml.webp",
  "agentic-ai": "/course-thumbnails/agentic-ai.webp",
  "quantum-gates-and-circuit-design": "/course-thumbnails/quantum-gates-and-circuit-design.webp",
};

export const COURSE_HERO_IMAGE_URLS_BY_SLUG = {
  "advanced-quantum-computing-using-hdqs": "/images/course1/hero-quantum-lab.webp",
};

const COURSE_SLUGS_BY_TITLE = {
  "Advanced Quantum Computing using HDQS": "advanced-quantum-computing-using-hdqs",
  "Certificate Program in Quantum Computing": "advanced-quantum-computing-using-hdqs",
  "Quantum Algorithms and Complex Computations": "quantum-algorithms-and-complex-computations",
  "Data Science": "data-science",
  "AI & ML": "ai-and-ml",
  "Agentic AI": "agentic-ai",
  "Quantum Gates and Circuit Design": "quantum-gates-and-circuit-design",
};

function normalizeMediaUrl(value) {
  return resolveMediaUrl(value);
}

function normalizeCourseImageEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const url = normalizeMediaUrl(entry.url || entry.image || entry.src || entry.path);
  if (!url) {
    return null;
  }

  return {
    section: entry.section || entry.title || "Image",
    alt: entry.alt || entry.title || "Course image",
    caption: entry.caption || entry.description || "",
    url,
  };
}

function isGeneratedCourseImage() {
  return false;
}

function getCourseImageFallbackUrl(course) {
  const slug = course?.slug || COURSE_SLUGS_BY_TITLE[course?.title];
  return (
    COURSE_IMAGE_URLS_BY_SLUG[slug] ||
    normalizeMediaUrl(course?.featured_image) ||
    normalizeMediaUrl(course?.image) ||
    DEFAULT_COURSE_IMAGE_URL
  );
}

export function getCourseHeroImageUrl(course) {
  const slug = course?.slug || COURSE_SLUGS_BY_TITLE[course?.title];
  return COURSE_HERO_IMAGE_URLS_BY_SLUG[slug] || getCourseImageFallbackUrl(course);
}

export function getCourseSectionImages(course) {
  const rawImages = Array.isArray(course?.images) ? course.images : [];
  const normalizedImages = rawImages
    .map(normalizeCourseImageEntry)
    .filter(Boolean)
    .filter((image) => !isGeneratedCourseImage(image));

  return normalizedImages;
}

export function getCourseImageUrl(course) {
  const sectionImages = getCourseSectionImages(course);
  if (sectionImages.length > 0) {
    return sectionImages[0].url;
  }
  return getCourseImageFallbackUrl(course);
}

export function getBlogImageUrl(blog) {
  if (!blog) {
    return DEFAULT_BLOG_IMAGE_URL;
  }

  const apiImage = normalizeMediaUrl(blog?.imageUrl);
  if (apiImage) {
    return apiImage;
  }

  const bannerImage = normalizeMediaUrl(blog?.banner_image);
  if (bannerImage) {
    return bannerImage;
  }

  const thumbnail = normalizeMediaUrl(blog?.thumbnail);
  if (thumbnail) {
    return thumbnail;
  }

  return getCourseHeroImageUrl(blog?.course) || getCourseImageUrl(blog?.course) || DEFAULT_BLOG_IMAGE_URL;
}
