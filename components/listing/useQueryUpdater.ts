"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/** Applies a mutation to the current URL search params and navigates without scrolling. */
export function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function clear() {
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  return { searchParams, update, clear, isPending };
}

export function toggleValue(params: URLSearchParams, key: string, value: string) {
  const values = params.getAll(key);
  params.delete(key);
  const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
  next.forEach((v) => params.append(key, v));
}
