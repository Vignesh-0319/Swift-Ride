import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RideMap } from "@/components/RideMap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  searchPlaces,
  haversineKm,
  estimateFare,
  VEHICLE_RATES,
  type VehicleKey,
} from "@/lib/geo";
import { toast } from "sonner";
import { MapPin, Search, Clock, Users } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://swift-ride-b.onrender.com";

export const Route = createFileRoute("/book")({ component: BookPage });

type Place = { display_name: string; lat: number; lng: number };

function BookPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const [pickupQ, setPickupQ] = useState("");
  const [dropQ, setDropQ] = useState("");
  const [pickupOpts, setPickupOpts] = useState<Place[]>([]);
  const [dropOpts, setDropOpts] = useState<Place[]>([]);
  const [pickup, setPickup] = useState<Place | null>(null);
  const [drop, setDrop] = useState<Place | null>(null);
  const [vehicle, setVehicle] = useState<VehicleKey>("economy");
  const [submitting, setSubmitting] = useState(false);

  // 🔍 Search pickup
  useEffect(() => {
    const t = setTimeout(async () => {
      if (pickupQ && (!pickup || pickup.display_name !== pickupQ)) {
        setPickupOpts(await searchPlaces(pickupQ));
      }
    }, 350);
    return () => clearTimeout(t);
  }, [pickupQ, pickup]);

  // 🔍 Search drop
  useEffect(() => {
    const t = setTimeout(async () => {
      if (dropQ && (!drop || drop.drop_name !== dropQ)) {
        setDropOpts(await searchPlaces(dropQ));
      }
    }, 350);
    return () => clearTimeout(t);
  }, [dropQ, drop]);

  const distance = pickup && drop ? haversineKm(pickup, drop) : 0;
  const fare = pickup && drop ? estimateFare(distance, vehicle) : 0;

  // 🚕 Production Ride Request Dispatch Pipeline
  const requestRide = async () => {
    if (!user || !pickup || !drop) {
      toast.error("Please provide valid coordinates before requesting.");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE}/api/rides/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rider_id: user.id || user._id,
          pickup_address: pickup.display_name,
          drop_address: drop.display_name,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          drop_lat: drop.lat,
          drop_lng: drop.lng,
          distance_km: parseFloat(distance.toFixed(2)),
          fare: fare,
          vehicle: vehicle
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Ride requested! Searching for an available driver...");
        // Route parameter navigation maps smoothly to either backend field notation
        const trackingId = data.ride._id || data.ride.id;
        navigate({ to: "/ride/$id", params: { id: String(trackingId) } });
      } else {
        toast.error(data.message || "Failed to post ride logs to the cloud.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network sync lost during dispatch sequence.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        
        {/* LEFT PANEL */}
        <Card className="border-border/50 bg-card/60 p-6 backdrop-blur">
          <h1 className="font-display text-2xl font-bold">Book a ride</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter pickup and drop, choose vehicle, confirm.
          </p>

          {/* LOCATION INPUTS */}
          <div className="mt-6 space-y-4">
            <PlaceField
              label="Pickup"
              value={pickupQ}
              onChange={(v) => {
                setPickupQ(v);
                setPickup(null);
              }}
              options={pickupOpts}
              onSelect={(p) => {
                setPickup(p);
                setPickupQ(p.display_name);
                setPickupOpts([]);
              }}
              dotColor="oklch(0.78 0.18 65)"
            />

            <PlaceField
              label="Drop"
              value={dropQ}
              onChange={(v) => {
                setDropQ(v);
                setDrop(null);
              }}
              options={dropOpts}
              onSelect={(p) => {
                setDrop(p);
                setDropQ(p.display_name);
                setDropOpts([]);
              }}
              dotColor="oklch(0.65 0.2 25)"
            />
          </div>

          {/* VEHICLE SELECTION */}
          <div className="mt-6">
            <Label>Choose vehicle</Label>
            <div className="mt-2 grid gap-2">
              {(Object.keys(VEHICLE_RATES) as VehicleKey[]).map((k) => {
                const r = VEHICLE_RATES[k];
                const f = pickup && drop ? estimateFare(distance, k) : null;

                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setVehicle(k)}
                    className={`flex items-center justify-between rounded-lg border p-3 transition ${
                      vehicle === k
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-background/40 hover:bg-background/70"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-sm">{r.label}</div>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {r.eta} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {r.seats}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm text-foreground">
                        {f !== null ? `₹${f}` : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ₹{r.perKm}/km
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FARE METRICS SUMMARY */}
          {pickup && drop && (
            <div className="mt-6 rounded-lg border border-border/40 bg-background/20 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium text-foreground">{distance.toFixed(1)} km</span>
              </div>
              <div className="mt-1 flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Estimated fare</span>
                <span className="text-xl font-bold text-primary">
                  ₹{fare}
                </span>
              </div>
            </div>
          )}

          {/* ACTION BUTTON */}
          <Button
            className="mt-6 w-full font-medium"
            disabled={!pickup || !drop || submitting}
            onClick={requestRide}
          >
            {submitting ? "Requesting dispatch..." : "Confirm ride booking"}
          </Button>
        </Card>

        {/* GEOSPATIAL RENDER CANVAS */}
        <div className="rounded-xl overflow-hidden border border-border/40 bg-card shadow-lg">
          <RideMap pickup={pickup} drop={drop} height={620} />
        </div>
      </div>
    </main>
  );
}

function PlaceField({
  label,
  value,
  onChange,
  options,
  onSelect,
  dotColor,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Place[];
  onSelect: (p: Place) => void;
  dotColor: string;
}) {
  return (
    <div className="relative">
      <Label className="text-xs font-medium text-muted-foreground">{label} Location</Label>

      <div className="relative mt-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 text-sm"
          placeholder={`Enter ${label.toLowerCase()} landmarks...`}
        />
      </div>

      {options.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-popover/95 backdrop-blur-md border border-border/60 rounded-md shadow-xl max-h-60 overflow-auto">
          {options.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(o)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs hover:bg-accent/40 border-b border-border/10 last:border-0"
            >
              <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
              <span className="truncate text-foreground/90">{o.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
