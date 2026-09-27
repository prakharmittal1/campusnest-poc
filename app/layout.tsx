import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { ViewerProvider } from "@/components/auth/ViewerContext";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getViewer } from "@/lib/session";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// One variable font for everything keeps the page to a single font download.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("site");
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${site.name} — ${t("tagline")}`,
      template: `%s · ${site.name}`,
    },
    description: t("description"),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, viewer] = await Promise.all([getLocale(), getViewer()]);

  return (
    <html lang={locale} className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider>
          <ViewerProvider viewer={viewer}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <FeedbackButton />
          </ViewerProvider>
        </NextIntlClientProvider>
        {/* Vercel Web Analytics: page views and visitors. Only reports on Vercel deployments. */}
        <Analytics />
      </body>
    </html>
  );
}
