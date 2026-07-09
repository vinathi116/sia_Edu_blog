import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIA EDU Course Platform",
  description: "Production course platform powered by Next.js and Supabase."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
