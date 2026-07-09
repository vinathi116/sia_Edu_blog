import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineClipboardDocument,
  HiOutlineShare,
} from "react-icons/hi2";

import PageTransition from "../../components/PageTransition";
import CourseCard from "../../components/CourseCard";
import MainLayout from "../../layouts/MainLayout";
import { API_BASE_URL } from "../../services/api";
import { blogService } from "../../services/blogService";
import { parseMarkdown } from "../../utils/markdown";
import { resolveMediaUrl } from "../../utils/media";
import { DEFAULT_BLOG_IMAGE_URL, getBlogImageUrl } from "../../data/courseImages";

const ComponentRegistry = {
  tip: (props) => <Callout type="tip" {...props} />,
  warning: (props) => <Callout type="warning" {...props} />,
  note: (props) => <Callout type="note" {...props} />,
  timeline: Timeline,
  proscons: ProsCons,
  checklist: Checklist,
  diagram: CSSDiagram,
  comparison: ComparisonTable,
  statistic: StatisticCard,
  "course-cta": CourseCTA,
  newsletter: NewsletterCTA,
};

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const [showMobileTOC, setShowMobileTOC] = useState(false);
  const progress = useReadingProgress();

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    blogService
      .getBlog(id)
      .then((response) => {
        if (!ignore) setBlog(response.data);
      })
      .catch(() => {
        if (!ignore) setError("Article not found or not published yet.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      ignore = true;
    };
  }, [id]);

  const blocks = useMemo(() => parseMarkdown(blog?.content || ""), [blog?.content]);
  const sectionImagesByPlacement = useMemo(() => groupSectionImages(blog?.section_images || []), [blog?.section_images]);
  const renderedBlocks = useMemo(() => injectSectionImages(blocks, sectionImagesByPlacement), [blocks, sectionImagesByPlacement]);
  const headings = useMemo(
    () =>
      blocks
        .filter((block) => block.type === "heading" && block.level <= 2)
        .map((block, index) => ({ id: `section-${index}`, text: stripHtml(block.text), level: block.level })),
    [blocks],
  );
  const heroImage = getBlogImageUrl(blog) || DEFAULT_BLOG_IMAGE_URL;

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveHeadingId(visible[visible.length - 1].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    if (!blog) return;
    const title = blog.seo_meta?.seo_title || blog.seo_meta?.title || blog.title;
    const description =
      blog.seo_meta?.meta_description || blog.seo_meta?.description || blog.subtitle || blog.course?.short_description || "";
    document.title = `${title} | SIA Education`;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:image", blog.banner_image || blog.thumbnail || heroImage, "property");
  }, [blog, heroImage]);

  const handleShare = async () => {
    const payload = { title: blog.title, text: blog.subtitle, url: window.location.href };
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
  };

  if (loading) {
    return (
      <MainLayout>
        <PageTransition>
          <p className="empty-state blog-empty-state">Loading article...</p>
        </PageTransition>
      </MainLayout>
    );
  }

  if (error || !blog) {
    return (
      <MainLayout>
        <PageTransition>
          <div className="not-found">
            <h2>Article Not Found</h2>
            <p className="empty-state">{error}</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate("/blog")}>
              Back to Blog
            </button>
          </div>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="reading-progress" style={{ "--progress": `${progress}%` }} aria-hidden="true" />
        <BlogSchema blog={blog} />

        <article className="blog-article-shell">
          <nav className="blog-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/blog">Blog</Link>
            <span>/</span>
            <span>{blog.title}</span>
          </nav>

          <header className="blog-article-hero">
            <div className="blog-article-hero-copy">
              <span className="hero-badge">{blog.category || blog.course?.category_name}</span>
              <h1 className="hero-title">{blog.title}</h1>
              <p className="hero-subtitle">{blog.subtitle || blog.course?.short_description}</p>
              <div className="premium-hero-meta">
                <div className="author-profile">
                  <div className="author-text">
                    <span className="author-name">{blog.seo_meta?.author || "SIA Research Group"}</span>
                    <span className="author-label">Editorial Team</span>
                  </div>
                </div>
                <span className="meta-dot">•</span>
                <span>
                  Published:{" "}
                  {blog.publish_date
                    ? new Date(blog.publish_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "Draft"}
                </span>
                {blog.seo_meta?.last_updated ? (
                  <>
                    <span className="meta-dot">•</span>
                    <span>Updated: {new Date(blog.seo_meta.last_updated).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                  </>
                ) : null}
                <span className="meta-dot">•</span>
                <span>{blog.read_time} min read</span>
                <button type="button" className="btn btn-muted btn-icon share-btn" onClick={handleShare}>
                  <HiOutlineShare />
                  Share
                </button>
              </div>
            </div>
            <div className="hero-image-wrap">
              <img src={resolveMediaUrl(heroImage)} alt={blog.title} className="hero-image" loading="eager" decoding="async" fetchPriority="high" />
            </div>
          </header>

          <div className="blog-article-layout">
            <BlogSidebar
              headings={headings}
              activeHeadingId={activeHeadingId}
              showMobileTOC={showMobileTOC}
              setShowMobileTOC={setShowMobileTOC}
              blog={blog}
            />

            <main className="blog-article-content">
              <MarkdownBlocks blocks={renderedBlocks} headings={headings} course={blog.course} navigate={navigate} />

              {blog.course ? <CourseCTA course={blog.course} navigate={navigate} /> : null}

              <nav className="blog-prev-next" aria-label="Article navigation">
                {blog.previous ? <AdjacentLink label="Previous" blog={blog.previous} icon={<HiOutlineArrowLeft />} /> : <span />}
                {blog.next ? <AdjacentLink label="Next" blog={blog.next} icon={<HiOutlineArrowRight />} next /> : <span />}
              </nav>
            </main>
          </div>
        </article>
      </PageTransition>
    </MainLayout>
  );
}

function BlogSidebar({ headings, activeHeadingId, showMobileTOC, setShowMobileTOC, blog }) {
  return (
    <>
      <aside className="blog-sidebar" aria-label="Article navigation">
        {headings.length ? (
          <section className="blog-sidebar-card">
            <strong>Contents</strong>
            <div className="blog-sidebar-links">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`${heading.level === 2 ? "toc-indent" : ""} ${activeHeadingId === heading.id ? "active" : ""}`}
                >
                  {heading.text}
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {blog.series_navigation && (
          <section className="blog-sidebar-card series-navigator">
            <div className="series-navigator-header">
              <span className="series-kicker">Series Progress</span>
              <strong className="series-title">{blog.series_navigation.series_name}</strong>
            </div>
            <div className="series-steps">
              {blog.series_navigation.articles.map((article) => {
                let marker = "□";
                let className = "series-step-upcoming";
                if (article.is_current) {
                  marker = "▶";
                  className = "series-step-current";
                } else if (article.completed) {
                  marker = "✓";
                  className = "series-step-completed";
                }
                return (
                  <div key={article.slug} className={`series-step ${className}`}>
                    <span className="series-step-marker">{marker}</span>
                    {article.is_current ? (
                      <span className="series-step-text">{article.title}</span>
                    ) : (
                      <Link to={`/blog/${article.slug}`} className="series-step-link">
                        {article.title}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </aside>

      {headings.length ? (
        <div className="mobile-toc-container">
          <button type="button" className="mobile-toc-trigger" onClick={() => setShowMobileTOC(true)} aria-label="Open contents navigation">
            ☰
          </button>
          {showMobileTOC ? (
            <div className="mobile-toc-sheet">
              <h4>
                <span>Contents</span>
                <button type="button" className="mobile-toc-sheet-close" onClick={() => setShowMobileTOC(false)}>
                  Close
                </button>
              </h4>
              <div className="mobile-toc-links">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={activeHeadingId === heading.id ? "active" : ""}
                    onClick={() => setShowMobileTOC(false)}
                  >
                    {heading.text}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function ComponentBlock({ type, params, content, course, navigate }) {
  const RenderComponent = ComponentRegistry[type];
  if (!RenderComponent) return null;
  return <RenderComponent params={params} content={content} course={course} navigate={navigate} />;
}

function Callout({ type, content }) {
  return (
    <div className={`callout-card callout-${type}`}>
      <span className="callout-badge">{type}</span>
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

function Timeline({ content }) {
  const steps = content.split("\n").filter(Boolean);
  return (
    <div className="timeline-block">
      {steps.map((step, idx) => {
        const parts = step.split("->");
        const title = parts[0]?.trim() || "";
        const desc = parts[1]?.trim() || "";
        return (
          <div key={idx} className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-number">{idx + 1}</span>
            </div>
            <div className="timeline-content">
              <h4>{title}</h4>
              {desc ? <p>{desc}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProsCons({ content }) {
  const lines = content.split("\n").filter(Boolean);
  const pros = lines.filter((line) => line.trim().startsWith("+")).map((line) => line.trim().substring(1).trim());
  const cons = lines.filter((line) => line.trim().startsWith("-")).map((line) => line.trim().substring(1).trim());

  return (
    <div className="pros-cons-grid">
      <div className="pros-column">
        <h4>Pros</h4>
        <ul>
          {pros.map((item, idx) => (
            <li key={idx}>✓ {item}</li>
          ))}
        </ul>
      </div>
      <div className="cons-column">
        <h4>Cons</h4>
        <ul>
          {cons.map((item, idx) => (
            <li key={idx}>✕ {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Checklist({ content }) {
  const items = content
    .split("\n")
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, "").trim());
  return (
    <ul className="premium-checklist">
      {items.map((item, idx) => (
        <li key={idx}>
          <span className="check-icon">✓</span>
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  );
}

function StatisticCard({ params, content }) {
  return (
    <div className="statistic-card">
      <strong className="stat-number">{params}</strong>
      <p className="stat-label" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

function CSSDiagram({ params, content }) {
  const nodes = content.split("->").map((node) => node.trim());
  return (
    <div className="diagram-block">
      <div className="diagram-header">
        <span>{params ? params.toUpperCase() : "FLOW"} DIAGRAM</span>
      </div>
      <div className="diagram-flow">
        {nodes.map((node, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center" }}>
            {idx > 0 ? <span className="flow-arrow">→</span> : null}
            <div className="diagram-node">
              <span>{node}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonTable({ content }) {
  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const headers = lines[0].split("|").map((header) => header.trim()).filter(Boolean);
  const rows = lines.slice(2).map((row) => row.split("|").map((cell) => cell.trim()).filter(Boolean));

  return (
    <div className="markdown-table-wrap">
      <table className="comparison-table">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className={cell === "✓" ? "check-cell" : cell === "✕" ? "cross-cell" : ""}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CourseCTA({ course, navigate }) {
  if (!course) return null;
  return (
    <section className="related-course-cta">
      <div className="cta-content">
        <h2>Ready to Build Real Projects?</h2>
        <p>
          Master this subject through structured lessons, industry projects, mentorship, and portfolio-ready assignments with the <strong>{course.title}</strong>.
        </p>
      </div>
      <CourseCard
        course={course}
        hidePrice={true}
        ctaText="Explore Course"
        onOpen={() => navigate(`/course/${course.id}`)}
        onBuy={() => navigate(`/course/${course.id}`)}
      />
    </section>
  );
}

function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="newsletter-box">
      <div className="newsletter-text">
        <h3>Enjoyed this article?</h3>
        <p>Subscribe to receive new AI, ML, Data Science and Quantum Computing articles direct to your inbox.</p>
      </div>
      {subscribed ? (
        <p className="subscription-success">✓ Thank you for subscribing!</p>
      ) : (
        <form className="newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
            aria-label="Email address"
          />
          <button type="submit" className="btn btn-primary">
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <pre style={{ position: "relative" }}>
      <div className="code-block-header">
        <span>{language.toUpperCase()}</span>
        <button type="button" className="code-copy-btn" onClick={handleCopy} aria-label="Copy code block">
          {copied ? "Copied!" : <HiOutlineClipboardDocument />}
        </button>
      </div>
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
}

function MarkdownBlocks({ blocks, headings, course, navigate }) {
  let headingIndex = 0;
  return (
    <div className="markdown-content blog-content content">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const id = block.level <= 2 ? headings[headingIndex++]?.id : undefined;
          const Heading = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4";
          return <Heading key={index} id={id} dangerouslySetInnerHTML={{ __html: block.text }} />;
        }
        if (block.type === "quote") return <blockquote key={index} dangerouslySetInnerHTML={{ __html: block.text }} />;
        if (block.type === "list" || block.type === "ordered-list") {
          const List = block.type === "ordered-list" ? "ol" : "ul";
          return (
            <List key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </List>
          );
        }
        if (block.type === "code") {
          return <CodeBlock key={index} code={block.code} language={block.language} />;
        }
        if (block.type === "container") {
          return <ComponentBlock key={index} type={block.containerType} params={block.params} content={block.content} course={course} navigate={navigate} />;
        }
        if (block.type === "divider") {
          return <hr key={index} className="markdown-divider" />;
        }
        if (block.type === "section-image") {
          return <SectionImageBlock key={block.key || index} image={block.image} index={index} />;
        }
        if (block.type === "image") {
          return (
            <figure key={index} className={`markdown-figure markdown-figure-${block.align || "center"}`}>
              <img
                src={resolveMediaUrl(block.src)}
                alt={block.alt}
                className="markdown-image"
                loading="lazy"
                decoding="async"
              />
              {block.caption ? <figcaption dangerouslySetInnerHTML={{ __html: block.caption }} /> : null}
            </figure>
          );
        }
        if (block.type === "table") {
          return (
            <div key={index} className="markdown-table-wrap">
              <table>
                <thead>
                  <tr>{block.headers.map((cell, cellIndex) => <th key={cellIndex} dangerouslySetInnerHTML={{ __html: cell }} />)}</tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} dangerouslySetInnerHTML={{ __html: cell }} />)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={index} dangerouslySetInnerHTML={{ __html: block.text }} />;
      })}
    </div>
  );
}

function SectionImageBlock({ image, index }) {
  return (
    <figure className="blog-section-image" id={image.placement || undefined}>
      <img
        src={resolveMediaUrl(image.url || image.image_url)}
        alt={image.alt_text || `Section image ${index + 1}`}
        className="markdown-image"
      />
      {(image.caption || image.alt_text) ? <figcaption>{image.caption || image.alt_text}</figcaption> : null}
    </figure>
  );
}

function AdjacentLink({ label, blog, icon, next = false }) {
  return (
    <Link to={`/blog/${blog.slug}`} className={`blog-adjacent-card ${next ? "next" : ""}`}>
      <span>{label}</span>
      <strong>{blog.title}</strong>
      {icon}
    </Link>
  );
}

function BlogSchema({ blog }) {
  const origin = window.location.origin;
  const publishedDate = blog.publish_date ? new Date(blog.publish_date).toISOString() : "";
  const updatedDate = blog.seo_meta?.last_updated ? new Date(blog.seo_meta.last_updated).toISOString() : publishedDate;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.seo_meta?.seo_title || blog.title,
    description: blog.seo_meta?.meta_description || blog.subtitle,
    image: getBlogImageUrl(blog),
    datePublished: publishedDate,
    dateModified: updatedDate,
    author: {
      "@type": "Organization",
      name: blog.seo_meta?.author || "SIA Research Group",
      url: origin,
    },
    publisher: {
      "@type": "Organization",
      name: "SIA Software Innovations Private Limited",
      logo: {
        "@type": "ImageObject",
        url: `${origin}/sia-logo.png`,
      },
    },
    mainEntityOfPage: `${origin}/blog/${blog.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/blog` },
      { "@type": "ListItem", position: 3, name: blog.title, item: `${origin}/blog/${blog.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </>
  );
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, Math.max(0, (window.scrollY / height) * 100)) : 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return progress;
}

function stripHtml(html) {
  return String(html || "").replace(/<[^>]*>/g, "");
}

function groupSectionImages(images) {
  return (images || []).reduce((acc, image) => {
    const placement = String(image.placement || "introduction").toLowerCase();
    if (!acc[placement]) acc[placement] = [];
    acc[placement].push(image);
    return acc;
  }, {});
}

function injectSectionImages(blocks, groupedImages) {
  const used = new Set();
  const result = [];

  blocks.forEach((block, index) => {
    result.push(block);
    if (block.type !== "heading") return;

    const placement = detectPlacementFromHeading(block.text);

    if (!placement || !groupedImages[placement]?.length) return;

    groupedImages[placement].forEach((image, imageIndex) => {
      const key = image.id || `${placement}-${index}-${imageIndex}`;
      if (used.has(key)) return;
      used.add(key);
      result.push({ type: "section-image", image, key });
    });
  });

  return result;
}

function detectPlacementFromHeading(text) {
  const headingText = stripHtml(text).toLowerCase().replace(/^\d+[\).:-]\s*/, "").trim();
  if (!headingText) return null;

  if (/^(introduction|intro|overview|getting started|what is|why learn)/.test(headingText)) {
    return "introduction";
  }

  if (/^(modules|module|module overview|lessons|topics|curriculum|what you will learn)/.test(headingText)) {
    return "modules";
  }

  if (/^(related articles|related|further reading|next steps|resources|references)/.test(headingText)) {
    return "related";
  }

  return null;
}

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let element = document.querySelector(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}
