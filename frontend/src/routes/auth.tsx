import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { API_URL } from "@/config"; // Ensure this points to your backend base URL

export function AuthPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");

  // 1. Request OTP
  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phoneInput = fd.get("phone") as string;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, { // Maps to request-otp
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneInput }),
      });
      if (!res.ok) throw new Error("Failed to send code");
      setPhone(phoneInput);
      setStep("code");
      toast.success("Code sent to your phone!");
    } catch (err) {
      toast.error("Error sending code");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = fd.get("code") as string;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, { // Maps to verify-otp
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      if (!res.ok) throw new Error("Invalid code");
      const data = await res.json();
      setUser(data.user);
      navigate({ to: "/book" });
    } catch (err) {
      toast.error("Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        {step === "phone" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <h2 className="text-xl font-bold">Enter your phone number</h2>
            <Label>Phone (with +country code)</Label>
            <Input name="phone" placeholder="+1234567890" required />
            <Button className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <h2 className="text-xl font-bold">Enter 6-digit code</h2>
            <Label>Verification Code</Label>
            <Input name="code" maxLength={6} required />
            <Button className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
          </form>
        )}
      </Card>
    </main>
  );
}
