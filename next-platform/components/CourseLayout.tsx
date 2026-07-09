import type { Course, TocItem } from "@/lib/types";
import { ReadingProgress } from "./ReadingProgress";
import { StickyTOC } from "./StickyTOC";
import { HeroBanner } from "./HeroBanner";

export function CourseLayout({
  course,
  toc,
  children
}: {
  course: Course;
  toc: TocItem[];
  children: React.ReactNode;
}) {
  return (
    <main>
      <ReadingProgress />
      <HeroBanner course={course} />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[280px_1fr]">
        <StickyTOC toc={toc} />
        {children}
      </div>
    </main>
  );
}
