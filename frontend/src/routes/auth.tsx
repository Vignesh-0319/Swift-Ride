// 1. Send OTP (Used for Sign Up / Request)
  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phone = fd.get("phone"); // Make sure your input name="phone"

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      toast.success("OTP sent to your phone!");
      // After this, show an input field for the OTP code
    } catch (err) {
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP (Used for Sign In)
  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phone = fd.get("phone");
    const code = fd.get("code");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      
      const data = await res.json();
      setUser(data.user);
      toast.success("Logged in successfully");
      navigate({ to: "/book" });
    } catch (err) {
      toast.error("Invalid OTP or Phone");
    } finally {
      setLoading(false);
    }
  };
