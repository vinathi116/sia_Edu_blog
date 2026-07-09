import { NextRequest, NextResponse } from "next/server";
import { assertAdminSecret } from "@/lib/admin";
import { getAdminSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const unauthorized = assertAdminSecret(request);
  if (unauthorized) return unauthorized;

  const { data, error } = await getAdminSupabase()
    .from("course_platform_courses")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ courses: data || [] });
}

export async function POST(request: NextRequest) {
  const unauthorized = assertAdminSecret(request);
  if (unauthorized) return unauthorized;

  const payload = await request.json();
  const { data, error } = await getAdminSupabase()
    .from("course_platform_courses")
    .insert(payload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ course: data }, { status: 201 });
}
