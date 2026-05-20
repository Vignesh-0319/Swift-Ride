import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Radio, Navigation } from "lucide-react";

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

  const refreshLists = async () => {
    if (!user) return;
    const { data: pend } = await supabase.from("rides").select("*").eq("status", "requested").is("driver_id", null).order("created_at", { ascending: false }).limit(20);
    const { data: mine } = await supabase.from("rides").select("*").eq("driver_id", user.id).order("created_at", { ascending: false }).limit(20);
    setPendingRides(pend || []); setMyRides(mine || []);
  };

  useEffect(() => {
    if (!user) return;
    refreshLists();
    const ch = supabase.channel("driver-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, refreshLists)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  // Geolocation broadcaster
  useEffect(() => {
    if (!online || !user) {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      return;
    }
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); setOnline(false); return; }
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        await supabase.from("driver_locations").upsert({
          driver_id: user.id, lat: pos.coords.latitude, lng: pos.coords.longitude, heading: pos.coords.heading,
        });
      },
      () => {
        // fallback: simulate near Delhi
        const base = { lat: 28.6139, lng: 77.209 };
        let i = 0;
        const id = window.setInterval(async () => {
          i++;
          await supabase.from("driver_locations").upsert({
            driver_id: user.id, lat: base.lat + Math.sin(i / 10) * 0.01, lng: base.lng + Math.cos(i / 10) * 0.01,
          });
        }, 2000);
        watchRef.current = id as unknown as number;
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, [online, user]);

  const accept = async (rideId: string) => {
    if (!user) return;
    const { error } = await supabase.from("rides").update({ driver_id: user.id, status: "accepted" }).eq("id", rideId).is("driver_id", null);
    if (error) toast.error(error.message); else { toast.success("Ride accepted"); refreshLists(); }
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
                      <div className="text-xs text-muted-foreground">{Number(r.distance_km).toFixed(1)} km · {String(r.vehicle).toUpperCase()}</div>
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
