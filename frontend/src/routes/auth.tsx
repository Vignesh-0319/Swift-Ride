import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Car } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://swift-ride-b.onrender.com";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const { user, login } = useAuth(); // Using structural methods from your global AuthContext layer
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Redirect users out of the authentication portal if an active session is detected
      if (user.role === "driver") {
        navigate({ to: "/driver" });
      } else {
        navigate({ to: "/book" });
      }
    }
  }, [user, navigate]);

  // 🔐 Production Server Sign In
  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email");
    const password = fd.get("password");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Securely pass user data and the server-signed JWT token down into the application provider
        login(data.user, data.token);
        toast.success("Welcome back to SwiftRide!");
        
        if (data.user.role === "driver") {
          navigate({ to: "/driver" });
        } else {
          navigate({ to: "/book" });
        }
      } else {
        toast.error(data.message || "Invalid authentication credentials.");
      }
    } catch (err) {
      toast.error("Unable to connect to the login server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Production Server Sign Up
  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name");
    const email = fd.get("email");
    const password = fd.get("password");
    const role = fd.get("role");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        toast.success("Account registered successfully!");
        
        if (data.user.role === "driver") {
          navigate({ to: "/driver" });
        } else {
          navigate({ to: "/book" });
        }
      } else {
        toast.error(data.message || "Registration failed. Account may already exist.");
      }
    } catch (err) {
      toast.error("Network communication failure during signup sequence.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/50 bg-card/60 p-8 backdrop-blur">
        
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">
              Welcome to SwiftRide
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to book or drive
            </p>
          </div>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          {/* 🔐 Sign In */}
          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-4 pt-4">
              <div>
                <Label>Email</Label>
                <Input type="email" name="email" required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" name="password" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          {/* 🆕 Sign Up */}
          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-4 pt-4">
              <div>
                <Label>Name</Label>
                <Input name="name" required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" name="email" required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" name="password" required minLength={6} />
              </div>

              <div>
                <Label>I want to</Label>
                <RadioGroup
                  defaultValue="rider"
                  name="role"
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  <Label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background/40 p-3">
                    <RadioGroupItem value="rider" /> Book rides
                  </Label>
                  <Label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background/40 p-3">
                    <RadioGroupItem value="driver" /> Drive
                  </Label>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Profile..." : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}
