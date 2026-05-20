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
      if (dropQ && (!drop || drop.display_name !== dropQ)) {
        setDropOpts(await searchPlaces(dropQ));
      }
    }, 350);
    return () => clearTimeout(t);
  }, [dropQ, drop]);

  const distance = pickup && drop ? haversineKm(pickup, drop) : 0;
  const fare = pickup && drop ? estimateFare(distance, vehicle) : 0;

  // 🚕 Simulated ride request
  const requestRide = async () => {
    if (!user || !pickup || !drop) return;

    setSubmitting(true);

    setTimeout(() => {
      const fakeRideId = Math.random().toString(36).substring(2, 9);

      toast.success("Ride requested! Searching for a driver...");
      setSubmitting(false);

      navigate({ to: "/ride/$id", params: { id: fakeRideId } });
    }, 1000);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        
        {/* LEFT PANEL */}
        <Card className="border-border/50 bg-card/60 p-6">
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
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      vehicle === k
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background/40 hover:bg-background/70"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{r.label}</div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {r.eta} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {r.seats}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold">
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

          {/* FARE */}
          {pickup && drop && (
            <div className="mt-6 rounded-lg border bg-background/40 p-4">
              <div className="flex justify-between text-sm">
                <span>Distance</span>
                <span>{distance.toFixed(1)} km</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Estimated fare</span>
                <span className="text-xl font-bold text-primary">
                  ₹{fare}
                </span>
              </div>
            </div>
          )}

          {/* BUTTON */}
          <Button
            className="mt-6 w-full"
            disabled={!pickup || !drop || submitting}
            onClick={requestRide}
          >
            {submitting ? "Requesting..." : "Request ride"}
          </Button>
        </Card>

        {/* MAP */}
        <div>
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
      <Label>{label}</Label>

      <div className="relative mt-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
          placeholder={`Search ${label.toLowerCase()}...`}
        />
      </div>

      {options.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(o)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-accent/30"
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span>{o.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}