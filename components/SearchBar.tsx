"use client";

import { Building, Globe, GraduationCap, LoaderCircle, MapPin, Search, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { buttonClass } from "@/components/ui/Button";
import type { SearchResult } from "@/lib/constants";
import { cx } from "@/lib/cx";

const TYPE_ICONS: Record<SearchResult["type"], LucideIcon> = {
  country: Globe,
  city: MapPin,
  university: GraduationCap,
  property: Building,
};

export function SearchBar({ placeholder = "City, university or property" }: { placeholder?: string }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const request = useRef<AbortController>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      request.current?.abort();
    },
    [],
  );

  function handleChange(value: string) {
    setQuery(value);
    setActive(-1);
    setOpen(true);
    clearTimeout(timer.current);
    request.current?.abort();

    const term = value.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timer.current = setTimeout(async () => {
      const controller = new AbortController();
      request.current = controller;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setLoading(false);
      } catch (error) {
        // An aborted request was superseded by newer typing; that request owns the loading state.
        if ((error as Error).name === "AbortError") return;
        setResults([]);
        setLoading(false);
      }
    }, 200);
  }

  function go(result: SearchResult) {
    setOpen(false);
    setQuery(result.label);
    router.push(result.href);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const choice = results[active] ?? results[0];
      if (choice) go(choice);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && query.trim().length >= 2;

  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        // Enter is handled in onKeyDown; this covers the Search button.
        e.preventDefault();
        const choice = results[active] ?? results[0];
        if (choice) go(choice);
      }}
    >
      <div className="flex items-center rounded-card bg-white p-1.5 pl-4 shadow-sm ring-1 ring-line-strong transition-shadow focus-within:ring-2 focus-within:ring-ink">
        <Search className="size-4.5 shrink-0 text-muted" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder={placeholder}
          aria-label={placeholder}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink placeholder:text-muted focus:outline-none"
        />
        {loading && <LoaderCircle className="mr-2 size-4 animate-spin text-muted" aria-hidden />}
        <button type="submit" className={buttonClass({ variant: "accent", size: "lg" })}>
          Search
        </button>
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-card bg-white p-1.5 text-left shadow-lg ring-1 ring-line"
        >
          {results.map((result, i) => {
            const Icon = TYPE_ICONS[result.type];
            return (
              <li
                key={`${result.type}-${result.href}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // Keep focus in the input so blur doesn't close the list before the click lands.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(result)}
                onMouseEnter={() => setActive(i)}
                className={cx("flex cursor-pointer items-center gap-3 rounded-control px-3 py-2", i === active && "bg-surface")}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-surface text-ink-soft">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{result.label}</span>
                  <span className="block truncate text-xs capitalize text-muted">
                    {result.type} · {result.sublabel}
                  </span>
                </span>
              </li>
            );
          })}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-muted">No matches for “{query.trim()}”.</li>
          )}
        </ul>
      )}
    </form>
  );
}
