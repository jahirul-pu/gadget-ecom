"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Plus, ShieldCheck, Truck, Clock, ShoppingCart, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore, Product } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const allProducts = useStore(state => state.products);
  const addToCart = useStore(state => state.addToCart);
  
  const products = allProducts.slice(0, 4);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      variant: "Default",
      price: product.price,
      image: product.images[0] || "",
      quantity: 1
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(e, product);
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-100 overflow-hidden mx-4 mt-4 sm:mx-6 lg:mx-8 rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:px-8 lg:py-32 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-blue-600/10 text-blue-700 hover:bg-blue-600/20 mb-6 text-sm px-4 py-1.5 border-none">
              Just Released
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Next-Gen <br className="hidden lg:block" />
              <span className="text-blue-600">Wireless</span> <br className="hidden lg:block"/> Earbuds
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-xl">
              Experience immersive sound with active noise cancellation and spatial audio. The future of listening is here.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-14 text-base">
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base border-slate-300">
                Learn More
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] lg:h-[600px] w-full"
          >
            <Image
              src="/images/wireless_earbuds_hero_1773260569058.png"
              alt="Wireless Earbuds Hero"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Trending Gadgets Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Trending Gadgets</h2>
          <Link href="/category/all" className="text-blue-600 font-medium flex items-center gap-2 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="relative bg-white rounded-3xl p-4 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.badge && (
                    <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white border-none px-3 py-1 shadow-sm font-bold w-fit">
                      {product.badge}
                    </Badge>
                  )}
                  {product.stock === 0 ? (
                    <Badge className="bg-slate-800 text-white border-none px-3 py-1 shadow-sm font-bold w-fit mt-1">
                      Out of Stock
                    </Badge>
                  ) : product.stock < 10 ? (
                    <Badge className="bg-orange-500 text-white border-none px-3 py-1 shadow-sm font-bold w-fit mt-1">
                      Low Stock
                    </Badge>
                  ) : null}
                </div>
                <div className="relative h-64 w-full mb-4 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center group-hover:bg-slate-100 transition-colors cursor-pointer">
                  <Link href={`/products/${product.id}`} className="absolute inset-0 z-20"></Link>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} className="w-full h-full relative">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain p-4 mix-blend-multiply"
                    />
                  </motion.div>
                  <Button
                    size="icon"
                    disabled={product.stock === 0}
                    className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md text-slate-900 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="space-y-1 px-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{product.category}</div>
                  <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium text-slate-700">{product.rating}</span>
                  </div>
                  <div className="pt-2 flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-lg text-slate-900">৳{product.price.toLocaleString()}</span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="text-xs text-slate-400 line-through font-medium">৳{product.originalPrice.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">Save ৳{(product.originalPrice - product.price).toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm">-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button 
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0} 
                      variant="outline"
                      className="w-full text-xs sm:text-sm font-semibold border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm bg-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
                      Add to cart
                    </Button>
                    <Button 
                      onClick={(e) => handleBuyNow(e, product)}
                      disabled={product.stock === 0} 
                      className="w-full text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                    >
                      <Banknote className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Spotlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Smart Home Spotlight */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative bg-slate-900 rounded-3xl overflow-hidden group"
          >
            <div className="absolute inset-0">
              <Image
                src="/images/smart_home_cam_1773260594833.png"
                alt="Smart Home"
                fill
                className="object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-500 group-hover:scale-105"
              />
            </div>
            <div className="relative z-10 p-8 sm:p-12 h-full flex flex-col justify-end min-h-[400px]">
              <Badge className="bg-white/20 text-white hover:bg-white/30 w-fit mb-4 backdrop-blur-md border-none">
                Smart Home
              </Badge>
              <h3 className="text-3xl font-bold text-white mb-2">Automate Your Space</h3>
              <p className="text-slate-200 mb-6 max-w-sm">
                Control your home security, lighting, and climate with our next-gen smart hub.
              </p>
              <Button className="w-fit bg-white text-slate-900 hover:bg-slate-100 rounded-full px-6">
                Explore Setup
              </Button>
            </div>
          </motion.div>

          {/* Creator Gear Spotlight */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative bg-slate-100 rounded-3xl overflow-hidden group"
          >
            <div className="absolute inset-0">
              <Image
                src="/images/creator_gimbal_1773260614981.png"
                alt="Creator Gear"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Gradient overlay to make text readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative z-10 p-8 sm:p-12 h-full flex flex-col justify-end min-h-[400px]">
              <Badge className="bg-blue-600 border-none text-white hover:bg-blue-700 w-fit mb-4">
                Creator Gear
              </Badge>
              <h3 className="text-3xl font-bold text-white mb-2">Pro-Level Content</h3>
              <p className="text-slate-200 mb-6 max-w-sm">
                From 4K action cameras to professional gimbals. Upgrade your stream today.
              </p>
              <Button className="w-fit bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 border-none">
                Shop Creator Tools
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Fast Nationwide Delivery</h4>
              <p className="text-sm text-slate-500">Free delivery on orders over ৳3000</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Secure Payments</h4>
              <p className="text-sm text-slate-500">100% secure with bKash, SSLCommerz</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">24/7 Support</h4>
              <p className="text-sm text-slate-500">Dedicated tech support anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-blue-600 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-bold text-white mb-4">Get the latest gadgets news</h2>
            <p className="text-blue-100">Subscribe for early access to flash sales, deal bundles and our newest product releases.</p>
          </div>
          <div className="relative z-10 w-full max-w-md flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 h-12 px-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-white bg-white/10 text-white placeholder-blue-200 backdrop-blur-sm"
            />
            <Button className="h-12 bg-white text-blue-600 hover:bg-slate-100 px-6 font-bold rounded-xl space-x-2">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
