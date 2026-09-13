"use client";

import { SORT_OPTIONS, type SortOption } from "@/lib/constants";
import { useQueryUpdater } from "./useQueryUpdater";

export function SortSelect({ value, hasUniversity }: { value: SortOption; hasUniversity: boolean }) {
  const { update } = useQueryUpdater();
  const options = SORT_OPTIONS.filter((o) => o.value !== "distance" || hasUniversity);

  return (
    <select
      value={value}
      onChange={(e) => update((params) => params.set("sort", e.target.value))}
      className="h-9 rounded-control border-0 bg-white pl-3 pr-8 text-sm font-medium text-ink ring-1 ring-inset ring-line-strong focus:outline-none focus:ring-2 focus:ring-ink"
      aria-label="Sort homes"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
