import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineStar,
  HiOutlineTrash,
} from "react-icons/hi2";

import AdminLayout from "../layouts/AdminLayout";
import ConfirmModal from "../components/ConfirmModal";
import SearchBar from "../components/SearchBar";
import { useToast } from "../context/ToastContext";
import { blogService, unwrapList } from "../services/blogService";
import { courseService } from "../services/courseService";
import { parseMarkdown } from "../utils/markdown";
import { resolveMediaUrl } from "../utils/media";

const DRAFT_KEY = "sia_blog_admin_autosave";
const SAMPLE_MARKDOWN = `# Article Title

## Section Heading

Paste ChatGPT Markdown here. Paragraphs are automatically justified in preview and in the published article.

### Key Points

- Use bullet lists naturally
- Add **bold**, *italic*, ++underline++, tables, quotes, and code

| Topic | Outcome |
| --- | --- |
| Formatting | Preserved automatically |
| Reading width | Clean and responsive |

> Add important notes as quotes.

\`\`\`javascript
const lesson = "copy-paste friendly";
\`\`\`

---`;

const EMPTY_FORM = {
  title: "",
  slug: "",
  subtitle: "",
  category: "",
  reading_time: "",
  content: SAMPLE_MARKDOWN,
  course_id: "",
  lesson_id: "",
  series_name: "",
  series_order: 0,
  tag_names: "",
  status: "draft",
  publish_date: "",
  is_featured: false,
  seo_title: "",
  seo_description: "",
  hero_image: null,
  hero_image_url: "",
  thumbnail: null,
  thumbnail_url: "",
  banner_image: null,
  banner_image_url: "",
  section_images: [],
  section_image_placements: [],
};

const TOOLBAR = [
  { label: "H1", before: "# ", block: true },
  { label: "H2", before: "## ", block: true },
  { label: "H3", before: "### ", block: true },
  { label: "P", before: "", block: true },
  { label: "B", before: "**", after: "**" },
  { label: "I", before: "*", after: "*" },
  { label: "U", before: "++", after: "++" },
  { label: "Bullets", before: "- ", block: true },
  { label: "1.", before: "1. ", block: true },
  { label: "Quote", before: "> ", block: true },
  { label: "Code", before: "```javascript\n", after: "\n```" },
  { label: "Table", snippet: "\n| Topic | Notes |\n| --- | --- |\n| Example | Details |\n" },
  { label: "Divider", snippet: "\n---\n" },
];

const IMAGE_SIZE_GUIDES = {
  hero: "Recommended 1600 x 900 px, 16:9, max 5MB",
  banner: "Recommended 1920 x 720 px, wide banner, max 5MB",
  inline: "Recommended 1200 x 675 px, max 5MB",
};

