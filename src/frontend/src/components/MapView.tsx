import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { VenueMatch } from "@ail/shared";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { Origin } from "@/utils/origins";

interface Props {
  origin: Origin;
  venues: VenueMatch[];
  selectedId: string | null;
  onSelect: (venueId: string) => void;
}

/** Re-centres the map when the starting point changes, or flies to the selected venue. */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom());
  }, [map, lat, lng]);
  return null;
}

export function MapView({ origin, venues, selectedId, onSelect }: Props) {
  const selected = venues.find((v) => v.venue.id === selectedId)?.venue ?? null;
  const focus = selected ?? origin;

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={15}
      // isolate: Leaflet gives its inner layers z-index 400 to 1000. Without a stacking context of its
      // own the map is painted above popups (such as the coupons dialog), cutting them off.
      className="relative isolate z-0 h-64 w-full rounded-lg md:h-[32rem]"
      scrollWheelZoom={false}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <Recenter lat={focus.lat} lng={focus.lng} />
      <CircleMarker center={[origin.lat, origin.lng]} radius={7} pathOptions={{ color: "#2563eb" }}>
        <Tooltip>{origin.label}</Tooltip>
      </CircleMarker>
      {venues.map((v) => {
        const isSelected = v.venue.id === selectedId;
        const hasMatch = v.matchedCount > 0;
        return (
          <CircleMarker
            key={v.venue.id}
            center={[v.venue.lat, v.venue.lng]}
            radius={isSelected ? 13 : 9}
            pathOptions={{
              color: hasMatch ? "#16a34a" : "#6b7280",
              weight: isSelected ? 4 : 2,
              fillOpacity: isSelected ? 0.7 : 0.3,
            }}
            eventHandlers={{ click: () => onSelect(v.venue.id) }}
          >
            <Tooltip>{v.venue.name}</Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
