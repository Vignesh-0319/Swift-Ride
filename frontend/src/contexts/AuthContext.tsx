import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://swift-ride-b.onrender.com";

type User = {
  id: string;
  phone?: string;
  email?: string;
};

type Profile = {
  id: string;
  display_name?: string | null;
  role?: "rider" | "driver";
};

type Ctx = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (userData: User, profileData: Profile, token: string) => void;
  signOut: () => void;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Hydrate session from localStorage when the app loads
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      const savedProfile = localStorage.getItem("profile");

      if (token && savedUser && savedProfile) {
        try {
          setUser(JSON.parse(savedUser));
          setProfile(JSON.parse(savedProfile));

          // Optional: Silently verify token freshness with backend
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` },
          });
          
          if (!res.ok) {
            // If token has expired, clean up storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("profile");
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.warn("Backend handshake offline, falling back to cached local storage session.");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // 🔑 Log in user, store profile state, and persist JWT token
  const login = (userData: User, profileData: Profile, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("profile", JSON.stringify(profileData));
    setUser(userData);
    setProfile(profileData);
  };

  // 🚪 Clear out storage on logout
  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        profile,
        loading,
        setUser,
        login,
        signOut,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
