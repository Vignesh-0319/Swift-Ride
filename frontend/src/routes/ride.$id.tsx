import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RideMap } from "@/components/RideMap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Car, MapPin, Phone, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://swift-ride-b.onrender.com";

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
  requested: "Searching for an available driver…",
  accepted: "Driver accepted — heading to your location",
  in_progress: "Trip in progress",
  completed: "Ride completed successfully",
  cancelled: "This ride was cancelled",
};

function RideDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState<any>(null);
  const [driverLoc, setDriverLoc] = useState<any>(null);

  // Fetch ride schema status and coordinates from your MongoDB database
  const fetchRideStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/rides/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setRide(data);

        // If a driver has accepted, fetch their current location coordinates
        if (data.driver_id && ["accepted", "in_progress"].includes(data.status)) {
          fetchDriverLocation(data.driver_id);
        }
      } else if (res.status === 4404) {
        toast.error("Ride data records not found.");
      }
    } catch (err) {
      console.error("Error updating ride data parameters:", err);
    }
  };

  // Fetch coordinates from the driver_locations collection
  const fetchDriverLocation = async (driverId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/drivers/${driverId}/location`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const locData = await res.json();
        // Adjust for MongoDB GeoJSON format [lng, lat] or classic object structures {lat, lng}
        if (locData.coordinates) {
          setDriverLoc({
            lat: locData.coordinates[1],
            lng: locData.coordinates[0]
          });
        } else if (locData.lat && locData.lng) {
          setDriverLoc({ lat: locData.lat, lng: locData.lng });
        }
      }
    } catch (e) {
      console.error("Failed to query live locator matrices:", e);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Initial data load
    fetchRideStatus();

    // Poll your database every 4 seconds to sync tracking pins and trip state changes
    const pollInterval = setInterval(fetchRideStatus, 4000);
    return () => clearInterval(pollInterval);
  }, [id, user]);

  const cancel = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/rides/${id}/cancel`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });

      if (res.ok) {
        setRide((r: any) => ({ ...r, status: "cancelled" }));
        toast.success("Ride cancelled successfully");
        navigate({ to: "/book" });
      } else {
        toast.error("Unable to cancel this ride request.");
      }
    } catch (err) {
      toast.error("Network synchronization error.");
    }
  };

  if (!ride)
    return <main className="container mx-auto px-4 py-12 text-center text-muted-foreground animate-pulse">Synchronizing database tracks…</main>;

  const isMine = user?.id === ride.rider_id;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        
        {/* LEFT PANEL */}
        <Card className="p-6 border-border/50 bg-card/60 backdrop-blur">
          <Badge className={STATUS_COLORS[ride.status] || "bg-secondary text-secondary-foreground"}>
            {STATUS_LABEL[ride.status] || "Processing"}
          </Badge>

          <h1 className="mt-3 text-2xl font-bold">
            Ride #{String(ride.id || ride._id).slice(0, 6)}
          </h1>

          <div className="mt-6 space-y-3">
            <Row label="Pickup Address" value={ride.pickup_address || "Lat/Lng Coordinate Match"} />
            <Row label="Drop Destination" value={ride.drop_address || "Lat/Lng Coordinate Match"} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat label="Distance" value={`${Number(ride.distance_km || 0).toFixed(1)} km`} />
            <Stat label="Total Fare" value={`₹${ride.fare}`} highlight />
            <Stat label="Vehicle Option" value={String(ride.vehicle || 'economy').toUpperCase()} />
          </div>

          {["accepted", "in_progress"].includes(ride.status) && (
            <Card className="mt-6 p-4 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-primary animate-bounce" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">Driver Dispatch Assigned</div>
                  <div className="text-xs text-muted-foreground">Streaming positions via live server syncing…</div>
                </div>
                <Phone className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition" />
              </div>
            </Card>
          )}

          {isMine && ["requested", "accepted"].includes(ride.status) && (
            <Button className="mt-6 w-full" variant="destructive" onClick={cancel}>
              <X className="mr-2 h-4 w-4" /> Cancel ride request
            </Button>
          )}
        </Card>

        {/* MAP COMPONENT */}
        <div className="rounded-xl overflow-hidden border border-border/40 shadow-xl bg-card">
          <RideMap
            pickup={{ lat: Number(ride.pickup_lat), lng: Number(ride.pickup_lng) }}
            drop={{ lat: Number(ride.drop_lat), lng: Number(ride.drop_lng) }}
            driver={driverLoc}
            height={620}
          />
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm py-1 border-b border-border/10">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium max-w-[240px] truncate">{value}</span>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 border border-border/40 rounded-lg bg-background/40">
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className={highlight ? "font-bold text-lg text-primary" : "font-semibold text-sm text-foreground"}>
        {value}
      </div>
    </div>
  );
}
