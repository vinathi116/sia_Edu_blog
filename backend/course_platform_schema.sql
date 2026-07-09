-- Production course-platform schema for Supabase/Postgres.
-- Safe by design: this file creates isolated course-platform tables only.
-- It does not alter auth, users, roles, payments, enrollments, or legacy Django tables.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.course_platform_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    markdown_content TEXT NOT NULL,
    course_image TEXT NOT NULL DEFAULT '',
    table_of_contents JSONB NOT NULL DEFAULT '[]'::jsonb,
    publish_date TIMESTAMPTZ,
    author TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    reading_time INTEGER NOT NULL DEFAULT 1,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    seo_keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    canonical_url TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished', 'archived')),
    is_published BOOLEAN GENERATED ALWAYS AS (status = 'published') STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_platform_course_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.course_platform_courses(id) ON DELETE CASCADE,
    storage_bucket TEXT NOT NULL DEFAULT 'course-assets',
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL DEFAULT '',
    alt_text TEXT NOT NULL DEFAULT '',
    caption TEXT NOT NULL DEFAULT '',
    asset_kind TEXT NOT NULL DEFAULT 'image' CHECK (asset_kind IN ('image', 'diagram', 'document', 'video')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_platform_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.course_platform_courses(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    actor_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS course_platform_courses_status_idx
    ON public.course_platform_courses (status, publish_date DESC);

CREATE INDEX IF NOT EXISTS course_platform_courses_slug_idx
    ON public.course_platform_courses (slug);

CREATE INDEX IF NOT EXISTS course_platform_courses_tags_idx
    ON public.course_platform_courses USING GIN (tags);

CREATE INDEX IF NOT EXISTS course_platform_courses_toc_idx
    ON public.course_platform_courses USING GIN (table_of_contents);

CREATE OR REPLACE FUNCTION public.set_course_platform_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_course_platform_courses_updated_at ON public.course_platform_courses;
CREATE TRIGGER set_course_platform_courses_updated_at
BEFORE UPDATE ON public.course_platform_courses
FOR EACH ROW
EXECUTE FUNCTION public.set_course_platform_updated_at();

ALTER TABLE public.course_platform_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_platform_course_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_platform_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published courses are public" ON public.course_platform_courses;
CREATE POLICY "Published courses are public"
ON public.course_platform_courses
FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated admins can manage courses" ON public.course_platform_courses;
CREATE POLICY "Authenticated admins can manage courses"
ON public.course_platform_courses
FOR ALL
TO authenticated
USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    OR COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
)
WITH CHECK (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    OR COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
);

DROP POLICY IF EXISTS "Published course assets are public" ON public.course_platform_course_assets;
CREATE POLICY "Published course assets are public"
ON public.course_platform_course_assets
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.course_platform_courses c
        WHERE c.id = course_platform_course_assets.course_id
          AND c.status = 'published'
    )
);

DROP POLICY IF EXISTS "Authenticated admins can manage assets" ON public.course_platform_course_assets;
CREATE POLICY "Authenticated admins can manage assets"
ON public.course_platform_course_assets
FOR ALL
TO authenticated
USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    OR COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
)
WITH CHECK (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    OR COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
);

DROP POLICY IF EXISTS "Authenticated admins can view audit log" ON public.course_platform_audit_log;
CREATE POLICY "Authenticated admins can view audit log"
ON public.course_platform_audit_log
FOR SELECT
TO authenticated
USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    OR COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
);
