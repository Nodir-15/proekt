import {
  createContext, useContext, useEffect, useState, ReactNode, useCallback,
} from "react";
import { cartApi } from "../api/cart";
import { Property } from "../types";
import { useAuth } from "./AuthContext";

interface Ctx {
  items: Property[];
  total: number;
  refresh: () => Promise<void>;
  add: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartCtx = createContext<Ctx | null>(null);

export const useCart = () => {
  const v = useContext(CartCtx);
  if (!v) throw new Error("useCart outside provider");
  return v;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Property[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const c = await cartApi.get();
    setItems(c.items || []);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const total = items.reduce((s, p) => s + p.price, 0);

  return (
    <CartCtx.Provider
      value={{
        items,
        total,
        refresh,
        add: async (id) => {
          const c = await cartApi.add(id);
          setItems(c.items || []);
        },
        remove: async (id) => {
          const c = await cartApi.remove(id);
          setItems(c.items || []);
        },
        clear: async () => {
          await cartApi.clear();
          setItems([]);
        },
      }}
    >
      {children}
    </CartCtx.Provider>
  );
};
