import { createClient } from "@supabase/supabase-js";
import type { Course } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getPublicSupabase() {
  if (!supabaseUrl || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.");
  }
  return createClient(supabaseUrl, anonKey);
}

export function getAdminSupabase() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function getPublishedCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await getPublicSupabase()
    .from("course_platform_courses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Course;
}

export async function getPublishedCourses(): Promise<Course[]> {
  const { data, error } = await getPublicSupabase()
    .from("course_platform_courses")
    .select("*")
    .eq("status", "published")
    .order("publish_date", { ascending: false });

  if (error) throw error;
  return (data || []) as Course[];
}
