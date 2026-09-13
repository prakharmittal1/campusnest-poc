"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { MapPoint } from "./LeafletMap";

// Leaflet touches `window` on import, so it can only load in the browser.
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

/** Placeholder until the map scrolls near the viewport, so Leaflet (~45 KB) isn't downloaded up front. */
export function MapView({ property, universities }: { property: MapPoint; universities: MapPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-80 overflow-hidden rounded-card bg-surface">
      {visible && <LeafletMap property={property} universities={universities} />}
    </div>
  );
}
