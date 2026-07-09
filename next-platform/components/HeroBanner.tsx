import { CalendarDays, Clock, Tags } from "lucide-react";
import type { Course } from "@/lib/types";
import { ImageCard } from "./ImageCard";

export function HeroBanner({ course }: { course: Course }) {
  const published = course.publish_date
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(course.publish_date))
    : "Draft";

  return (
    <header className="bg-[#eaf4f1]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#a35600]">{course.category}</p>
          <h1 className="max-w-4xl text-[clamp(2.35rem,6vw,5.4rem)] font-black leading-[0.95] text-[#0d302f]">
            {course.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#425b58]">{course.description}</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm text-[#425b58]">
            <span className="inline-flex items-center gap-2 rounded-md border border-[#c8d8d2] bg-white px-3 py-2">
              <Clock size={16} /> {course.reading_time} min read
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-[#c8d8d2] bg-white px-3 py-2">
              <CalendarDays size={16} /> {published}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-[#c8d8d2] bg-white px-3 py-2">
              <Tags size={16} /> {course.tags.slice(0, 3).join(", ")}
            </span>
          </div>
        </div>
        <ImageCard
          src={course.course_image || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1600&auto=format&fit=crop"}
          alt="Futuristic quantum computing learning lab"
          caption="HDQS course environment for quantum circuits, hybrid workflows, and applied experimentation."
          priority
        />
      </div>
    </header>
  );
}
