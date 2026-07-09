import { Link } from "react-router-dom";
import { getBlogImageUrl, DEFAULT_BLOG_IMAGE_URL } from "../../data/courseImages";
import { isBackendMediaUrl } from "../../utils/media";

export default function BlogCard({ blog }) {
  const fallbackImage = DEFAULT_BLOG_IMAGE_URL;
  const image = getBlogImageUrl(blog) || fallbackImage;
  const published = blog.publish_date
    ? new Date(blog.publish_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  const srcSet = image.startsWith("/images/course1/") || isBackendMediaUrl(image)
    ? undefined
    : `${image.replace(/(\.[^.]+)$/, "-480$1")} 480w, ${image.replace(/(\.[^.]+)$/, "-800$1")} 800w`;

  return (
    <article className="blog-card medium-blog-card blog-card-hover">
      <Link to={`/blog/${blog.slug}`} className="blog-card-image-wrap" aria-label={blog.title}>
        <img
          src={image}
          alt={blog.title}
          className="blog-card-image"
          loading="lazy"
          decoding="async"
          {...(srcSet ? { srcSet, sizes: "(max-width: 600px) 100vw, 400px" } : {})}
          width={400}
          height={225}
        />
      </Link>
      <div className="blog-card-content">
        <div className="blog-card-tags">
          <span className="pill-badge">{blog.category || blog.course?.category_name || "Editorial"}</span>
        </div>
        <h3 className="blog-card-title">
          <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h3>
        <p className="blog-card-excerpt">
          {blog.subtitle || blog.seo_meta?.meta_description || blog.course?.short_description}
        </p>
        {blog.course && (
          <div className="blog-card-course-info">
            <Link to={`/course/${blog.course.id}`} className="blog-card-course-link">
              Course: {blog.course.title}
            </Link>
          </div>
        )}
        <div className="blog-card-footer">
          <div className="post-meta-details">
            <span className="author-byline">{blog.seo_meta?.author || "SIA Editorial"}</span>
            <span className="meta-divider" />
            <span>{published}</span>
            <span className="meta-divider" />
            <span>{blog.read_time} min read</span>
          </div>
        </div>
      </div>
    </article>
  );
}
