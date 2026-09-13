"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SelectedRoom = { room: string; setRoom: (room: string) => void };

const SelectedRoomContext = createContext<SelectedRoom | null>(null);

/** Lets a room's "Enquire" button pre-select that room in the property's enquiry form. */
export function SelectedRoomProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState("");
  return <SelectedRoomContext.Provider value={{ room, setRoom }}>{children}</SelectedRoomContext.Provider>;
}

export function useSelectedRoom(): SelectedRoom | null {
  return useContext(SelectedRoomContext);
}
