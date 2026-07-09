import BlogCard from "./BlogCard";

export default function RelatedArticles({ articles = [] }) {
  if (!articles.length) return null;

  return (
    <section className="related-articles-section">
      <h3 className="elements-sidebar-title">Related Articles</h3>
      <div className="blog-grid" style={{ marginBottom: 0 }}>
        {articles.map((blog) => (
          <BlogCard key={blog.id || blog.slug} blog={blog} />
        ))}
      </div>
    </section>
  );
}
