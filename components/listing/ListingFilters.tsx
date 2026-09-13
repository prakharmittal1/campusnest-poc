"use client";

import { LoaderCircle, SlidersHorizontal, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AMENITIES, FILTERABLE_AMENITIES } from "@/lib/amenities";
import { ROOM_CATEGORIES } from "@/lib/constants";
import { cx } from "@/lib/cx";
import type { ListingFilters as Filters } from "@/lib/filters";
import { periodLong } from "@/lib/format";
import { toggleValue, useQueryUpdater } from "./useQueryUpdater";

type ListingFiltersProps = {
  filters: Filters;
  universities: { slug: string; name: string }[];
  priceRange: { min: number; max: number };
  market: { currencySymbol: string; rentPeriod: string };
  resultCount: number;
  activeFilterCount: number;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    // The border lives on a wrapper: a <fieldset> border would run through its <legend>.
    <div className="border-b border-line py-5 first:pt-0 last:border-b-0">
      <fieldset>
        <legend className="mb-2.5 text-sm font-bold text-ink">{title}</legend>
        {children}
      </fieldset>
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-soft hover:text-ink">
      <input type="checkbox" className="size-4 accent-ink" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

const fieldClass =
  "block h-10 w-full min-w-0 rounded-control border border-line-strong bg-white px-3 text-sm text-ink focus:border-ink focus:outline-none";

export function ListingFilters({
  filters,
  universities,
  priceRange,
  market,
  resultCount,
  activeFilterCount,
}: ListingFiltersProps) {
  const { update, clear, isPending } = useQueryUpdater();
  const [mobileOpen, setMobileOpen] = useState(false);

  function applyPrice(form: HTMLFormElement) {
    const data = new FormData(form);
    update((params) => {
      for (const key of ["minPrice", "maxPrice"]) {
        const value = String(data.get(key) ?? "").trim();
        if (value) params.set(key, value);
        else params.delete(key);
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setMobileOpen(true)} className="lg:hidden">
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters{activeFilterCount > 0 && ` · ${activeFilterCount}`}
      </Button>

      <div
        className={cx(
          mobileOpen ? "fixed inset-0 z-50 flex flex-col bg-canvas" : "hidden",
          "lg:sticky lg:top-24 lg:block",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5 lg:mb-5 lg:h-auto lg:border-0 lg:px-0">
          <h2 className="heading-md flex items-center gap-2">
            Filters
            {isPending && <LoaderCircle className="size-3.5 animate-spin text-muted" aria-label="Updating" />}
          </h2>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button type="button" onClick={clear} className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="-mr-2 rounded-control p-2 text-muted hover:bg-surface lg:hidden"
              aria-label="Close filters"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 lg:max-h-[calc(100dvh-9rem)] lg:px-0 lg:pt-0">
          <Section title="Near university">
            <select
              value={filters.university ?? ""}
              onChange={(e) =>
                update((params) => {
                  const value = e.target.value;
                  if (value) params.set("university", value);
                  else params.delete("university");
                  // Distance sort only makes sense with a university; let it default either way.
                  params.delete("sort");
                })
              }
              className={fieldClass}
              aria-label="Near university"
            >
              <option value="">Any university</option>
              {universities.map((u) => (
                <option key={u.slug} value={u.slug}>
                  {u.name}
                </option>
              ))}
            </select>
          </Section>

          <Section title={`Price per ${periodLong(market)} (${market.currencySymbol})`}>
            <form
              // Remount when the URL changes (e.g. "Clear all") so inputs show the applied values.
              key={`${filters.minPrice}-${filters.maxPrice}`}
              onSubmit={(e) => {
                e.preventDefault();
                applyPrice(e.currentTarget);
              }}
              className="flex items-center gap-2"
            >
              <input
                name="minPrice"
                type="number"
                min={0}
                inputMode="numeric"
                defaultValue={filters.minPrice}
                placeholder={`${priceRange.min}`}
                aria-label="Minimum price"
                className={fieldClass}
              />
              <input
                name="maxPrice"
                type="number"
                min={0}
                inputMode="numeric"
                defaultValue={filters.maxPrice}
                placeholder={`${priceRange.max}`}
                aria-label="Maximum price"
                className={fieldClass}
              />
              <Button type="submit" variant="outline" className="shrink-0">
                Go
              </Button>
            </form>
          </Section>

          <Section title="Room type">
            {ROOM_CATEGORIES.map((category) => (
              <Checkbox
                key={category.value}
                label={category.label}
                checked={filters.rooms.includes(category.value)}
                onChange={() => update((params) => toggleValue(params, "room", category.value))}
              />
            ))}
          </Section>

          <Section title="Bills">
            <Checkbox
              label="All bills included"
              checked={filters.bills}
              onChange={() =>
                update((params) => {
                  if (filters.bills) params.delete("bills");
                  else params.set("bills", "1");
                })
              }
            />
          </Section>

          <Section title="Amenities">
            {FILTERABLE_AMENITIES.map((amenity) => (
              <Checkbox
                key={amenity}
                label={AMENITIES[amenity].label}
                checked={filters.amenities.includes(amenity)}
                onChange={() => update((params) => toggleValue(params, "amenity", amenity))}
              />
            ))}
          </Section>
        </div>

        <div className="border-t border-line p-4 lg:hidden">
          <Button size="lg" onClick={() => setMobileOpen(false)} className="w-full">
            {isPending ? "Updating…" : `Show ${resultCount} ${resultCount === 1 ? "home" : "homes"}`}
          </Button>
        </div>
      </div>
    </>
  );
}
