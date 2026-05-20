import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, LogOut } from "lucide-react";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Car className="h-5 w-5 text-primary-foreground" />
          </span>
          SwiftRide
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Showcase</Link>
          {user && <Link to="/book" className="text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Book a ride</Link>}
          {user && profile?.role === "driver" && <Link to="/driver" className="text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Driver</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {!user && loc.pathname !== "/auth" && (
            <Button onClick={() => navigate({ to: "/auth" })} size="sm">Sign in</Button>
          )}
          {user && (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {profile?.display_name} <span className="text-xs">({profile?.role})</span>
              </span>
              <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
