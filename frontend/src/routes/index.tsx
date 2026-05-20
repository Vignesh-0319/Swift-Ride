import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin, Zap, Shield, Database, Radio, Code2, Users, Car, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({ component: Showcase });

function Showcase() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cta = () => (user ? navigate({ to: "/book" }) : navigate({ to: "/auth" }));

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero} alt="" width={1536} height={1024} className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        </div>
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> SwiftRide Platform
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] md:text-7xl">
              A scalable platform for{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                urban mobility
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              SwiftRide is a full-stack ride booking system featuring integrated OpenStreetMap navigation,
              real-time driver tracking via WebSockets, geospatial matching, and secure JWT verification.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={cta} className="group">
                Try the live demo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <a href="#architecture">
                <Button size="lg" variant="outline">View architecture</Button>
              </a>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-4 text-left md:gap-8">
              {[
                { k: "Real-time", v: "Socket.io Streams" },
                { k: "Geospatial", v: "Smart matching" },
                { k: "Secure", v: "Node JWT auth" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur">
                  <div className="text-xs uppercase tracking-wide text-primary">{s.k}</div>
                  <div className="mt-1 font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionTitle eyebrow="01 · Problem Statement" title="Scalable architecture for urban mobility" />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 bg-card/50 p-6">
              <h3 className="text-lg font-semibold">The challenge</h3>
              <p className="mt-2 text-muted-foreground">
                Urban commuters need a frictionless way to book rides on demand, while drivers need fair,
                low-latency dispatch. Existing solutions are closed and opinionated.
              </p>
            </Card>
            <Card className="border-border/50 bg-card/50 p-6">
              <h3 className="text-lg font-semibold">Our scope</h3>
              <p className="mt-2 text-muted-foreground">
                A production-grade MVP: rider booking with maps, transparent fare estimation, live driver tracking,
                role-based dashboards, and end-to-end realtime sync.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="border-y border-border/50 bg-card/20 py-24">
        <div className="container mx-auto px-4">
          <SectionTitle eyebrow="02 · System Architecture" title="End-to-end data flow" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Code2, title: "Client Application", desc: "React + TanStack Router with Leaflet/OpenStreetMap rendering, optimistic UI updates, and route guards." },
              { icon: Radio, title: "Node.js Server Layer", desc: "Express.js REST APIs coupled with Socket.io channels streaming driver coordinates at sub-second latency." },
              { icon: Database, title: "MongoDB Database", desc: "Flexible Document schemas tracking profiles, dynamic rides, and live coordinate indexes securely." },
            ].map((c) => (
              <Card key={c.title} className="border-border/50 bg-card/60 p-6">
                <c.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DATABASE */}
      <section className="container mx-auto px-4 py-24">
        <SectionTitle eyebrow="03 · Database Collections" title="Three-model relational document structure" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: "profiles (users)", fields: ["_id (ObjectId)", "display_name", "role: rider|driver", "phone", "email"] },
            { name: "rides (bookings)", fields: ["pickup / drop locations", "distance_km, fare", "vehicle, status", "rider_id, driver_id"] },
            { name: "driver_locations", fields: ["driver_id (Ref)", "coordinates: [lat, lng]", "heading", "updated_at"] },
          ].map((t) => (
            <Card key={t.name} className="border-border/50 bg-card/50 p-6 font-mono text-sm">
              <div className="font-display text-lg font-bold text-primary">{t.name}</div>
              <ul className="mt-3 space-y-1 text-muted-foreground">
                {t.fields.map((f) => <li key={f}>· {f}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* AUTH */}
      <section className="border-y border-border/50 bg-card/20 py-24">
        <div className="container mx-auto px-4">
          <SectionTitle eyebrow="04 · Authentication & Security" title="Multi-layer security with Stateless JWT" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: Shield, t: "JWT tokens", d: "Cryptographically signed Access tokens passed via Authorization headers to secure API endpoints." },
              { icon: Users, t: "Role-based control", d: "Rider and driver authorization boundaries enforced on individual Express route middlewares." },
              { icon: Zap, t: "Input validation", d: "Data sanitization, rate-limiting rules, and schema verification run before every write operation." },
            ].map((c) => (
              <Card key={c.t} className="border-border/50 bg-card/60 p-6">
                <c.icon className="h-7 w-7 text-primary" />
                <h3 className="mt-3 font-semibold">{c.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* GEOSPATIAL */}
      <section className="container mx-auto px-4 py-24">
        <SectionTitle eyebrow="05 · Geospatial Matching" title="Location-based driver discovery" />
        <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
          <div>
            <ul className="space-y-4">
              {[
                { i: MapPin, t: "OpenStreetMap + Nominatim", d: "Free, open geocoding for pickup/drop autocomplete lists." },
                { i: Radio, t: "Haversine formula calculation", d: "Real-time distance estimation using great-circle math algorithms." },
                { i: Car, t: "Live positioning streams", d: "Drivers broadcast current metrics directly through active socket listeners." },
              ].map((x) => (
                <li key={x.t} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <x.i className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{x.t}</div>
                    <div className="text-sm text-muted-foreground">{x.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-border/50 bg-card/50 p-6 shadow-[var(--shadow-card)]">
            <div className="font-mono text-xs text-muted-foreground">// fare estimation logic</div>
            <pre className="mt-2 overflow-x-auto rounded-md bg-background/60 p-4 text-xs leading-relaxed text-foreground">
{`const km = haversine(pickup, drop);
const fare = base + perKm * km;
// Economy: ₹30 + ₹12/km
// Premium: ₹60 + ₹22/km
// XL:      ₹80 + ₹28/km`}
            </pre>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <Card className="border-border/50 p-12 text-center" style={{ background: "var(--gradient-card)" }}>
          <h2 className="text-3xl font-bold md:text-4xl">Experience the live booking flow</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Sign up as a rider to book a ride, or as a driver to broadcast your location and accept requests.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button size="lg" onClick={cta}>Launch demo <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        SwiftRide · Ride Booking Platform
      </footer>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-bold md:text-5xl">{title}</h2>
    </div>
  );
}
