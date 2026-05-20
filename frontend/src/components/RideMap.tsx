import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Fix default icons for Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pickupIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:oklch(0.78 0.18 65);border:3px solid white;box-shadow:0 0 0 4px oklch(0.78 0.18 65 / 0.3)"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});
const dropIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:3px;background:oklch(0.65 0.2 25);border:3px solid white;box-shadow:0 0 0 4px oklch(0.65 0.2 25 / 0.3)"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});
const carIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:oklch(0.78 0.18 65);border:3px solid white;box-shadow:0 6px 20px oklch(0.78 0.18 65 / 0.5);font-size:18px">🚗</div>`,
  iconSize: [34, 34], iconAnchor: [17, 17],
});

type LatLng = { lat: number; lng: number };

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) { map.setView([points[0].lat, points[0].lng], 14); return; }
    const b = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(b, { padding: [50, 50] });
  }, [points, map]);
  return null;
}

export function RideMap({
  pickup, drop, driver, height = 420,
}: { pickup?: LatLng | null; drop?: LatLng | null; driver?: LatLng | null; height?: number }) {
  const center: [number, number] = pickup ? [pickup.lat, pickup.lng] : [28.6139, 77.209]; // Delhi default
  const points = [pickup, drop, driver].filter(Boolean) as LatLng[];

  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {drop && <Marker position={[drop.lat, drop.lng]} icon={dropIcon} />}
        {driver && <Marker position={[driver.lat, driver.lng]} icon={carIcon} />}
        {pickup && drop && (
          <Polyline positions={[[pickup.lat, pickup.lng], [drop.lat, drop.lng]]} pathOptions={{ color: "oklch(0.78 0.18 65)", weight: 4, opacity: 0.85, dashArray: "10,10" }} />
        )}
        {driver && pickup && (
          <Polyline positions={[[driver.lat, driver.lng], [pickup.lat, pickup.lng]]} pathOptions={{ color: "oklch(0.72 0.17 155)", weight: 3, opacity: 0.9 }} />
        )}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}
