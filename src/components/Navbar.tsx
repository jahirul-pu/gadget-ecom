"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, Trash2, Plus, Minus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store/useStore";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminPage = pathname?.startsWith("/admin");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const products = useStore(state => state.products);
  const cart = useStore(state => state.cart);
  const updateStoreQuantity = useStore(state => state.updateCartQuantity);
  const removeFromCart = useStore(state => state.removeFromCart);
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateStoreQuantity(id, newQuantity);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = products.filter(product => 
    searchQuery.trim() !== "" && 
    (product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     product.price.toString().includes(searchQuery))
  ).slice(0, 5);

  if (isAdminPage) {
    return (
      <header className="sticky top-0 z-50 w-full h-16 bg-white border-b border-slate-200 flex items-center justify-end px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="font-medium text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-blue-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Main Site
            </Button>
          </Link>
          {mounted && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 transition-colors" />}>
                  <User className="h-5 w-5 text-slate-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-bold">{user.fullName}</span>
                      <span className="text-xs text-slate-500">{user.phone}</span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <Link href="/dashboard"><DropdownMenuItem>My Dashboard</DropdownMenuItem></Link>
                <DropdownMenuItem onClick={() => setUser(null)}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors group">
              <User className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </Link>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 flex justify-between items-center sm:px-6 lg:px-8">
        <div className="flex gap-4">
          <span className="hidden sm:inline">Free delivery over ৳3000</span>
          <span className="sm:hidden">Free delivery &gt; ৳3000</span>
        </div>
        <div className="flex gap-4">
          <Link href="/order-tracking" className="hover:text-cyan-400 transition-colors">
            Order tracking
          </Link>
          <Link href="/support" className="hover:text-cyan-400 transition-colors">
            Customer support
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-4 py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left - Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold"
          >
            T
          </motion.div>
          <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            TechFlow
          </span>
        </Link>

        {/* Center - Search Bar */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-2xl mx-12 relative z-50">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search smartphones, smartwatches, prices..." 
              className="w-full pl-12 pr-10 h-12 bg-slate-100 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-full text-base transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {isSearchOpen && searchQuery.trim() !== "" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
              >
                {searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <span>Products</span>
                    </div>
                    {searchResults.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/products/${product.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group"
                      >
                        <div className="w-14 h-14 bg-white rounded-xl border border-slate-100 shadow-sm relative shrink-0 overflow-hidden">
                           <Image src={product.images[0]} alt={product.name} fill className="object-contain p-2 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{product.name}</h4>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm inline-block mt-1">{product.category}</span>
                        </div>
                        <div className="font-bold text-slate-900 whitespace-nowrap">
                          ৳{product.price.toLocaleString()}
                        </div>
                      </Link>
                    ))}
                    <Link 
                      href={`/category/all?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="p-4 text-center text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 transition-colors"
                    >
                      View all results for "{searchQuery}"
                    </Link>
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-semibold">No results found</p>
                    <p className="text-slate-500 text-sm mt-1">We couldn't find anything matching "{searchQuery}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative group">
            <Heart className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
          </Button>
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="relative group p-2" />}>
                <ShoppingBag className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-cyan-500 hover:bg-cyan-600 border-2 border-white text-[10px]">
                    {cartCount}
                  </Badge>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:max-w-md flex flex-col p-0 bg-white outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
              <SheetHeader className="p-6 border-b border-slate-100 flex-shrink-0">
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" /> Your Cart
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Your cart is empty</h3>
                      <p className="text-slate-500 mt-2">Looks like you haven't added anything yet.</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-blue-100 transition-colors group">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 shrink-0 flex items-center justify-center relative">
                        <Image src={item.image} alt={item.name} fill className="object-contain drop-shadow-sm p-1" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate" title={item.name}>{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">{typeof item.variant === 'object' ? (item.variant as any)?.name || 'Default' : item.variant}</span>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="font-bold text-slate-900">৳{item.price.toLocaleString()}</span>
                          <div className="flex items-center gap-3 bg-slate-50 rounded-full px-2 py-1 border border-slate-200">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-slate-500 hover:text-slate-900 w-5 h-5 flex items-center justify-center cursor-pointer" disabled={item.quantity <= 1}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-slate-500 hover:text-slate-900 w-5 h-5 flex items-center justify-center cursor-pointer">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex-shrink-0 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between text-base font-semibold text-slate-900 mb-6">
                    <span>Subtotal</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
                  <SheetClose render={<Link href="/checkout" className="w-full flex items-center justify-center h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all" />}>
                      Proceed to Checkout
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
          {mounted && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 transition-colors" />}>
                  <User className="h-5 w-5 text-slate-900" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-bold">{user.fullName}</span>
                      <span className="text-xs text-slate-500 font-normal">{user.phone}</span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <Link href="/dashboard"><DropdownMenuItem>My Dashboard</DropdownMenuItem></Link>
                <DropdownMenuItem onClick={() => setUser(null)}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors group">
              <User className="h-5 w-5 text-slate-900 group-hover:text-blue-600 transition-colors" />
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Navigation Categories */}
      <div className="hidden md:flex justify-center border-t border-slate-100 py-3">
        <ul className="flex space-x-8 text-sm font-medium text-slate-600">
          {[
            { label: "Phones & Tablets", slug: "phones-tablets" },
            { label: "Wearables", slug: "wearables" },
            { label: "Audio", slug: "audio" },
            { label: "Smart Home", slug: "smart-home" },
            { label: "Creator Gadgets", slug: "creator-gadgets" },
            { label: "Accessories", slug: "accessories" },
            { label: "Deals", slug: "deals" }
          ].map((cat) => (
             <li key={cat.slug} className={`cursor-pointer transition-colors ${cat.slug === 'deals' ? 'text-red-500 hover:text-red-600 font-semibold' : 'hover:text-blue-600'}`}>
                <Link href={`/category/${cat.slug}`}>
                   {cat.label}
                </Link>
             </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
