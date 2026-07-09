import { NextRequest, NextResponse } from "next/server";
import { assertAdminSecret } from "@/lib/admin";
import { getAdminSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const unauthorized = assertAdminSecret(request);
  if (unauthorized) return unauthorized;

  const form = await request.formData();
  const file = form.get("file");
  const slug = String(form.get("slug") || "course").replace(/[^a-z0-9-]/gi, "-").toLowerCase();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "webp";
  const path = `${slug}/${crypto.randomUUID()}.${extension}`;
  const supabase = getAdminSupabase();
  const { error } = await supabase.storage.from("course-assets").upload(path, file, {
    contentType: file.type,
    upsert: false
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data } = supabase.storage.from("course-assets").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
