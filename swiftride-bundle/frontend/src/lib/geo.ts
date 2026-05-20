// Haversine distance in km
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export const VEHICLE_RATES = {
  economy: { base: 30, perKm: 12, label: "Economy", eta: 4, seats: 4 },
  premium: { base: 60, perKm: 22, label: "Premium", eta: 6, seats: 4 },
  xl: { base: 80, perKm: 28, label: "XL", eta: 8, seats: 6 },
} as const;

export type VehicleKey = keyof typeof VEHICLE_RATES;

export function estimateFare(distanceKm: number, vehicle: VehicleKey) {
  const r = VEHICLE_RATES[vehicle];
  return Math.round(r.base + r.perKm * distanceKm);
}

// OSM Nominatim free geocoding
export async function searchPlaces(query: string): Promise<Array<{ display_name: string; lat: number; lng: number }>> {
  if (!query || query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((d: any) => ({ display_name: d.display_name, lat: parseFloat(d.lat), lng: parseFloat(d.lon) }));
}
