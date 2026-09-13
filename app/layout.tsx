import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { site } from "@/lib/site";
import "./globals.css";

// One variable font for everything keeps the page to a single font download.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Absolute base for share-image URLs: explicit setting, else Vercel's production domain, else local.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FeedbackButton />
      </body>
    </html>
  );
}
