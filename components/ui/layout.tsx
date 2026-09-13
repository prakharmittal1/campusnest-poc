import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("mx-auto w-full max-w-6xl px-5 sm:px-8", className)} {...props} />;
}

/** Section title with an optional one-line intro and a "see all" style link on the right. */
export function SectionHeading({
  title,
  description,
  link,
}: {
  title: ReactNode;
  description?: ReactNode;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h2 className="heading-lg">{title}</h2>
        {description && <p className="mt-2 max-w-xl text-[15px] text-muted">{description}</p>}
      </div>
      {link && (
        <Link href={link.href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          {link.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
