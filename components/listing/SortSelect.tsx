"use client";

import { useTranslations } from "next-intl";
import { SORT_OPTIONS, type SortOption } from "@/lib/constants";
import { useQueryUpdater } from "./useQueryUpdater";

export function SortSelect({ value, hasUniversity }: { value: SortOption; hasUniversity: boolean }) {
  const t = useTranslations("sort");
  const { update } = useQueryUpdater();
  const options = SORT_OPTIONS.filter((o) => o !== "distance" || hasUniversity);

  return (
    <select
      value={value}
      onChange={(e) => update((params) => params.set("sort", e.target.value))}
      className="h-9 rounded-control border-0 bg-white pl-3 pr-8 text-sm font-medium text-ink ring-1 ring-inset ring-line-strong focus:outline-none focus:ring-2 focus:ring-ink"
      aria-label={t("label")}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {t(option)}
        </option>
      ))}
    </select>
  );
}
