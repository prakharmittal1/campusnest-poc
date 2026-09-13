"use client";

import { latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

export type MapPoint = { name: string; lat: number; lng: number };

// Kept in sync with --color-ink / --color-accent in globals.css (Leaflet needs literal values).
const INK = "#0f1b2d";
const ACCENT = "#ffc629";

export default function LeafletMap({ property, universities }: { property: MapPoint; universities: MapPoint[] }) {
  const bounds = latLngBounds([property, ...universities].map((p) => [p.lat, p.lng]));

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [48, 48], maxZoom: 15 }}
      scrollWheelZoom={false}
      className="size-full"
    >
      {/* OpenStreetMap tiles, greyed out in globals.css so the yellow pin stands out. See README for production tile options. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {universities.map((u) => (
        <CircleMarker
          key={u.name}
          center={[u.lat, u.lng]}
          radius={6}
          pathOptions={{ color: "#ffffff", fillColor: INK, fillOpacity: 1, weight: 2 }}
        >
          <Tooltip>{u.name}</Tooltip>
        </CircleMarker>
      ))}
      <CircleMarker
        center={[property.lat, property.lng]}
        radius={10}
        pathOptions={{ color: INK, fillColor: ACCENT, fillOpacity: 1, weight: 3 }}
      >
        <Tooltip permanent direction="top" offset={[0, -10]}>
          {property.name}
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
