import { NextRequest, NextResponse } from "next/server";
import { assertAdminSecret } from "@/lib/admin";
import { getAdminSupabase } from "@/lib/supabase";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  const unauthorized = assertAdminSecret(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const payload = await request.json();
  const { data, error } = await getAdminSupabase()
    .from("course_platform_courses")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ course: data });
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const unauthorized = assertAdminSecret(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const { error } = await getAdminSupabase().from("course_platform_courses").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
