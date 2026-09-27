"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Viewer } from "@/lib/session";

const ViewerContext = createContext<Viewer | null>(null);

/** Makes the signed-in student available to client components (e.g. to pre-fill forms). */
export function ViewerProvider({ viewer, children }: { viewer: Viewer | null; children: ReactNode }) {
  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>;
}

export function useViewer(): Viewer | null {
  return useContext(ViewerContext);
}
