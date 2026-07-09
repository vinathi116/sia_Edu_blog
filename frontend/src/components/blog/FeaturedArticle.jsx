import { Link } from "react-router-dom";
import { getBlogImageUrl, DEFAULT_BLOG_IMAGE_URL } from "../../data/courseImages";
import { isBackendMediaUrl } from "../../utils/media";

function buildSrcSet(url) {
  if (!url || url.startsWith("/images/course1/") || isBackendMediaUrl(url)) return null;
  const m = url.match(/(.+)(\.(webp|png|jpe?g))/i);
  if (!m) return null;
  const base = m[1];
  const ext = m[2];
  const sizes = [480, 800];
  return sizes.map((w) => `${base}-${w}${ext} ${w}w`).join(", ");
}

export default function FeaturedArticle({ blog }) {
  if (!blog) return null;
  const image = getBlogImageUrl(blog) || DEFAULT_BLOG_IMAGE_URL;
  const srcSet = buildSrcSet(image);

  return (
    <article className="featured-article-card medium-featured">
      <Link to={`/blog/${blog.slug}`} className="featured-image-wrapper">
        <img
          src={image}
          srcSet={srcSet}
          sizes="(max-width: 800px) 100vw, 800px"
          width={1200}
          height={675}
          alt={blog.title}
          className="featured-image"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </Link>
      <div className="featured-content">
        <div className="featured-badge-row">
          <span className="featured-badge">Featured</span>
          {blog.course && <span className="featured-course-badge">Course: {blog.course.title}</span>}
        </div>
        <h2 className="featured-title">
          <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h2>
        <p className="featured-desc">
          {blog.subtitle || blog.seo_meta?.meta_description || blog.course?.short_description}
        </p>
        <div className="author-meta-row">
          <div className="author-text">
            <span className="author-name">{blog.seo_meta?.author || "SIA Research Group"}</span>
            <span className="author-role">{blog.category || blog.course?.category_name || "Editorial"}</span>
          </div>
          <span className="meta-divider" />
          <div className="post-meta-details">
            <span>
              {blog.publish_date
                ? new Date(blog.publish_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Draft"}
            </span>
            <span className="meta-divider" />
            <span>{blog.read_time} min read</span>
          </div>
        </div>
        <div className="featured-cta-row">
          <Link to={`/blog/${blog.slug}`} className="btn btn-primary">
            Read Article
          </Link>
        </div>
      </div>
    </article>
  );
}
