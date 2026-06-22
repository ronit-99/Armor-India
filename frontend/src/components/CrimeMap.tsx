"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";

interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  type: string;
  district: string;
  count: number;
  severity: string;
  category: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
};

export default function CrimeMap({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <MapContainer center={[28.6139, 77.35]} zoom={10} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {hotspots.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.lat, h.lng]}
          radius={Math.sqrt(h.count) * 1.5}
          pathOptions={{
            color: SEVERITY_COLORS[h.severity] || "#6b7280",
            fillColor: SEVERITY_COLORS[h.severity] || "#6b7280",
            fillOpacity: 0.6,
          }}
        >
          <Tooltip>
            {h.district}: {h.count} ({h.category})
          </Tooltip>
          <Popup>
            <strong>{h.district}</strong>
            <br />
            Type: {h.type.replace("_", " ")}
            <br />
            Count: {h.count}
            <br />
            Category: {h.category}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
