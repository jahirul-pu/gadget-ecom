"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, PackageOpen, Banknote, ChevronRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore, Product } from "@/store/useStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  
  const products = useStore(state => state.products);
  const categories = useStore(state => state.categories);
  const addToCart = useStore(state => state.addToCart);
  const hasHydrated = useStore(state => state._hasHydrated);

  const currentCategory = useMemo(() => {
    return categories.find((c: any) => c.slug === slug);
  }, [categories, slug]);

  const categoryName = currentCategory ? currentCategory.name : slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const filteredProducts = useMemo(() => {
    if (slug === 'trending') {
      return products.filter(p => parseFloat(p.rating?.toString() || "0") >= 4.5).slice(0, 12);
    }
    if (slug === 'all') {
      return products;
    }
    
    if (currentCategory) {
      // Get all child category IDs if this is a root category
      const childIds = currentCategory.children?.map((c: any) => c.id) || [];
      return products.filter(p => {
        // This assumes the product data from Supabase includes category_id or similar.
        // For now, matching by name heuristic since we don't have cat_id in the store Product interface yet.
        const pCat = p.category.toLowerCase();
        const cName = currentCategory.name.toLowerCase();
        
        // Exact match or matches one of the children
        const isSelfMatch = pCat.includes(cName);
        const isChildMatch = currentCategory.children?.some((child: any) => pCat.includes(child.name.toLowerCase()));
        
        return isSelfMatch || isChildMatch;
      });
    }

    // Fallback simple match
    const sName = categoryName.toLowerCase();
    return products.filter(p => p.category.toLowerCase().includes(sName));
  }, [products, currentCategory, slug, categoryName]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: product.id,
      name: product.name,
      variant: (product.colors && product.colors.length > 0 && typeof product.colors[0] === 'object' && (product.colors[0] as any).name) ? (product.colors[0] as any).name : (typeof product.colors?.[0] === 'string' ? product.colors[0] : "Default"),
      price: product.price,
      image: product.images[0] || "/placeholder.png",
      quantity: 1,
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
    <div className="bg-slate-50 min-h-screen pb-16 pt-8">
      {/* Category Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{categoryName}</h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl font-medium">
              {currentCategory?.description || `Premium selection of ${categoryName.toLowerCase()} designed for modern performance and style.`}
            </p>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-6 text-center shrink-0 flex flex-col items-center gap-0.5 min-w-[120px]">
            <div className="text-3xl font-black text-slate-900">{filteredProducts.length}</div>
            <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Products</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Bar Placeholder */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-4">
              <Button variant="ghost" className="rounded-xl font-bold gap-2 text-slate-600 px-4">
                 <Filter className="w-4 h-4" /> Filters
              </Button>
              <div className="h-6 w-px bg-slate-100"></div>
              <p className="text-sm font-bold text-slate-400">Showing <span className="text-slate-900">{filteredProducts.length}</span> results</p>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">Sort by:</span>
              <select className="text-sm font-bold text-slate-900 bg-transparent border-none focus:ring-0 cursor-pointer">
                 <option>Newest First</option>
                 <option>Price: Low to High</option>
                 <option>Price: High to Low</option>
                 <option>Best Rating</option>
              </select>
           </div>
        </div>
        
        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="w-12 h-12 text-slate-200" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No products found</h2>
            <p className="text-slate-500 max-w-md mb-8 text-lg font-medium">
              We're currently restocking our {categoryName} collection. Please explore our other categories!
            </p>
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl px-10 h-14 shadow-xl shadow-blue-600/20">
                Go Back Home
              </Button>
            </Link>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            {filteredProducts.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group">
                <Card className="h-full border-slate-200 overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 bg-white flex flex-col relative">
                  
                  {/* Image section with badges overlay */}
                  <div className="relative aspect-square w-full bg-slate-50/50 overflow-hidden">
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                       {product.badge && (
                        <Badge className="bg-blue-600 border-none shadow-sm text-white font-black px-3 py-1 w-fit rounded-lg uppercase text-[10px] tracking-tight">
                          {product.badge}
                        </Badge>
                       )}
                      {product.stock === 0 ? (
                        <Badge className="bg-slate-900 border-none shadow-sm text-white font-black px-3 py-1 mt-1 w-fit rounded-lg uppercase text-[10px] tracking-tight">
                          Out of Stock
                        </Badge>
                      ) : product.stock < 10 ? (
                        <Badge className="bg-rose-500 border-none shadow-sm text-white font-black px-3 py-1 mt-1 w-fit rounded-lg uppercase text-[10px] tracking-tight">
                          Low Stock
                        </Badge>
                      ) : null}
                    </div>
                    
                    {product.images?.[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-contain p-8 transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2 filter drop-shadow-2xl"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                             <PackageOpen className="w-12 h-12 text-slate-300" />
                        </div>
                    )}
                  </div>
                  
                  <CardContent className="p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest">{product.brand}</span>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-black text-slate-900 text-xs">{product.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto flex flex-col gap-4">
                      <div className="flex flex-col">
                        {product.originalPrice > 0 && product.originalPrice > product.price && (
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm text-slate-400 line-through font-bold">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                              Save ৳{(product.originalPrice - product.price).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <span className="text-3xl font-black tracking-tighter text-slate-900">
                          ৳{product.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock === 0} 
                          variant="ghost"
                          className="h-12 w-12 p-0 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shrink-0"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </Button>
                        <Button 
                          onClick={(e) => handleBuyNow(e, product)}
                          disabled={product.stock === 0} 
                          className="flex-1 h-12 bg-slate-900 border-2 border-slate-900 hover:bg-blue-600 hover:border-blue-600 text-white font-black rounded-2xl shadow-lg transition-all text-xs uppercase tracking-widest"
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
