"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShieldCheck, Truck, ArrowLeft, ArrowRight, Minus, Plus, Heart, Share2, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { useStore } from "@/store/useStore";
import { useParams } from "next/navigation";

const relatedProducts = [
  {
    id: 1,
    name: "Zenith ANC Earbuds Pro",
    price: "৳12,900",
    rating: 4.8,
    image: "/images/wireless_earbuds_hero_1773260569058.png",
  },
  {
    id: 2,
    name: "Titanium Alpha Smartwatch",
    price: "৳24,500",
    rating: 4.9,
    image: "/images/smartwatch_hero_1773260634812.png",
  },
  {
    id: 3,
    name: "Visionary 4K Action Cam",
    price: "৳35,000",
    rating: 4.7,
    image: "/images/creator_gimbal_1773260614981.png",
  },
  {
    id: 4,
    name: "Aura Smart Security Hub",
    price: "৳8,500",
    rating: 4.6,
    image: "/images/smart_home_cam_1773260594833.png",
  }
];

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const products = useStore(state => state.products);
  const addToCart = useStore(state => state.addToCart);
  const hasHydrated = useStore(state => state._hasHydrated);
  
  const product = products.find(p => p.id === id);

  if (!hasHydrated || (products.length === 0 && !product)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading amazing gadgets...</p>
      </div>
    );
  }
  const [activeImage, setActiveImage] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [activeStorage, setActiveStorage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Product not found</div>;
  }

  const getColorName = (c: any) => (c && typeof c === 'object' && c.name) ? c.name : c;

  const handleAddToCart = () => {
    const variantStr = [getColorName(product.colors?.[activeColor]), product.storage?.[activeStorage]].filter(Boolean).join(" | ");
    addToCart({
      productId: product.id,
      name: product.name,
      variant: variantStr || "Default",
      price: product.price,
      image: product.images[0],
      quantity: quantity
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/category/all" className="hover:text-blue-600 transition-colors">Catalog</Link>
          {product.category.split(' > ').map((seg, idx) => {
            const slug = seg.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            return (
              <div key={idx} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                <Link href={`/category/${slug}`} className="hover:text-blue-600 transition-colors">{seg}</Link>
              </div>
            );
          })}
          <ChevronRight className="w-3 h-3" />
          <span className="text-blue-600 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-6">
            <div 
              className="relative aspect-square w-full rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden cursor-crosshair group"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative flex items-center justify-center p-8"
                >
                  <Image
                    src={product.images[activeImage]}
                    alt={product.name}
                    fill
                    className={`object-contain transition-transform duration-200 ease-out ${isHovering ? 'scale-[2] origin-top-left invisible' : 'scale-100 visible'}`}
                    priority
                  />
                  {/* Zoom Overlay */}
                  {isHovering && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `url(${product.images[activeImage]})`,
                        backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                        backgroundSize: '200%',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-square rounded-2xl bg-slate-50 border-2 overflow-hidden transition-all ${
                    activeImage === idx ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="flex flex-col pt-4 lg:pt-8">
            <Badge className="w-fit bg-slate-900 text-white mb-4 border-none hover:bg-slate-800">{product.brand}</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-700">{product.rating}</span>
              <span className="text-slate-300">•</span>
              <button className="text-sm text-blue-600 hover:underline">{product.reviewsCount} reviews</button>
            </div>

            <div className="flex flex-wrap items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-slate-900">৳{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-slate-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
                  <Badge className="bg-red-50 text-red-600 hover:bg-red-100 border-none px-2 py-1">-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</Badge>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Save ৳{(product.originalPrice - product.price).toLocaleString()}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mb-8">
              <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${product.stock === 0 ? 'bg-slate-800' : product.stock < 10 ? 'bg-orange-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
              <span className={`text-sm font-bold ${product.stock === 0 ? 'text-slate-800' : product.stock < 10 ? 'text-orange-600' : 'text-emerald-600'}`}>{product.stock === 0 ? "Out of Stock" : product.stock < 10 ? "Low Stock" : "In Stock"}</span>
            </div>

            <p className="text-slate-600 mb-8 leading-relaxed">
              {product.description.substring(0, 150)}...
            </p>

            {/* Highlights */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {product.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 p-1 rounded-full text-blue-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-slate-700">{highlight}</span>
                </li>
              ))}
            </ul>

            <Separator className="mb-8" />

            {/* Variants: Color */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-slate-900">Color Variant</span>
                <span className="text-sm text-slate-500">{getColorName(product.colors[activeColor])}</span>
              </div>
              <div className="flex gap-4">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveColor(idx)}
                    className={`h-12 flex-1 rounded-xl border-2 transition-all font-medium text-sm ${
                      activeColor === idx ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {getColorName(color)}
                  </button>
                ))}
              </div>
            </div>

            {/* Variants: Storage */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-slate-900">Storage Capacity</span>
                <span className="text-sm text-blue-600 cursor-pointer hover:underline">Compare sizes</span>
              </div>
              <div className="flex gap-4">
                {product.storage.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStorage(idx)}
                    className={`h-12 flex-1 rounded-xl border-2 transition-all font-medium text-sm ${
                      activeStorage === idx ? 'border-slate-900 text-slate-900 bg-slate-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center justify-between border-2 border-slate-200 rounded-2xl h-14 px-4 sm:w-36 bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <Button onClick={handleAddToCart} size="lg" disabled={product.stock === 0} className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button size="lg" variant="outline" className="h-14 w-14 p-0 shrink-0 border-2 border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600">
                <Heart className="w-6 h-6" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="bg-slate-50 rounded-2xl p-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">1 Year Official Warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-cyan-500" />
                <span className="text-sm font-medium text-slate-700">Free Express Delivery</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Product Details Tabs (Description / Specs / Reviews) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="border-b border-slate-200 flex gap-8 mb-8">
          <button 
            onClick={() => setActiveTab("description")}
            className={`pb-4 text-lg font-semibold border-b-2 transition-colors ${activeTab === "description" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab("specs")}
            className={`pb-4 text-lg font-semibold border-b-2 transition-colors ${activeTab === "specs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Specifications
          </button>
          <button 
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 text-lg font-semibold border-b-2 transition-colors ${activeTab === "reviews" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Reviews ({product.reviewsCount})
          </button>
        </div>

        <div className="min-h-[300px]">
          {activeTab === "description" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl prose prose-slate">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Redefining the Flagship Experience</h3>
              <p className="text-slate-600 leading-relaxed text-lg mb-6">{product.description}</p>
              <div className="relative h-96 rounded-3xl overflow-hidden mt-8">
                 <Image src={product.images[0]} alt="Showcase" fill className="object-cover" />
                 <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
              </div>
            </motion.div>
          )}

          {activeTab === "specs" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <table className="w-full text-left">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value], idx) => (
                      <tr key={key} className={`border-slate-200 ${idx !== Object.keys(product.specs).length - 1 ? 'border-b' : ''}`}>
                        <th className="py-4 text-slate-900 font-semibold w-1/3 align-top">{key}</th>
                        <td className="py-4 text-slate-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
              <div>
                <div className="flex items-center gap-6 mb-8">
                  <div className="text-6xl font-bold text-slate-900">{product.rating}</div>
                  <div>
                    <div className="flex text-yellow-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-500">Based on {product.reviewsCount} reviews</p>
                  </div>
                </div>
                <Button className="w-full sm:w-auto h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl">Write a Review</Button>
              </div>
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="bg-slate-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-semibold text-slate-900">{review.user}</div>
                      <div className="text-sm text-slate-400">{review.date}</div>
                    </div>
                    <div className="flex text-yellow-500 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <p className="text-slate-600">{review.comment}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full h-12 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50">View all reviews</Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">You might also like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((item) => (
            <div key={item.id} className="group relative bg-white border border-slate-100 rounded-3xl p-4 transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] cursor-pointer">
              <div className="relative h-60 bg-slate-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
                <Image src={item.image} alt={item.name} fill className="object-contain p-6 transition-transform duration-500 group-hover:scale-110" />
                <Button size="icon" className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-blue-600 hover:text-white translate-y-2 group-hover:translate-y-0">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <h3 className="font-bold text-slate-900 truncate mb-1">{item.name}</h3>
              <div className="flex items-center gap-1.5 text-yellow-500 mb-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium text-slate-700">{item.rating}</span>
              </div>
              <div className="font-bold text-lg text-slate-900">{item.price}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
