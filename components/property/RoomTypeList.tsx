"use client";

import { useSelectedRoom } from "@/components/enquiry/SelectedRoomContext";
import { Button } from "@/components/ui/Button";
import { roomCategoryLabel } from "@/lib/constants";
import { formatMoney, formatTenancy, periodShort } from "@/lib/format";

type Room = {
  id: number;
  name: string;
  category: string;
  sizeSqm: number;
  price: number;
  tenancyWeeks: number;
  available: boolean;
};

type RoomTypeListProps = {
  rooms: Room[];
  market: { currencySymbol: string; rentPeriod: string };
};

export function RoomTypeList({ rooms, market }: RoomTypeListProps) {
  const selected = useSelectedRoom();

  function enquire(roomName: string) {
    selected?.setRoom(roomName);
    const form = document.getElementById("enquire");
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
    form?.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true });
  }

  return (
    <ul className="border-t border-line">
      {rooms.map((room) => (
        <li key={room.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line py-5">
          <div className={room.available ? "" : "opacity-50"}>
            <h3 className="text-[15px] font-bold text-ink">{room.name}</h3>
            <p className="mt-0.5 text-sm text-muted">
              {roomCategoryLabel(room.category)} · {room.sizeSqm} m² · {formatTenancy(room.tenancyWeeks, market)}
            </p>
          </div>

          <div className="flex items-center gap-5">
            <p className="text-sm text-muted">
              {room.available ? (
                <>
                  <span className="text-lg font-extrabold text-ink">{formatMoney(room.price, market)}</span> /{periodShort(market)}
                </>
              ) : (
                "Sold out"
              )}
            </p>
            <Button
              variant={room.available ? "primary" : "outline"}
              size="sm"
              onClick={() => enquire(room.name)}
            >
              {room.available ? "Enquire" : "Join waitlist"}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
