"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, ImageUp, Plus, Save, Trash2 } from "lucide-react";
import type { Course } from "@/lib/types";

type CourseForm = {
  title: string;
  slug: string;
  description: string;
  markdown_content: string;
  course_image: string;
  author: string;
  category: string;
  tags: string;
  reading_time: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
  status: Course["status"];
};

const emptyForm: CourseForm = {
  title: "",
  slug: "",
  description: "",
  markdown_content: "",
  course_image: "",
  author: "SIA Software Innovations",
  category: "Quantum Computing",
  tags: "",
  reading_time: "1",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  canonical_url: "",
  status: "draft"
};

function formFromCourse(course: Course): CourseForm {
  return {
    title: course.title || "",
    slug: course.slug || "",
    description: course.description || "",
    markdown_content: course.markdown_content || "",
    course_image: course.course_image || "",
    author: course.author || "",
    category: course.category || "",
    tags: (course.tags || []).join("\n"),
    reading_time: String(course.reading_time || 1),
    seo_title: course.seo_title || "",
    seo_description: course.seo_description || "",
    seo_keywords: (course.seo_keywords || []).join("\n"),
    canonical_url: course.canonical_url || "",
    status: course.status || "draft"
  };
}

function lines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildPayload(form: CourseForm) {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugify(form.title),
    description: form.description.trim(),
    markdown_content: form.markdown_content,
    course_image: form.course_image.trim(),
    author: form.author.trim(),
    category: form.category.trim(),
    tags: lines(form.tags),
    reading_time: Math.max(1, Number(form.reading_time || 1)),
    seo_title: form.seo_title.trim(),
    seo_description: form.seo_description.trim(),
    seo_keywords: lines(form.seo_keywords),
    canonical_url: form.canonical_url.trim(),
    status: form.status
  };
}

export default function AdminCoursesPage() {
  const [secret, setSecret] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(selected);
  const headers = useMemo(() => ({ "Content-Type": "application/json", "x-admin-secret": secret }), [secret]);

  async function loadCourses() {
    if (!secret) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/courses", { headers });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load courses.");
      setCourses(payload.courses || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("course-admin-secret") || "";
    setSecret(saved);
  }, []);

  useEffect(() => {
    if (secret) {
      window.localStorage.setItem("course-admin-secret", secret);
      loadCourses();
    }
  }, [secret]);

  function update<K extends keyof CourseForm>(key: K, value: CourseForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveCourse(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const endpoint = selected ? `/api/admin/courses/${selected.id}` : "/api/admin/courses";
    const method = selected ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(buildPayload(form))
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save course.");
      setMessage(selected ? "Course updated." : "Course created.");
      setSelected(payload.course);
      setForm(formFromCourse(payload.course));
      await loadCourses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save course.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCourse(course: Course) {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, { method: "DELETE", headers });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to delete course.");
      setMessage("Course deleted.");
      setSelected(null);
      setForm(emptyForm);
      await loadCourses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete course.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(file: File | null) {
    if (!file) return;
    setLoading(true);
    setMessage("");
    const data = new FormData();
    data.append("file", file);
    data.append("slug", form.slug || slugify(form.title) || "course");
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-secret": secret },
        body: data
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to upload image.");
      update("course_image", payload.url);
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7faf8] px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#a35600]">Admin</p>
            <h1 className="text-4xl font-black text-[#0d302f]">Course Management</h1>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-md border border-[#dbe5df] bg-white px-4 py-2 text-[#153d39]">
            <Eye size={18} /> View course
          </Link>
        </div>

        <div className="mb-5 rounded-lg border border-[#dbe5df] bg-white p-4">
          <label className="block text-sm font-semibold text-[#153d39]">Admin Secret</label>
          <input
            type="password"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            className="mt-2 w-full rounded-md border border-[#ccd9d4] px-3 py-2"
            placeholder="COURSE_ADMIN_SECRET"
          />
        </div>

        {message && <p className="mb-5 rounded-md border border-[#c8d8d2] bg-[#eef6f3] px-4 py-3 text-[#153d39]">{message}</p>}

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <section className="rounded-lg border border-[#dbe5df] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#153d39]">Courses</h2>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setForm(emptyForm);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#007b83] text-white"
                aria-label="Create new course"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {courses.map((course) => (
                <button
                  type="button"
                  key={course.id}
                  onClick={() => {
                    setSelected(course);
                    setForm(formFromCourse(course));
                  }}
                  className={`w-full rounded-md border p-3 text-left ${
                    selected?.id === course.id ? "border-[#007b83] bg-[#edf8f6]" : "border-[#dbe5df] bg-white"
                  }`}
                >
                  <span className="block font-semibold text-[#153d39]">{course.title}</span>
                  <span className="text-sm text-[#5d6f6e]">{course.status}</span>
                </button>
              ))}
              {!courses.length && <p className="text-sm text-[#5d6f6e]">{loading ? "Loading..." : "No courses loaded."}</p>}
            </div>
          </section>

          <form onSubmit={saveCourse} className="rounded-lg border border-[#dbe5df] bg-white p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[#153d39]">{isEditing ? "Edit Course" : "Create Course"}</h2>
              <div className="flex gap-2">
                {selected && (
                  <button
                    type="button"
                    onClick={() => deleteCourse(selected)}
                    className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-red-700"
                    disabled={loading}
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                )}
                <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-[#007b83] px-4 py-2 text-white" disabled={loading || !secret}>
                  <Save size={18} /> Save
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">Title</span>
                <input className="mt-1 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.title} onChange={(e) => update("title", e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">Slug</span>
                <input className="mt-1 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-[#153d39]">Description</span>
                <textarea className="mt-1 min-h-24 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.description} onChange={(e) => update("description", e.target.value)} required />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-[#153d39]">Markdown Content</span>
                <textarea className="mt-1 min-h-[420px] w-full rounded-md border border-[#ccd9d4] px-3 py-2 font-mono text-sm" value={form.markdown_content} onChange={(e) => update("markdown_content", e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">Course Image URL</span>
                <input className="mt-1 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.course_image} onChange={(e) => update("course_image", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">Upload Image</span>
                <span className="mt-1 flex items-center gap-2 rounded-md border border-[#ccd9d4] px-3 py-2">
                  <ImageUp size={18} />
                  <input type="file" accept="image/*" className="min-w-0" onChange={(e) => uploadImage(e.target.files?.[0] || null)} />
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">Author</span>
                <input className="mt-1 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.author} onChange={(e) => update("author", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">Category</span>
                <input className="mt-1 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.category} onChange={(e) => update("category", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">Reading Time</span>
                <input type="number" min="1" className="mt-1 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.reading_time} onChange={(e) => update("reading_time", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">Status</span>
                <select className="mt-1 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.status} onChange={(e) => update("status", e.target.value as Course["status"])}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-[#153d39]">Tags</span>
                <textarea className="mt-1 min-h-24 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">SEO Title</span>
                <input className="mt-1 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.seo_title} onChange={(e) => update("seo_title", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#153d39]">Canonical URL</span>
                <input className="mt-1 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.canonical_url} onChange={(e) => update("canonical_url", e.target.value)} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-[#153d39]">SEO Description</span>
                <textarea className="mt-1 min-h-24 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.seo_description} onChange={(e) => update("seo_description", e.target.value)} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-[#153d39]">SEO Keywords</span>
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-[#ccd9d4] px-3 py-2" value={form.seo_keywords} onChange={(e) => update("seo_keywords", e.target.value)} />
              </label>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
