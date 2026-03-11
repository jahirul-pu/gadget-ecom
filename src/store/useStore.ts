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
  fetchInitialData: () => Promise<void>;
}

const initialProducts: Product[] = [];
const initialOrders: Order[] = [];

export const useStore = create<AppState>((set, get) => ({
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
    // Optimistic UI update
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete product");
    } catch (e) {
      console.error(e);
      // Revert optimism by re-fetching
      get().fetchInitialData();
    }
  },
  updateProduct: async (product) => {
    // Optimistic Update
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
      if (!res.ok) throw new Error("Failed to add order");
      const newOrder = await res.json();
      set((state) => ({ orders: [newOrder, ...state.orders] }));
    } catch (e) {
      console.error(e);
    }
  },

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
}));
