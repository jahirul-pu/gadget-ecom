"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Box,
  Users,
  ShoppingCart,
  Tags,
  MessageSquare,
  Settings,
  Plus,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PackageCheck,
  UploadCloud,
  Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useStore, Product } from "@/store/useStore";

const ADMIN_NAV = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Box },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "coupons", label: "Coupons", icon: Tags },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  
  const products = useStore(state => state.products);
  const addProduct = useStore(state => state.addProduct);
  const updateProduct = useStore(state => state.updateProduct);
  const removeProduct = useStore(state => state.removeProduct);
  const orders = useStore(state => state.orders);

  // Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "", category: "", price: 0, stock: 0, description: ""
  });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
        toast.error("Name and Price are required.");
        return;
    }
    
    await addProduct({
      id: Math.random().toString(36).substring(7),
      name: newProduct.name,
      brand: "Brand",
      price: newProduct.price,
      originalPrice: newProduct.originalPrice || newProduct.price || 0,
      discount: newProduct.originalPrice && (newProduct.originalPrice > newProduct.price!) ? `${Math.round(((newProduct.originalPrice - newProduct.price!) / newProduct.originalPrice) * 100)}%` : "",
      rating: 0,
      reviewsCount: 0,
      stockStatus: newProduct.stock === 0 ? "Out of Stock" : newProduct.stock! < 10 ? "Low Stock" : "In Stock",
      stock: newProduct.stock || 0,
      status: newProduct.stock === 0 ? "Out of Stock" : newProduct.stock! < 10 ? "Low Stock" : "Active",
      images: ["/images/smartphone_hero_1773260880923.png"],
      category: newProduct.category || "Uncategorized",
      badge: "New",
      colors: [],
      storage: [],
      highlights: [],
      description: newProduct.description || "",
      specs: {},
      reviews: []
    });
    toast.success("Product Saved Successfully!");
    setIsAddProductOpen(false);
    setNewProduct({ name: "", category: "", price: 0, stock: 0, description: "" });
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;
    if (!editProduct.name || !editProduct.price) {
        toast.error("Name and Price are required.");
        return;
    }
    
    const originalPrice = editProduct.originalPrice || editProduct.price;
    const computedDiscount = originalPrice && (originalPrice > editProduct.price) ? `${Math.round(((originalPrice - editProduct.price) / originalPrice) * 100)}%` : "";

    const computedStockStatus = editProduct.stock === 0 ? "Out of Stock" : editProduct.stock! < 10 ? "Low Stock" : "In Stock";
    const computedStatus = editProduct.stock === 0 ? "Out of Stock" : editProduct.stock! < 10 ? "Low Stock" : "Active";

    await updateProduct({
        ...editProduct,
        originalPrice,
        discount: computedDiscount,
        stockStatus: computedStockStatus,
        status: computedStatus
    });
    toast.success("Product Updated Successfully!");
    setIsEditProductOpen(false);
    setEditProduct(null);
  };

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row">

      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 md:min-h-screen text-slate-300 md:fixed flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-black/20">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">T</div>
          <span className="font-bold text-lg text-white tracking-tight">TechFlow Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 hidden md:block">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Management</div>
          {ADMIN_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === item.id
                  ? "bg-blue-600/10 text-blue-400 font-semibold"
                  : "hover:bg-white/5 hover:text-white"
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile Nav Scroller */}
        <div className="md:hidden flex overflow-x-auto p-4 gap-2 no-scrollbar border-b border-white/10 bg-slate-900">
          {ADMIN_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${activeTab === item.id
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full border-2 border-slate-800 shrink-0"></div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Admin User</div>
              <div className="text-xs text-slate-500">Superadmin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">

        {/* App Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h1>
            <p className="text-slate-500 text-sm">Manage your e-commerce operations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search everything..." className="pl-9 h-10 bg-white border-none shadow-sm rounded-full w-full sm:w-64" />
            </div>
            {activeTab === "products" && (
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm" />}>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Add New Product</DialogTitle>
                    <DialogDescription>
                      Create a new product listing. Fill out all the required details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" value={newProduct.name || ""} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="E.g. Zenith Pro Earbuds" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={newProduct.category || ""} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="E.g. Audio" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Product Images</Label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer bg-white">
                        <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                        <span className="font-medium text-slate-700">Click to upload or drag & drop</span>
                        <span className="text-xs mt-1">PNG, JPG or WebP (MAX. 800x400px)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price (৳)</Label>
                        <Input id="originalPrice" type="number" value={newProduct.originalPrice || 0} onChange={e => setNewProduct({...newProduct, originalPrice: Number(e.target.value)})} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Sale Price (৳)</Label>
                        <Input id="price" type="number" value={newProduct.price || 0} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Inventory Stock</Label>
                        <Input id="stock" type="number" value={newProduct.stock || 0} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} placeholder="100" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specs">Specifications (Key-Value)</Label>
                      <Textarea id="specs" placeholder="Display: 6.8 OLED&#10;Battery: 5000mAh" className="h-24" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="desc">Full Description</Label>
                      <Textarea id="desc" value={newProduct.description || ""} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Write a detailed product description..." className="h-32" />
                    </div>
                  </div>
                  <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                    <Button variant="outline" className="text-slate-600">
                      <UploadCloud className="w-4 h-4 mr-2" /> Bulk Import
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddProduct} className="bg-blue-600 text-white">Save Product</Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Edit Product Dialog */}
            <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
              <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Edit Product</DialogTitle>
                  <DialogDescription>
                    Update details for this product.
                  </DialogDescription>
                </DialogHeader>
                {editProduct && (
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Product Name</Label>
                        <Input id="edit-name" value={editProduct.name || ""} onChange={e => setEditProduct({...editProduct, name: e.target.value})} placeholder="E.g. Zenith Pro Earbuds" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-category">Category</Label>
                        <Input id="edit-category" value={editProduct.category || ""} onChange={e => setEditProduct({...editProduct, category: e.target.value})} placeholder="E.g. Audio" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-originalPrice">Original Price (৳)</Label>
                        <Input id="edit-originalPrice" type="number" value={editProduct.originalPrice || 0} onChange={e => setEditProduct({...editProduct, originalPrice: Number(e.target.value)})} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-price">Sale Price (৳)</Label>
                        <Input id="edit-price" type="number" value={editProduct.price || 0} onChange={e => setEditProduct({...editProduct, price: Number(e.target.value)})} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-stock">Inventory Stock</Label>
                        <Input id="edit-stock" type="number" value={editProduct.stock || 0} onChange={e => setEditProduct({...editProduct, stock: Number(e.target.value), stockStatus: Number(e.target.value) === 0 ? "Out of Stock" : Number(e.target.value) < 10 ? "Low Stock" : "In Stock", status: Number(e.target.value) === 0 ? "Out of Stock" : Number(e.target.value) < 10 ? "Low Stock" : "Active"})} placeholder="100" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-desc">Full Description</Label>
                      <Textarea id="edit-desc" value={editProduct.description || ""} onChange={e => setEditProduct({...editProduct, description: e.target.value})} placeholder="Write a detailed product description..." className="h-32" />
                    </div>
                  </div>
                )}
                <DialogFooter className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsEditProductOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateProduct} className="bg-blue-600 text-white">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><TrendingUp className="w-4 h-4" /></div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">৳2.4M</div>
                    <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
                    <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600"><ShoppingCart className="w-4 h-4" /></div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">+573</div>
                    <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> +8.2% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
                    <CardTitle className="text-sm font-medium text-slate-500">Active Customers</CardTitle>
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><Users className="w-4 h-4" /></div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">+2,401</div>
                    <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> +15.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
                    <CardTitle className="text-sm font-medium text-slate-500">Low Stock Alerts</CardTitle>
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600"><PackageCheck className="w-4 h-4" /></div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">12</div>
                    <p className="text-xs text-rose-600 font-medium flex items-center mt-1">
                      <ArrowDownRight className="w-3 h-3 mr-1" /> Action required
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Data Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Orders Table */}
                <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Recent Orders</CardTitle>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => setActiveTab('orders')}>View All</Button>
                    </div>
                    <CardDescription>Latest transactions across the store</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="border-none">
                          <TableHead className="px-6">Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right px-6">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="border-slate-50 border-b">
                            <TableCell className="px-6 py-4">
                              <div className="font-semibold text-slate-900">{order.customer}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{order.id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`border-none ${
                                order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 text-right font-bold text-slate-900">৳{order.total.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Inventory Status Table */}
                <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Inventory Status</CardTitle>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => setActiveTab('products')}>Manage</Button>
                    </div>
                    <CardDescription>Quick overview of product limits</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="border-none">
                          <TableHead className="px-6">Product</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead className="text-right px-6">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} className="border-slate-50 border-b">
                            <TableCell className="px-6 py-4">
                              <div className="font-semibold text-slate-900 truncate max-w-[180px]">{product.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{product.category}</div>
                            </TableCell>
                            <TableCell>
                              <span className={`font-bold ${product.stock < 15 ? 'text-rose-600' : 'text-slate-900'}`}>{product.stock}</span>
                            </TableCell>
                            <TableCell className="px-6 text-right">
                              <Badge className={`border-none ${
                                product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                                product.status === 'Low Stock' ? 'bg-rose-100 text-rose-700' : 
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {product.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

              </div>
            </motion.div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-lg">Product Catalog</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" className="bg-slate-50 rounded-xl">Export</Button>
                      <Button variant="outline" className="bg-slate-50 rounded-xl">Filter</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100">
                        <TableHead className="px-6 w-[100px]">ID</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right px-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <TableCell className="px-6 font-medium text-slate-500 text-xs">{product.id}</TableCell>
                          <TableCell>
                            <div className="font-semibold text-slate-900">{product.name}</div>
                          </TableCell>
                          <TableCell className="text-slate-600">{product.category}</TableCell>
                          <TableCell>
                            <div className="font-bold text-slate-900">৳{product.price.toLocaleString()}</div>
                            {product.originalPrice > product.price && (
                                <div className="text-xs font-semibold text-emerald-600 mt-0.5">Save ৳{(product.originalPrice - product.price).toLocaleString()}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${product.stock > 15 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                              <span className="font-semibold">{product.stock}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                             <Badge variant="outline" className={`border-none ${
                                product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                                product.status === 'Low Stock' ? 'bg-rose-100 text-rose-700' : 
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {product.status}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-right px-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => { setEditProduct(product); setIsEditProductOpen(true); }}>Edit Details</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setEditProduct(product); setIsEditProductOpen(true); }}>Update Stock</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700" onClick={() => {
                                      removeProduct(product.id);
                                      toast.success(`${product.name} has been deleted.`);
                                  }}>
                                    Delete Product
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PLACEHOLDER FOR OTHER TABS */}
          {activeTab !== "overview" && activeTab !== "products" && (
            <motion.div key="placeholder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                {activeTab === "categories" && <Layers className="w-10 h-10" />}
                {activeTab === "orders" && <ShoppingCart className="w-10 h-10" />}
                {activeTab === "customers" && <Users className="w-10 h-10" />}
                {activeTab === "coupons" && <Tags className="w-10 h-10" />}
                {activeTab === "reviews" && <MessageSquare className="w-10 h-10" />}
                {activeTab === "settings" && <Settings className="w-10 h-10" />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize">{activeTab} Management</h3>
              <p className="text-slate-500 text-center max-w-sm mb-8">This management module is currently being configured and connected to the database.</p>
              <Button variant="outline" onClick={() => setActiveTab("overview")} className="rounded-xl font-semibold border-slate-200">Return to Overview</Button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
