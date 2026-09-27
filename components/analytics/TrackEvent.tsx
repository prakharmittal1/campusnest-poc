"use client";

import { useEffect, useRef } from "react";
import { track, type TrackDetails } from "@/app/actions/track";
import type { ClientEventType } from "@/lib/tracking";

/**
 * Records a page-level journey step once it's actually shown in the browser (not on prefetch).
 * Records again when the details change, e.g. new filters on the same listing page.
 */
export function TrackEvent({ type, details }: { type: ClientEventType; details?: TrackDetails }) {
  const key = `${type}:${JSON.stringify(details ?? {})}`;
  const lastKey = useRef<string>(null);

  useEffect(() => {
    // The ref also stops React's development double-run of effects from logging twice.
    if (lastKey.current === key) return;
    lastKey.current = key;
    void track(type, details);
  }, [key, type, details]);

  return null;
}
