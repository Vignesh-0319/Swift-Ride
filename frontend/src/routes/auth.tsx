import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AuthPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phoneVal = new FormData(e.currentTarget).get("phone") as string;
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneVal }),
    });
    if (res.ok) { setPhone(phoneVal); setStep("code"); }
    else toast.error("Failed to send OTP");
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = new FormData(e.currentTarget).get("code") as string;
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    if (res.ok) {
      const { user } = await res.json();
      setUser(user);
      navigate({ to: "/book" });
    } else toast.error("Invalid code");
    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto mt-20 p-6">
      {step === "phone" ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <Input name="phone" placeholder="Phone Number" required />
          <Button className="w-full" disabled={loading}>Send OTP</Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <Input name="code" placeholder="Enter 6-digit Code" required />
          <Button className="w-full" disabled={loading}>Verify</Button>
        </form>
      )}
    </Card>
  );
}
