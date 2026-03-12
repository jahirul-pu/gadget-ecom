import { create } from "zustand";

export interface Review {
  id: number;
  user: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviewsCount: number;
  stockStatus: string;
  stock: number;
  status: string;
  images: string[];
  category: string;
  badge: string;
  colors: string[];
  storage: string[];
  highlights: string[];
  description: string;
  specs: Record<string, string>;
  reviews: Review[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  variant: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  payment: string;
  items: number;
  image: string;
  phone?: string;
  address?: string;
  district?: string;
  area?: string;
  orderItems?: any[];
}

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  district?: string;
  area?: string;
  address?: string;
}

export interface Address {
  id: string;
  userId: string;
  category: 'Home' | 'Office' | 'Business';
  district: string;
  area: string;
  fullAddress: string;
  isDefault: boolean;
}

interface AppState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  addresses: Address[];
  fetchAddresses: (userId: string) => Promise<void>;
  addAddress: (address: Omit<Address, "id">) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  user: User | null;
  setUser: (user: User | null) => void;
  fetchInitialData: () => Promise<void>;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const initialProducts: Product[] = [];
const initialOrders: Order[] = [];

import { persist } from "zustand/middleware";

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      addProduct: async (product) => {
        try {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          });
          if (!res.ok) throw new Error("Failed to add product");
          const newProduct = await res.json();
          set((state) => ({ products: [newProduct, ...state.products] }));
        } catch (e) {
          console.error(e);
        }
      },
      removeProduct: async (id) => {
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
        try {
          const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error("Failed to delete product");
        } catch (e) {
          console.error(e);
          get().fetchInitialData();
        }
      },
      updateProduct: async (product) => {
        set((state) => ({ products: state.products.map(p => p.id === product.id ? product : p) }));
        try {
          const res = await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          });
          if (!res.ok) throw new Error("Failed to update product");
        } catch (e) {
          console.error(e);
          get().fetchInitialData();
        }
      },
      
      cart: [],
      addToCart: (item) => set((state) => {
        const existing = state.cart.find(c => c.productId === item.productId && c.variant === item.variant);
        if (existing) {
          return { cart: state.cart.map(c => c.productId === item.productId && c.variant === item.variant ? { ...c, quantity: c.quantity + item.quantity } : c) };
        }
        return { cart: [...state.cart, { ...item, id: Math.random().toString(36).substring(7) }] };
      }),
      updateCartQuantity: (id, quantity) => set((state) => ({ cart: state.cart.map(c => c.id === id ? { ...c, quantity } : c) })),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(c => c.id !== id) })),
      clearCart: () => set({ cart: [] }),

      orders: initialOrders,
      addOrder: async (order) => {
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to add order");
          }
          const newOrder = await res.json();
          set((state) => ({ orders: [newOrder, ...state.orders] }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      updateOrderStatus: async (id, status) => {
        set((state) => ({
          orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
        }));

        try {
          const res = await fetch('/api/orders', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.details || "Failed to update order status");
          }
          import('sonner').then(({ toast }) => toast.success(`Order status updated to ${status}`));
        } catch (e: any) {
          console.error(e);
          import('sonner').then(({ toast }) => toast.error(`Error: ${e.message}`));
          get().fetchInitialData();
        }
      },

      addresses: [],
      fetchAddresses: async (userId) => {
        try {
          const res = await fetch(`/api/addresses?userId=${userId}`);
          if (!res.ok) throw new Error("Failed to fetch addresses");
          const data = await res.json();
          set({ addresses: data });
        } catch (e) {
          console.error(e);
        }
      },
      addAddress: async (address) => {
        try {
          const res = await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(address),
          });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to add address");
          }
          const newAddress = await res.json();
          set((state) => ({ addresses: [...state.addresses, newAddress] }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      updateAddress: async (address) => {
        try {
          const res = await fetch('/api/addresses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(address),
          });
          if (!res.ok) throw new Error("Failed to update address");
          const updated = await res.json();
          set((state) => ({
            addresses: state.addresses.map(a => a.id === updated.id ? updated : a)
          }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },
      deleteAddress: async (id) => {
        try {
          const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to delete address");
          }
          set((state) => ({ addresses: state.addresses.filter(a => a.id !== id) }));
        } catch (e) {
          console.error(e);
          throw e;
        }
      },

      user: null,
      setUser: (user) => {
        set({ user });
      },
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      fetchInitialData: async () => {
        try {
          const [productsRes, ordersRes] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/orders')
          ]);
          
          const products = await productsRes.json();
          const orders = await ordersRes.json();
          
          set({ products, orders });
        } catch (e) {
          console.error("Failed to fetch initial data", e);
        }
      }
    }),
    {
      name: "techflow-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
