import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Radio, Navigation } from "lucide-react";

// Pull the live backend base URL from your newly created .env file configuration
const API_BASE = import.meta.env.VITE_API_URL || "https://swift-ride-b.onrender.com";

export const Route = createFileRoute("/driver")({ component: DriverDash });

function DriverDash() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [online, setOnline] = useState(false);
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [myRides, setMyRides] = useState<any[]>([]);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (profile && profile.role !== "driver") {
      toast.error("This area is for driver accounts only.");
      navigate({ to: "/book" });
    }
  }, [user, profile, loading, navigate]);

  // Refactored to fetch metadata from your Express/MongoDB service instead of Supabase
  const refreshLists = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token"); // Assuming your context keeps JWT tokens here
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      // Fetch open pending requests
      const pendRes = await fetch(`${API_BASE}/api/rides?status=requested`, { headers });
      if (pendRes.ok) {
        const pendData = await pendRes.json();
        setPendingRides(Array.isArray(pendData) ? pendData.slice(0, 20) : []);
      }

      // Fetch driver specific history
      const mineRes = await fetch(`${API_BASE}/api/drivers/rides`, { headers });
      if (mineRes.ok) {
        const mineData = await mineRes.json();
        setMyRides(Array.isArray(mineData) ? mineData.slice(0, 20) : []);
      }
    } catch (err) {
      console.error("Error refreshing ride tracking feeds:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    refreshLists();
    
    // Polling fallback to keep data fresh without native Supabase Postgres triggers
    const interval = setInterval(refreshLists, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Geolocation broadcaster refactored to look at your Express app endpoints
  useEffect(() => {
    if (!online || !user) {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      return;
    }
    if (!navigator.geolocation) { 
      toast.error("Geolocation not supported"); 
      setOnline(false); 
      return; 
    }

    const token = localStorage.getItem("token");

    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        // Send coordinate broadcasts to your Node backend system
        try {
          await fetch(`${API_BASE}/api/drivers/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              heading: pos.coords.heading
            })
          });
        } catch (e) {
          console.error("Failed to broadcast location parameters:", e);
        }
      },
      () => {
        // Fallback simulation sequence
        const base = { lat: 28.6139, lng: 77.209 };
        let i = 0;
        const id = window.setInterval(async () => {
          i++;
          try {
            await fetch(`${API_BASE}/api/drivers/location`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({
                lat: base.lat + Math.sin(i / 10) * 0.01,
                lng: base.lng + Math.cos(i / 10) * 0.01
              })
            });
          } catch (e) {}
        }, 3000);
        watchRef.current = id as unknown as number;
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => { 
      if (watchRef.current !== null) {
        if (online) navigator.geolocation.clearWatch(watchRef.current);
        else clearInterval(watchRef.current);
      }
    };
  }, [online, user]);

  const accept = async (rideId: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/rides/${rideId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success("Ride accepted"); 
        refreshLists(); 
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to accept ride request.");
      }
    } catch (err) {
      toast.error("Network interface error updating booking.");
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Driver dashboard</h1>
          <p className="text-sm text-muted-foreground">Go online to receive ride requests and broadcast your location.</p>
        </div>
        <Card className="flex items-center gap-4 border-border/50 bg-card/60 px-4 py-3">
          <Radio className={`h-5 w-5 ${online ? "text-success" : "text-muted-foreground"}`} />
          <div>
            <div className="font-semibold">{online ? "Online" : "Offline"}</div>
            <div className="text-xs text-muted-foreground">{online ? "Broadcasting location" : "Toggle to start"}</div>
          </div>
          <Switch checked={online} onCheckedChange={setOnline} />
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Pending requests</h2>
          {pendingRides.length === 0 ? (
            <Card className="border-dashed border-border/50 bg-card/30 p-8 text-center text-sm text-muted-foreground">
              No open requests right now.
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRides.map((r) => (
                <Card key={r.id} className="border-border/50 bg-card/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs uppercase text-primary">Pickup</div>
                      <div className="truncate text-sm">{r.pickup_address}</div>
                      <div className="mt-2 text-xs uppercase text-accent">Drop</div>
                      <div className="truncate text-sm">{r.drop_address}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl font-bold text-primary">₹{r.fare}</div>
                      <div className="text-xs text-muted-foreground">{Number(r.distance_km || 0).toFixed(1)} km · {String(r.vehicle || 'auto').toUpperCase()}</div>
                    </div>
                  </div>
                  <Button size="sm" className="mt-3 w-full" disabled={!online} onClick={() => accept(r.id)}>
                    {online ? "Accept ride" : "Go online to accept"}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Your rides</h2>
          {myRides.length === 0 ? (
            <Card className="border-dashed border-border/50 bg-card/30 p-8 text-center text-sm text-muted-foreground">
              You haven't accepted any rides yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {myRides.map((r) => (
                <Link key={r.id} to="/ride/$id" params={{ id: r.id }}>
                  <Card className="border-border/50 bg-card/60 p-4 transition hover:border-primary/40">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Badge variant="outline" className="mb-2">{r.status}</Badge>
                        <div className="truncate text-sm">{r.pickup_address}</div>
                        <div className="truncate text-xs text-muted-foreground">→ {r.drop_address}</div>
                      </div>
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
