import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "../api/auth";
import { User } from "../types";

interface Ctx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | null>(null);

export const useAuth = () => {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!localStorage.getItem("access")) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await authApi.me();
        setUser(user);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = (data: any) => {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    setUser(data.user);
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        login: async (e, p) => persist(await authApi.login(e, p)),
        register: async (n, e, p) => persist(await authApi.register(n, e, p)),
        logout: async () => {
          const r = localStorage.getItem("refresh");
          if (r) {
            try {
              await authApi.logout(r);
            } catch {
              /* ignore */
            }
          }
          localStorage.clear();
          setUser(null);
        },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
};
