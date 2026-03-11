"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, PackageOpen, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore, Product } from "@/store/useStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  
  // Format slug back to readable category name for matching and display
  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const products = useStore(state => state.products);
  const addToCart = useStore(state => state.addToCart);

  // Filter products by category, handle 'Trending' and 'All' as special cases
  let filteredProducts: Product[] = [];
  if (slug === 'trending') {
    filteredProducts = products.filter(p => parseFloat(p.rating.toString()) >= 4.5).slice(0, 12);
  } else if (slug === 'all') {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter(p => 
      p.category.toLowerCase().includes(categoryName.toLowerCase()) ||
      categoryName.toLowerCase().includes(p.category.toLowerCase())
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
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-900"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
          
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{categoryName}</h1>
            <p className="text-slate-300 text-sm md:text-base max-w-xl">
              Explore our curated selection of top-tier {categoryName.toLowerCase()}. Discover innovation and quality crafted for your lifestyle.
            </p>
          </div>
          
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-center shrink-0 flex items-center gap-4">
            <div className="text-3xl font-black text-white">{filteredProducts.length}</div>
            <div className="text-blue-200 font-medium uppercase tracking-wider text-xs text-left">Products<br/>Found</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No products found</h2>
            <p className="text-slate-500 max-w-md mb-8 text-lg">
              We're constantly updating our inventory. Check back later for new arrivals in the {categoryName} category!
            </p>
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-8 h-12">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            {filteredProducts.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group">
                <Card className="h-full border-slate-200 overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 bg-white flex flex-col relative">
                  
                  {/* Image section with badges overlay */}
                  <div className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                       {product.badge && (
                        <Badge className="bg-blue-600 border-none shadow-sm text-white font-bold px-3 py-1 w-fit">
                          {product.badge}
                        </Badge>
                       )}
                      {product.stock === 0 ? (
                        <Badge className="bg-slate-800 border-none shadow-sm text-white font-bold px-3 py-1 mt-1 w-fit">
                          Out of Stock
                        </Badge>
                      ) : product.stock < 10 ? (
                        <Badge className="bg-orange-500 border-none shadow-sm text-white font-bold px-3 py-1 mt-1 w-fit">
                          Low Stock
                        </Badge>
                      ) : null}
                    </div>
                    
                    {product.images?.[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-contain p-6 transform transition-transform duration-500 group-hover:scale-105 filter drop-shadow-xl"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                             <PackageOpen className="w-12 h-12 text-slate-300" />
                        </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{product.brand}</span>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-700">{product.rating}</span>
                        <span className="text-slate-400 text-xs">({product.reviewsCount})</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto flex flex-col gap-3">
                      <div className="flex flex-col">
                        {product.originalPrice > 0 && product.originalPrice > product.price && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className="text-sm text-slate-400 line-through font-medium">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                              Save ৳{(product.originalPrice - product.price).toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm">
                              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </span>
                          </div>
                        )}
                        <span className="text-2xl font-black tracking-tight text-slate-900 border-b-2 border-transparent group-hover:border-blue-200 transition-colors">
                          ৳{product.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Button 
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock === 0} 
                          variant="outline"
                          className="w-full text-xs sm:text-sm font-semibold border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm bg-white"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1 hidden sm:inline-block" />
                          Add to cart
                        </Button>
                        <Button 
                          onClick={(e) => handleBuyNow(e, product)}
                          disabled={product.stock === 0} 
                          className="w-full text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                        >
                          <Banknote className="w-4 h-4 mr-1 hidden sm:inline-block" />
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
