import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBookOpen,
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineShoppingBag,
} from "react-icons/hi2";

import LoadingSpinner from "../components/LoadingSpinner";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import MainLayout from "../layouts/MainLayout";
import BlogCard from "../components/blog/BlogCard";
import { blogService, unwrapList } from "../services/blogService";
import { courseService } from "../services/courseService";
import { getCourseHeroImageUrl, getCourseImageUrl, getCourseSectionImages } from "../data/courseImages";
import { getCourseStartLabel } from "../data/featuredCourse";
import "./CourseDetails.css";

const DESCRIPTION_PREVIEW_LIMIT = 620;
const ADVANCED_QUANTUM_SLUG = "advanced-quantum-computing-using-hdqs";
const MODULE_ARTICLE_SLUG_PREFIX = "advanced-quantum-computing-module-";
const PROJECT_ARTICLE_SLUG = "advanced-quantum-computing-projects";

const DEFAULT_CURRICULUM = [
  "Module 1: Foundations, notation, and problem framing",
  "Module 2: Applied implementation with guided labs",
  "Module 3: Evaluation, optimization, and reliability checks",
  "Module 4: Capstone delivery and skill assessment",
];

function uniqueItems(items, max = 8) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const normalized = String(item || "").trim();
    if (!normalized) {
      continue;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(normalized);
    if (output.length >= max) {
      break;
    }
  }
  return output;
}

function extractSectionBullets(description, headings, max = 8) {
  const lines = String(description || "")
    .split(/\r?\n/)
    .map((line) => line.trim());

  const headingPattern = new RegExp(`^(${headings.join("|")})\\s*:?$`, "i");
  let collecting = false;
  const bullets = [];

  for (const line of lines) {
    if (!line) {
      if (collecting && bullets.length > 0) {
        break;
      }
      continue;
    }

    if (headingPattern.test(line)) {
      collecting = true;
      continue;
    }

    if (!collecting) {
      continue;
    }

    if (/^[A-Za-z][A-Za-z0-9\s/&'-]{2,48}:\s*$/.test(line) && !/^[-*]/.test(line)) {
      break;
    }

    if (/^[-*]\s+/.test(line)) {
      bullets.push(line.replace(/^[-*]\s+/, "").trim());
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      bullets.push(line.replace(/^\d+[.)]\s+/, "").trim());
    }
  }

  return uniqueItems(bullets, max);
}

