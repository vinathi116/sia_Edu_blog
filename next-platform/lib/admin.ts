import { NextRequest, NextResponse } from "next/server";

export function assertAdminSecret(request: NextRequest) {
  const configured = process.env.COURSE_ADMIN_SECRET;
  const provided = request.headers.get("x-admin-secret");

  if (!configured || provided !== configured) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  return null;
}