export default function ManageBlogs() {
  const { addToast } = useToast();
  const editorRef = useRef(null);
  const [blogs, setBlogs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => loadDraft());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewMode, setPreviewMode] = useState("split");
  const [loading, setLoading] = useState(true);

  const slug = useMemo(() => buildSlug(form.title), [form.title]);
  const estimatedReadTime = useMemo(() => Math.max(1, Math.round((form.content || "").split(/\s+/).filter(Boolean).length / 220)), [form.content]);
  const previewBlocks = useMemo(() => parseMarkdown(form.content), [form.content]);
  const selectedCourse = courses.find((course) => String(course.id) === String(form.course_id));
  const filteredBlogs = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return blogs;
    return blogs.filter((blog) => [blog.title, blog.course?.title, blog.category, blog.status].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [blogs, search]);

  const loadBlogs = useCallback(() => {
    setLoading(true);
    blogService
      .getAdminBlogs({ page_size: 100, ordering: "-updated_at" })
      .then((res) => setBlogs(unwrapList(res.data)))
      .catch(() => addToast({ type: "error", message: "Unable to load blog posts." }))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => {
    Promise.resolve().then(loadBlogs);
    courseService.getCourses({ page_size: 100 }).then((res) => setCourses(unwrapList(res.data))).catch(() => setCourses([]));
  }, [loadBlogs]);

  useEffect(() => {
    if (showForm) {
      const safeDraft = { ...form, hero_image: null, thumbnail: null, banner_image: null, section_images: [], section_image_placements: [] };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(safeDraft));
    }
  }, [form, showForm]);

  function startCreate() {
    setEditing(null);
    setForm(loadDraft());
    setPreviewMode("split");
    setShowForm(true);
  }

  function startEdit(blog) {
    setEditing(blog);
    setForm({
      ...EMPTY_FORM,
      title: blog.title || "",
      slug: blog.slug || "",
      subtitle: blog.subtitle || "",
      category: blog.seo_meta?.article_category || blog.category || blog.course?.category_name || "",
      reading_time: blog.read_time || "",
      content: blog.content || "",
      course_id: blog.course?.id || "",
      lesson_id: blog.lesson?.id || "",
      series_name: blog.series_name || "",
      series_order: blog.series_order || 0,
      tag_names: (blog.tags || []).map((tag) => tag.name).join(", "),
      status: blog.status || "draft",
      publish_date: blog.publish_date ? blog.publish_date.slice(0, 16) : "",
      is_featured: Boolean(blog.is_featured),
      seo_title: blog.seo_meta?.title || blog.seo_meta?.seo_title || "",
      seo_description: blog.seo_meta?.description || blog.seo_meta?.meta_description || "",
      hero_image: null,
      hero_image_url: resolveMediaUrl(blog.hero_image || blog.imageUrl),
      thumbnail: null,
      thumbnail_url: resolveMediaUrl(blog.thumbnail),
      banner_image: null,
      banner_image_url: resolveMediaUrl(blog.banner_image),
      section_images: [],
      section_image_placements: [],
    });
    setPreviewMode("split");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.course_id) {
      addToast({ type: "warning", message: "Title, article content, and course relation are required." });
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("subtitle", form.subtitle.trim());
    payload.append("content", form.content);
    payload.append("course_id", form.course_id);
    if (form.lesson_id) payload.append("lesson_id", form.lesson_id);
    payload.append("status", form.status);
    if (form.publish_date) payload.append("publish_date", new Date(form.publish_date).toISOString());
    payload.append("is_featured", String(form.is_featured));
    payload.append("series_name", form.series_name.trim());
    payload.append("series_order", String(form.series_order));
    payload.append(
      "seo_meta",
      JSON.stringify({
        title: form.seo_title.trim(),
        description: form.seo_description.trim(),
        article_category: form.category.trim(),
        reading_time_label: `${estimatedReadTime} min read`,
      }),
    );
    splitTags(form.tag_names).forEach((tag) => payload.append("tag_names", tag));
    if (form.hero_image) payload.append("hero_image", form.hero_image);
    if (form.thumbnail) payload.append("thumbnail", form.thumbnail);
    if (form.banner_image) payload.append("banner_image", form.banner_image);
    (form.section_images || []).slice(0, 12).forEach((file) => payload.append("section_images", file));
    (form.section_image_placements || []).slice(0, 12).forEach((placement) => payload.append("section_image_placements", placement));

    try {
      if (editing) {
        const response = await blogService.updateBlog(editing.slug, payload);
        setEditing(response.data);
        setForm((prev) => withSavedImageUrls(prev, response.data));
        addToast({ type: "success", message: "Article updated." });
      } else {
        const response = await blogService.createBlog(payload);
        setEditing(response.data);
        setForm((prev) => withSavedImageUrls(prev, response.data));
        localStorage.removeItem(DRAFT_KEY);
        addToast({ type: "success", message: "Article created." });
      }
      loadBlogs();
    } catch (error) {
      const message = error.response?.data ? JSON.stringify(error.response.data) : "Unable to save article.";
      addToast({ type: "error", message });
    }
  }

  function applyTool(tool) {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = form.content || "";
    const selected = value.slice(start, end);
    const snippet = tool.snippet || `${tool.before}${selected || (tool.block ? "Text" : "text")}${tool.after || ""}`;
    const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    setForm((prev) => ({ ...prev, content: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  }

  async function uploadInlineImage(file, align = "center", caption = "") {
    if (!file) return;
    if (editing) {
      const payload = new FormData();
      payload.append("image_url", file);
      payload.append("alt_text", caption || `${editing.title} inline image`);
      payload.append("caption", caption);
      try {
        const res = await blogService.uploadImage(editing.slug, payload);
        insertImageMarkdown(resolveMediaUrl(res.data.url || res.data.image_url), res.data.alt_text, align, res.data.caption || caption);
        addToast({ type: "success", message: "Image uploaded and inserted." });
      } catch {
        addToast({ type: "error", message: "Inline image upload failed." });
      }
      return;
    }

    addToast({ type: "warning", message: "Save the article first, then upload inline images between paragraphs." });
  }

  function insertImageMarkdown(src, alt, align = "center", caption = "") {
    const markdown = `\n![${alt}](${src}){align=${align} caption="${caption}"}\n`;
    const textarea = editorRef.current;
    if (!textarea) {
      setForm((prev) => ({ ...prev, content: `${prev.content}${markdown}` }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setForm((prev) => ({ ...prev, content: `${prev.content.slice(0, start)}${markdown}${prev.content.slice(end)}` }));
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await blogService.deleteBlog(deleteTarget.slug);
      addToast({ type: "success", message: "Article deleted." });
      setDeleteTarget(null);
      loadBlogs();
    } catch {
      addToast({ type: "error", message: "Unable to delete article." });
    }
  }

  return (
    <AdminLayout>
      <div className="admin-blog-manager article-template">
        <div className="page-top article-topbar">
          <div>
            <h1>Article Management</h1>
            <p>Create polished educational articles from pasted ChatGPT Markdown with automatic formatting and live preview.</p>
          </div>
          {!showForm ? (
            <button type="button" className="btn btn-primary btn-icon" onClick={startCreate}>
              <HiOutlinePlus />
              Create Article
            </button>
          ) : null}
        </div>

        {showForm ? (
          <form onSubmit={submitForm} className="article-workspace">
            <aside className="article-sidebar panel-card">
              <h2 className="card-title"><HiOutlineDocumentText /> Article Info</h2>
              <Field label="Article Title" value={form.title} onChange={(title) => setForm((prev) => ({ ...prev, title }))} required />
              <Field label="Slug" value={slug || form.slug} onChange={() => {}} readOnly />
              <Field label="Category" value={form.category} onChange={(category) => setForm((prev) => ({ ...prev, category }))} placeholder="AI, Data Science, Quantum" />
              <div>
                <label>Course relation</label>
                <select value={form.course_id} onChange={(e) => setForm((prev) => ({ ...prev, course_id: e.target.value, lesson_id: "" }))} required>
                  <option value="">Select existing course</option>
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
                {selectedCourse ? <p className="course-association">Linked category: {selectedCourse.category?.name || selectedCourse.category_name}</p> : null}
              </div>
              <Field label="Series Name" value={form.series_name} onChange={(series_name) => setForm((prev) => ({ ...prev, series_name }))} placeholder="e.g. Advanced Quantum Computing" />
              <Field label="Series Order" type="number" value={form.series_order} onChange={(series_order) => setForm((prev) => ({ ...prev, series_order: parseInt(series_order) || 0 }))} />
              <Field label="Reading Time" value={`${estimatedReadTime} min read`} onChange={() => {}} readOnly />
              <Field label="Short Description / Meta Description" value={form.subtitle} onChange={(subtitle) => setForm((prev) => ({ ...prev, subtitle }))} />
              <div>
                <label>Publish Status</label>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <Field label="Publish date" type="datetime-local" value={form.publish_date} onChange={(publish_date) => setForm((prev) => ({ ...prev, publish_date }))} />
              <label className="toggle-row blog-feature-toggle">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))} />
                Mark as featured
              </label>
              <Field label="Tags" value={form.tag_names} onChange={(tag_names) => setForm((prev) => ({ ...prev, tag_names }))} placeholder="Python, AI, Career" />
            </aside>

            <main className="article-editor-shell">
              <section className="article-media-grid">
                <ImageInput
                  label="Hero Image"
                  helpText={IMAGE_SIZE_GUIDES.hero}
                  file={form.hero_image}
                  currentUrl={form.hero_image_url}
                  onChange={(hero_image) => setForm((prev) => ({ ...prev, hero_image }))}
                />
                <ImageInput
                  label="Banner Image"
                  helpText={IMAGE_SIZE_GUIDES.banner}
                  file={form.banner_image}
                  currentUrl={form.banner_image_url}
                  onChange={(banner_image) => setForm((prev) => ({ ...prev, banner_image }))}
                />
                <ImageDropzone onUpload={uploadInlineImage} />
              </section>

              <section className="article-editor-card panel-card">
                <div className="article-editor-head">
                  <div>
                    <h2>Rich Text Markdown Editor</h2>
                    <p>Paste Markdown from ChatGPT. The preview applies the published article typography automatically.</p>
                  </div>
                  <div className="article-mode-toggle" aria-label="Preview mode">
                    {["edit", "split", "preview"].map((mode) => (
                      <button key={mode} type="button" className={previewMode === mode ? "active" : ""} onClick={() => setPreviewMode(mode)}>
                        {mode === "preview" ? <HiOutlineEye /> : null}
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="article-toolbar">
                  {TOOLBAR.map((tool) => (
                    <button key={tool.label} type="button" onClick={() => applyTool(tool)} title={tool.label}>
                      {tool.label}
                    </button>
                  ))}
                </div>

                <div className={`article-editor-grid is-${previewMode}`}>
                  {previewMode !== "preview" ? (
                    <textarea
                      ref={editorRef}
                      className="article-markdown-input"
                      value={form.content}
                      onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        uploadInlineImage(e.dataTransfer.files?.[0]);
                      }}
                      required
                    />
                  ) : null}
                  {previewMode !== "edit" ? (
                    <MarkdownPreview
                      blocks={previewBlocks}
                      title={form.title}
                      subtitle={form.subtitle}
                      heroImage={getImagePreview(form.hero_image, form.hero_image_url)}
                      bannerImage={getImagePreview(form.banner_image, form.banner_image_url)}
                    />
                  ) : null}
                </div>
              </section>
            </main>

            <div className="article-sticky-actions">
              <button type="button" className="btn btn-muted" onClick={cancelForm}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing ? "Update Article" : "Save Article"}</button>
            </div>
          </form>
        ) : (
          <section className="panel-card article-list-panel">
            <SearchBar value={search} onChange={setSearch} placeholder="Search articles by title, course, category, or status..." />
            <div className="table-wrap" style={{ marginTop: "1rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Read</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5}>Loading articles...</td></tr>
                  ) : filteredBlogs.length === 0 ? (
                    <tr><td colSpan={5}>No blog posts found.</td></tr>
                  ) : (
                    filteredBlogs.map((blog) => (
                      <tr key={blog.id}>
                        <td>
                          <strong>{blog.title}</strong>
                          {blog.is_featured ? <span className="featured-flag"><HiOutlineStar /> Featured</span> : null}
                        </td>
                        <td>{blog.course?.title}</td>
                        <td><span className={blog.status === "published" ? "published-pill" : "draft-pill"}>{blog.status}</span></td>
                        <td>{blog.read_time} min</td>
                        <td>
                          <div className="inline-controls">
                            <button type="button" className="btn btn-muted" onClick={() => startEdit(blog)}>Edit</button>
                            <button type="button" className="btn btn-danger btn-icon" onClick={() => setDeleteTarget(blog)}><HiOutlineTrash /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Article"
        message={`Delete "${deleteTarget?.title || ""}" permanently?`}
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = "text", ...props }) {
  return (
    <div className="article-field">
      <label>{label}</label>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </div>
  );
}

function ImageInput({ label, helpText, file, currentUrl, onChange }) {
  const preview = getImagePreview(file, currentUrl);
  return (
    <div className="article-upload-card">
      <label>{label}</label>
      {helpText ? <small>{helpText}</small> : null}
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onChange(e.target.files?.[0] || null)} />
      {preview ? <img src={preview} alt={`${label} preview`} /> : <span><HiOutlinePhoto /> {helpText || "Image recommended"}</span>}
    </div>
  );
}

function ImageDropzone({ onUpload }) {
  const [align, setAlign] = useState("center");
  const [caption, setCaption] = useState("");
  return (
    <div
      className="article-upload-card article-dropzone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onUpload(e.dataTransfer.files?.[0], align, caption);
      }}
    >
      <label>Insert Image Anywhere</label>
      <small>{IMAGE_SIZE_GUIDES.inline}</small>
      <div className="image-options">
        <select value={align} onChange={(e) => setAlign(e.target.value)}>
          <option value="center">Center</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="full">Full width</option>
        </select>
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption" />
      </div>
      <button type="button" className="btn btn-muted btn-icon" onClick={() => document.getElementById("inline-image-input")?.click()}>
        <HiOutlinePhoto /> Upload image
      </button>
      <input id="inline-image-input" hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onUpload(e.target.files?.[0], align, caption)} />
    </div>
  );
}

function MarkdownPreview({ blocks, title, subtitle, heroImage, bannerImage }) {
  return (
    <article className="article-published-preview">
      {heroImage ? (
        <figure className="article-preview-hero">
          <img src={heroImage} alt={title || "Article hero"} loading="lazy" />
        </figure>
      ) : null}
      {title ? <h1>{title}</h1> : null}
      {subtitle ? <p className="preview-subtitle">{subtitle}</p> : null}
      {bannerImage ? (
        <figure className="article-preview-banner">
          <img src={bannerImage} alt={`${title || "Article"} banner`} loading="lazy" />
        </figure>
      ) : null}
      <div className="markdown-content admin-markdown-preview">
        {blocks.map((block, index) => {
          if (block.type === "heading") {
            const Heading = `h${Math.min(block.level, 3)}`;
            return <Heading key={index} dangerouslySetInnerHTML={{ __html: block.text }} />;
          }
          if (block.type === "quote") return <blockquote key={index} dangerouslySetInnerHTML={{ __html: block.text }} />;
          if (block.type === "code") return <pre key={index}><code>{block.code}</code></pre>;
          if (block.type === "divider") return <hr key={index} className="markdown-divider" />;
          if (block.type === "image") {
            return (
              <figure key={index} className={`markdown-figure markdown-figure-${block.align || "center"}`}>
                <img src={block.src} alt={block.alt} className="markdown-image" loading="lazy" />
                {block.caption ? <figcaption dangerouslySetInnerHTML={{ __html: block.caption }} /> : null}
              </figure>
            );
          }
          if (block.type === "list" || block.type === "ordered-list") {
            const List = block.type === "ordered-list" ? "ol" : "ul";
            return <List key={index}>{block.items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</List>;
          }
          if (block.type === "table") {
            return (
              <div key={index} className="markdown-table-wrap">
                <table>
                  <thead><tr>{block.headers.map((cell, i) => <th key={i} dangerouslySetInnerHTML={{ __html: cell }} />)}</tr></thead>
                  <tbody>{block.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c} dangerouslySetInnerHTML={{ __html: cell }} />)}</tr>)}</tbody>
                </table>
              </div>
            );
          }
          return <p key={index} dangerouslySetInnerHTML={{ __html: block.text }} />;
        })}
      </div>
    </article>
  );
}

function splitTags(value) {
  return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}

function loadDraft() {
  try {
    return { ...EMPTY_FORM, ...(JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}")) };
  } catch {
    return EMPTY_FORM;
  }
}

function buildSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 240);
}

function getImagePreview(file, currentUrl) {
  if (file) return URL.createObjectURL(file);
  return resolveMediaUrl(currentUrl);
}

function withSavedImageUrls(currentForm, blog) {
  return {
    ...currentForm,
    hero_image: null,
    banner_image: null,
    thumbnail: null,
    hero_image_url: resolveMediaUrl(blog.hero_image || blog.imageUrl),
    banner_image_url: resolveMediaUrl(blog.banner_image),
    thumbnail_url: resolveMediaUrl(blog.thumbnail),
  };
}
