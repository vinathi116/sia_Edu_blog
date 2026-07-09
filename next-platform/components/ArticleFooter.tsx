import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function ArticleFooter() {
  return (
    <footer className="mt-12 border-t border-[#dbe5df] pt-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-[#dbe5df] bg-white p-4 text-[#153d39]">
          <ArrowLeft size={18} />
          Course home
        </Link>
        <Link
          href="/admin/courses"
          className="inline-flex items-center justify-between gap-2 rounded-lg border border-[#dbe5df] bg-white p-4 text-[#153d39]"
        >
          Admin dashboard
          <ArrowRight size={18} />
        </Link>
      </div>
    </footer>
  );
}