function extractModuleLines(description, max = 12) {
  const lines = String(description || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const modules = [];
  for (const line of lines) {
    if (/^module\s+\d+/i.test(line)) {
      modules.push(line.replace(/\s+/g, " ").trim());
      continue;
    }
    if (/^capstone project/i.test(line)) {
      modules.push("Capstone Project");
    }
    if (modules.length >= max) {
      break;
    }
  }
  return uniqueItems(modules, max);
}

function parseDescriptionPreview(text, expanded) {
  const fullText = String(text || "").trim();
  if (!fullText) {
    return "";
  }
  if (expanded || fullText.length <= DESCRIPTION_PREVIEW_LIMIT) {
    return fullText;
  }
  return `${fullText.slice(0, DESCRIPTION_PREVIEW_LIMIT).trim()}...`;
}

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moduleArticles, setModuleArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [imageStage, setImageStage] = useState(0);

  const loadCourseDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    setDescriptionExpanded(false);
    setImageStage(0);

    try {
      const detailResponse = await courseService.getCourse(id);
      const apiCourse = detailResponse.data;
      setCourse(apiCourse);
    } catch (requestError) {
      const message = requestError?.response?.data?.detail || "Unable to load course details.";
      setError(message);
      addToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    loadCourseDetails();
  }, [loadCourseDetails]);

  useEffect(() => {
    let ignore = false;

    if (!course?.id || course?.slug !== ADVANCED_QUANTUM_SLUG) {
      setModuleArticles([]);
      return undefined;
    }

    setArticlesLoading(true);
    blogService
      .getBlogs({ course: course.id, ordering: "title", page_size: 50 })
      .then((response) => {
        if (ignore) return;
        const articles = unwrapList(response.data)
          .filter((blog) => blog.slug?.startsWith(MODULE_ARTICLE_SLUG_PREFIX) || blog.slug === PROJECT_ARTICLE_SLUG)
          .sort((left, right) => {
            if (left.slug === PROJECT_ARTICLE_SLUG) return 1;
            if (right.slug === PROJECT_ARTICLE_SLUG) return -1;
            return String(left.slug || "").localeCompare(String(right.slug || ""));
          });
        setModuleArticles(articles);
      })
      .catch(() => {
        if (!ignore) setModuleArticles([]);
      })
      .finally(() => {
        if (!ignore) setArticlesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [course?.id, course?.slug]);

  const isPurchased = Boolean(course?.is_purchased);
  const description = String(course?.description || "");
  const previewDescription = parseDescriptionPreview(description, descriptionExpanded);
  const canToggleDescription = description.length > DESCRIPTION_PREVIEW_LIMIT;
  const startLabel = getCourseStartLabel(course);
  const durationDays = Number(course?.duration_days || 0);
  const durationWeeks = durationDays > 0 ? Math.round(durationDays / 7) : 0;
  const durationLabel = durationWeeks > 0 ? `${durationWeeks} weeks` : "";

  const curriculum = useMemo(() => {
    const extracted = extractSectionBullets(description, ["Course content", "Curriculum"], 10);
    if (extracted.length > 0) {
      return extracted;
    }
    const moduleLines = extractModuleLines(description, 12);
    return moduleLines.length > 0 ? moduleLines : DEFAULT_CURRICULUM;
  }, [description]);

  const learningOutcomes = Array.isArray(course?.learning_outcomes) ? course.learning_outcomes : [];
  const careerOpportunities = Array.isArray(course?.career_opportunities) ? course.career_opportunities : [];

  const sectionImages = useMemo(() => getCourseSectionImages(course), [course]);

  const imageCandidates = useMemo(() => {
    const candidates = [];
    const heroImageUrl = getCourseHeroImageUrl(course);
    if (heroImageUrl) {
      candidates.push(heroImageUrl);
    }

    for (const image of sectionImages) {
      if (image?.url && !candidates.includes(image.url)) {
        candidates.push(image.url);
      }
    }

    if (!candidates.length) {
      const fallbackImageUrl = getCourseImageUrl(course);
      if (fallbackImageUrl) {
        candidates.push(fallbackImageUrl);
      }
    }

    return candidates;
  }, [course, sectionImages]);

  const imageUrl = imageCandidates[imageStage] || "";
  const showImage = Boolean(imageUrl);

  const handleBuyCourse = () => {
    if (!course) {
      return;
    }
    if (isPurchased) {
      navigate(`/user/lms/${course.id}`);
      return;
    }
    if (!isAuthenticated) {
      addToast({ type: "warning", message: "Please login first to continue billing." });
      navigate("/login");
      return;
    }
    navigate(`/billing/${course.id}`);
  };

  return (
    <MainLayout>
      <PageTransition>
        <section className="course-details-page">
          {loading ? (
            <LoadingSpinner label="Loading course details..." />
          ) : error || !course ? (
            <article className="course-details-panel course-details-error">
              <h1>Course details unavailable</h1>
              <p>{error || "This course could not be loaded."}</p>
              <div className="course-details-actions">
                <button type="button" className="btn btn-muted" onClick={loadCourseDetails}>
                  Retry
                </button>
                <Link to="/" className="btn btn-primary">
                  Back to Home
                </Link>
              </div>
            </article>
          ) : (
            <>
              <nav className="course-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                {course.category?.id ? (
                  <Link
                    to={`/?category=${course.category.id}&categoryName=${encodeURIComponent(course.category.name || "")}`}
                  >
                    {course.category?.name || "Courses"}
                  </Link>
                ) : (
                  <span>{course.category?.name || "Courses"}</span>
                )}
                <span>/</span>
                <span className="current">{course.title}</span>
              </nav>

              <section className="course-hero">
                <article className="course-details-panel course-hero-main">
                  <span className="hero-badge">{course.category?.name || "General"}</span>
                  <h1>{course.title}</h1>
                  <p className="course-subtitle">{course.short_description}</p>
                  <div className="course-hero-meta">
                    {startLabel ? (
                      <span className="meta-pill">
                        <HiOutlineCalendarDays />
                        {startLabel}
                      </span>
                    ) : null}
                    {durationLabel ? (
                      <span className="meta-pill">
                        <HiOutlineCalendarDays />
                        {durationLabel}
                      </span>
                    ) : null}
                    {course.level ? <span className="meta-pill">{course.level}</span> : null}
                    {course.language ? <span className="meta-pill">{course.language}</span> : null}
                  </div>
                  <div className="course-hero-image-wrap">
                    {showImage ? (
                      <img
                        src={imageUrl}
                        alt={course.title}
                        className="course-hero-image"
                        loading="eager"
                        decoding="async"
                        width="800"
                        height="450"
                        onError={() => setImageStage((stage) => Math.min(stage + 1, imageCandidates.length))}
                      />
                    ) : (
                      <div className="course-hero-image-placeholder">
                        <HiOutlineBookOpen />
                        <span>SIA Software Innovations Private Limited Course Preview</span>
                      </div>
                    )}
                  </div>
                </article>

                <aside className="course-details-panel course-pricing-card">
                  {isPurchased ? <span className="pill pill-owned">Purchased</span> : null}
                  <div className="pricing-kpi">
                    <strong>Program Start</strong>
                    <span>{startLabel || ""}</span>
                  </div>
                  <p className="price-note">Guided learning plan with HDQS platform access.</p>
                  <button
                    type="button"
                    className={`btn btn-icon ${isPurchased ? "btn-muted" : "btn-primary"}`}
                    onClick={handleBuyCourse}
                  >
                    {isPurchased ? <HiOutlineArrowTopRightOnSquare /> : <HiOutlineShoppingBag />}
                    {isPurchased ? "Start Learning" : "Buy This Course"}
                  </button>
                </aside>
              </section>

              <section className="course-body">
                <div className="course-main-column">
                  <article className="course-details-panel">
                    <h2>Course content / curriculum</h2>
                    <ul className="curriculum-list">
                      {curriculum.map((module) => (
                        <li key={module}>
                          <HiOutlineDocumentText />
                          <span>{module}</span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  {course.slug === ADVANCED_QUANTUM_SLUG ? (
                    <article className="course-details-panel">
                      <div className="course-section-heading">
                        <div>
                          <h2>Module articles</h2>
                          <p>Read the separated module articles for this Advanced Quantum Computing course.</p>
                        </div>
                        <Link to="/blog" className="btn btn-muted">
                          View Blog
                        </Link>
                      </div>
                      {articlesLoading ? (
                        <p className="course-muted-text">Loading module articles...</p>
                      ) : moduleArticles.length > 0 ? (
                        <div className="course-module-articles-grid">
                          {moduleArticles.map((article) => (
                            <BlogCard key={article.slug || article.id} blog={article} />
                          ))}
                        </div>
                      ) : (
                        <p className="course-muted-text">
                          Module articles will appear here after the blog content is imported.
                        </p>
                      )}
                    </article>
                  ) : null}

                  {learningOutcomes.length > 0 ? (
                    <article className="course-details-panel">
                      <h2>Learning outcomes</h2>
                      <ul className="details-list">
                        {learningOutcomes.map((item) => (
                          <li key={item}>
                            <HiOutlineDocumentText />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ) : null}

                  {careerOpportunities.length > 0 ? (
                    <article className="course-details-panel">
                      <h2>Career opportunities</h2>
                      <ul className="details-list">
                        {careerOpportunities.map((item) => (
                          <li key={item}>
                            <HiOutlineDocumentText />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ) : null}

                  <article className="course-details-panel">
                    <h2>Full description</h2>
                    <p className="long-description">{previewDescription || "Description will be updated soon."}</p>
                    {canToggleDescription ? (
                      <button
                        type="button"
                        className="btn btn-muted"
                        onClick={() => setDescriptionExpanded((previous) => !previous)}
                      >
                        {descriptionExpanded ? "Show less" : "Show more"}
                      </button>
                    ) : null}
                  </article>
                </div>

                <aside className="course-side-column" />
              </section>
            </>
          )}
        </section>
      </PageTransition>
    </MainLayout>
  );
}
