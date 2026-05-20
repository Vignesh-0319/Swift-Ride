import { createContext, useContext, useState, ReactNode } from "react";

type User = {
  id: string;
  phone?: string;
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
  signOut: () => void;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading] = useState(false);

  const signOut = () => {
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