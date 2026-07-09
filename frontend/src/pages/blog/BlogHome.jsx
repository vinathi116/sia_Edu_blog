import { useEffect, useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import PageTransition from "../../components/PageTransition";
import BlogCard from "../../components/blog/BlogCard";
import FeaturedArticle from "../../components/blog/FeaturedArticle";
import ArticleFilters from "../../components/blog/ArticleFilters";
import Pagination from "../../components/Pagination";
import { blogService, unwrapList } from "../../services/blogService";

const PAGE_SIZE = 12;

export default function BlogHome() {
  const [blogs, setBlogs] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [courseId, setCourseId] = useState("");
  const [ordering, setOrdering] = useState("-publish_date");

  // Dynamic filter options from backend
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [courses, setCourses] = useState([]);

  // Fetch filter metadata on mount
  useEffect(() => {
    blogService.getCategories().then((res) => setCategories(unwrapList(res.data))).catch(() => {});
    blogService.getTags().then((res) => setTags(unwrapList(res.data))).catch(() => {});
    blogService.getCourses().then((res) => setCourses(unwrapList(res.data))).catch(() => {});
  }, []);

  // Fetch featured article on mount/filter reset
  useEffect(() => {
    // 1. Try to fetch marked featured article
    blogService
      .getBlogs({ is_featured: "true", page_size: 1 })
      .then((res) => {
        const list = unwrapList(res.data);
        if (list.length > 0) {
          setFeaturedArticle(list[0]);
        } else {
          // 2. Fallback: get the newest article
          blogService
            .getBlogs({ ordering: "-publish_date", page_size: 1 })
            .then((fallbackRes) => {
              const fallbackList = unwrapList(fallbackRes.data);
              if (fallbackList.length > 0) {
                setFeaturedArticle(fallbackList[0]);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [category, search, tag, courseId]);

  // Main Articles Fetching
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    const params = {
      search: search || undefined,
      category: category || undefined,
      tag: tag || undefined,
      course: courseId || undefined,
      ordering: ordering || undefined,
      page,
      page_size: PAGE_SIZE,
    };

    blogService
      .getBlogs(params)
      .then((res) => {
        if (!ignore) {
          setBlogs(unwrapList(res.data));
          setCount(res.data.count || 0);
        }
      })
      .catch((err) => {
        if (!ignore) {
          if (!err.response) {
            setError({
              title: "Connection Offline",
              message: "Cannot connect to the server. Please check your network.",
            });
          } else {
            setError({
              title: "Failed to Load Articles",
              message: "We encountered an issue fetching the articles database. Please try again.",
            });
          }
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [search, category, tag, courseId, ordering, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, tag, courseId, ordering]);

  // Determine if filters are active
  const isFiltering = useMemo(() => {
    return !!(search || category || tag || courseId || ordering !== "-publish_date");
  }, [search, category, tag, courseId, ordering]);

  // Filter out featured article from grid only if not searching/filtering
  const displayBlogs = useMemo(() => {
    if (isFiltering || !featuredArticle) return blogs;
    return blogs.filter((blog) => blog.id !== featuredArticle.id);
  }, [blogs, featuredArticle, isFiltering]);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setTag("");
    setCourseId("");
    setOrdering("-publish_date");
    setPage(1);
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="blog-shell">
          {/* Hero Banner */}
          <header className="blog-hero medium-hero">
            <span className="blog-kicker">SIA Knowledge Base</span>
            <h1>SIA Articles & Educational Notes</h1>
            <p>
              Explore highly specialized learning logs, advanced guides, and technical concepts connected to your courses and paths.
            </p>
          </header>

          {/* Search & Filters */}
          <ArticleFilters
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            tag={tag}
            setTag={setTag}
            courseId={courseId}
            setCourseId={setCourseId}
            ordering={ordering}
            setOrdering={setOrdering}
            categories={categories}
            tags={tags}
            courses={courses}
            onClearAll={handleClearFilters}
          />

          {/* Loading state */}
          {loading && (
            <div className="loading-state">
              <div>
                <h3>Accessing knowledge base...</h3>
                <p>Retrieving catalog items.</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="empty-state">
              <div>
                <h3>{error.title}</h3>
                <p>{error.message}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPage(1)}
                  style={{ marginTop: "1.5rem" }}
                >
                  Retry Load
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && displayBlogs.length === 0 && (
            <div className="empty-state">
              <div>
                <h3>No articles found</h3>
                <p>Try refining your search queries or clearing active filters.</p>
                <button
                  type="button"
                  className="btn btn-muted"
                  onClick={handleClearFilters}
                  style={{ marginTop: "1rem" }}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Content sections */}
          {!loading && !error && (
            <>
              {/* Featured Article Section (Only if NOT filtering/searching) */}
              {!isFiltering && featuredArticle && page === 1 && (
                <section className="blog-section featured-section-layout">
                  <div className="blog-section-header">
                    <div>
                      <h2>Featured Reading</h2>
                      <p>Hand-picked guide from the SIA editorial team.</p>
                    </div>
                  </div>
                  <FeaturedArticle blog={featuredArticle} />
                </section>
              )}

              {/* All Articles Section */}
              {displayBlogs.length > 0 && (
                <section className="blog-section">
                  <div className="blog-section-header">
                    <div>
                      <h2>{isFiltering ? "Search Results" : "All Articles"}</h2>
                      <p>
                        Showing {displayBlogs.length} of {count} articles matching criteria.
                      </p>
                    </div>
                  </div>

                  <div className="blog-grid">
                    {displayBlogs.map((blog) => (
                      <BlogCard key={blog.id || blog.slug} blog={blog} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <Pagination
                    count={count}
                    currentPage={page}
                    pageSize={PAGE_SIZE}
                    onPageChange={(newPage) => {
                      setPage(newPage);
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                  />
                </section>
              )}
            </>
          )}
        </div>
      </PageTransition>
    </MainLayout>
  );
}
