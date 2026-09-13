"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EnquiryModal } from "@/components/enquiry/EnquiryModal";

type NavCountry = { slug: string; name: string; cities: { slug: string; name: string }[] };

export function MobileNav({ countries }: { countries: NavCountry[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="-mr-2 rounded-control p-2 text-ink hover:bg-surface"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Destinations"
          className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-canvas px-5 pb-6"
        >
          {countries.map((country) => (
            <div key={country.slug} className="border-b border-line py-4">
              <Link href={`/${country.slug}`} onClick={close} className="text-xs font-semibold uppercase tracking-wider text-muted">
                {country.name}
              </Link>
              <ul className="mt-2 space-y-1">
                {country.cities.map((city) => (
                  <li key={city.slug}>
                    <Link href={`/${country.slug}/${city.slug}`} onClick={close} className="block py-1 text-lg font-semibold">
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <EnquiryModal size="lg" className="mt-6 w-full">
            Get expert help
          </EnquiryModal>
        </nav>
      )}
    </div>
  );
}
