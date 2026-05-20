import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RideMap } from "@/components/RideMap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Car, MapPin, Phone, X } from "lucide-react";

export const Route = createFileRoute("/ride/$id")({
  component: RideDetail,
});

const STATUS_COLORS: Record<string, string> = {
  requested: "bg-warning/20 text-warning border-warning/30",
  accepted: "bg-primary/20 text-primary border-primary/30",
  in_progress: "bg-success/20 text-success border-success/30",
  completed: "bg-success/20 text-success border-success/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Searching for a driver…",
  accepted: "Driver accepted — heading to you",
  in_progress: "Ride in progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function RideDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState<any>(null);
  const [driverLoc, setDriverLoc] = useState<any>(null);
  const simRef = useRef<number | null>(null);

  // 🧠 Fake ride data (since no DB)
  useEffect(() => {
    const fakeRide = {
      id,
      rider_id: user?.id,
      pickup_address: "Pickup Location",
      drop_address: "Drop Location",
      pickup_lat: 28.6139,
      pickup_lng: 77.2090,
      drop_lat: 28.5355,
      drop_lng: 77.3910,
      distance_km: 8.5,
      fare: 120,
      vehicle: "economy",
      status: "requested",
    };

    setRide(fakeRide);
  }, [id, user]);

  // 🚕 Simulated driver movement
  useEffect(() => {
    if (!ride || ride.status !== "requested") return;

    const start = {
      lat: ride.pickup_lat + 0.02,
      lng: ride.pickup_lng + 0.02,
    };

    setDriverLoc(start);

    setTimeout(() => {
      setRide((r: any) => ({ ...r, status: "accepted" }));

      let step = 0;
      const total = 40;

      simRef.current = window.setInterval(() => {
        step++;
        const t = step / total;

        setDriverLoc({
          lat: start.lat + (ride.pickup_lat - start.lat) * t,
          lng: start.lng + (ride.pickup_lng - start.lng) * t,
        });

        if (step >= total) {
          if (simRef.current) clearInterval(simRef.current);

          setRide((r: any) => ({ ...r, status: "in_progress" }));

          setTimeout(() => {
            setRide((r: any) => ({ ...r, status: "completed" }));
          }, 4000);
        }
      }, 400);
    }, 3000);

    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, [ride]);

  const cancel = () => {
    setRide((r: any) => ({ ...r, status: "cancelled" }));
    toast.success("Ride cancelled");
    navigate({ to: "/book" });
  };

  if (!ride)
    return <main className="container mx-auto px-4 py-12">Loading ride…</main>;

  const isMine = user?.id === ride.rider_id;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        
        {/* LEFT PANEL */}
        <Card className="p-6">
          <Badge className={STATUS_COLORS[ride.status]}>
            {STATUS_LABEL[ride.status]}
          </Badge>

          <h1 className="mt-3 text-2xl font-bold">
            Ride #{String(ride.id).slice(0, 6)}
          </h1>

          <div className="mt-6 space-y-3">
            <Row label="Pickup" value={ride.pickup_address} />
            <Row label="Drop" value={ride.drop_address} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat label="Distance" value={`${ride.distance_km} km`} />
            <Stat label="Fare" value={`₹${ride.fare}`} highlight />
            <Stat label="Vehicle" value={ride.vehicle.toUpperCase()} />
          </div>

          {ride.status === "accepted" && (
            <Card className="mt-6 p-4">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5" />
                <div className="flex-1">
                  <div className="font-semibold">Driver assigned</div>
                  <div className="text-xs">Tracking live…</div>
                </div>
                <Phone className="h-4 w-4" />
              </div>
            </Card>
          )}

          {isMine && ["requested", "accepted"].includes(ride.status) && (
            <Button className="mt-6 w-full" onClick={cancel}>
              <X className="mr-2 h-4 w-4" /> Cancel ride
            </Button>
          )}
        </Card>

        {/* MAP */}
        <RideMap
          pickup={{ lat: ride.pickup_lat, lng: ride.pickup_lng }}
          drop={{ lat: ride.drop_lat, lng: ride.drop_lng }}
          driver={driverLoc}
          height={620}
        />
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="text-xs">{label}</div>
      <div className={highlight ? "font-bold text-primary" : "font-semibold"}>
        {value}
      </div>
    </div>
  );
}