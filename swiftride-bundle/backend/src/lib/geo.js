// Haversine distance in km
export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const TIERS = {
  economy: { base: 2.5, perKm: 1.1, perMin: 0.2, eta: 4 },
  premium: { base: 4.0, perKm: 1.8, perMin: 0.3, eta: 6 },
  xl:      { base: 5.0, perKm: 2.2, perMin: 0.35, eta: 8 },
};

export function estimateFare(distanceKm, vehicle = "economy") {
  const t = TIERS[vehicle] || TIERS.economy;
  const minutes = Math.max(5, distanceKm * 2.2);
  const fare = t.base + distanceKm * t.perKm + minutes * t.perMin;
  return {
    vehicle,
    distanceKm: Number(distanceKm.toFixed(2)),
    minutes: Math.round(minutes),
    fare: Number(fare.toFixed(2)),
    etaMinutes: t.eta,
  };
}

export const VEHICLES = Object.keys(TIERS);
