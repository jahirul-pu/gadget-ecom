"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
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
  Layers,
  Printer,
  Check,
  Hexagon,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  LogOut
} from "lucide-react";
import { OrderInvoice } from "@/components/OrderInvoice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useStore, Product } from "@/store/useStore";

const ADMIN_NAV = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Box },
  { id: "inventory", label: "Inventory", icon: PackageCheck },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "brands", label: "Brands", icon: Hexagon },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "ai", label: "AI Assistant", icon: Sparkles },
];

const SECONDARY_NAV = [
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTab = localStorage.getItem('admin_active_tab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem('admin_active_tab', tabId);
  };
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const products = useStore(state => state.products);
  const addProduct = useStore(state => state.addProduct);
  const updateProduct = useStore(state => state.updateProduct);
  const removeProduct = useStore(state => state.removeProduct);
  const orders = useStore(state => state.orders);
  const updateOrderStatus = useStore(state => state.updateOrderStatus);
  const setUser = useStore(state => state.setUser);
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [isUserViewOpen, setIsUserViewOpen] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<any | null>(null);

  const viewCustomerData = async (user: any) => {
    setSelectedUser(user);
    const { data } = await supabase.from('user_addresses').select('*').eq('user_id', user.id);
    setUserAddresses(data || []);
    setIsUserViewOpen(true);
  };

  useEffect(() => {
    if (activeTab === "customers") {
      setUsersLoading(true);
      supabase.from('users').select('*').order('created_at', { ascending: false }).then(({ data }) => {
        setUsers(data || []);
        setUsersLoading(false);
      });
    }
  }, [activeTab]);

  const handlePrintInvoice = (orderId: string) => {
    const printContent = document.getElementById(`invoice-${orderId}`);
    if (!printContent) return;

    const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (!winPrint) return;

    winPrint.document.write(`
      <html>
        <head>
          <title>Invoice - ${orderId}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none; }
              body { padding: 0; margin: 0; }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    winPrint.document.close();
    winPrint.focus();
  };

  // Category state
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    slug: string;
    parent_id: string | null;
    description: string;
    sort_order: number;
    is_active: boolean;
  }>({
    name: "",
    slug: "",
    parent_id: "root",
    description: "",
    sort_order: 1,
    is_active: true
  });

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    setCategories(data || []);
  };

  useEffect(() => {
    if (activeTab === "categories" || activeTab === "products") {
      fetchCategories();
    }
  }, [activeTab]);

  const categoryTree = useMemo(() => {
    const map = new Map();
    categories.forEach(cat => map.set(cat.id, { ...cat, children: [] }));
    const roots: any[] = [];
    categories.forEach(cat => {
      if (cat.parent_id) {
        const parent = map.get(cat.parent_id);
        if (parent) parent.children.push(map.get(cat.id));
        else roots.push(map.get(cat.id)); // Orphaned?
      } else {
        roots.push(map.get(cat.id));
      }
    });
    return roots;
  }, [categories]);

  const handleSaveCategory = async () => {
    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      parent_id: categoryForm.parent_id === "root" ? null : categoryForm.parent_id,
      description: categoryForm.description,
      sort_order: categoryForm.sort_order,
      is_active: categoryForm.is_active
    };

    if (editingCategory) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editingCategory.id);
      if (error) toast.error(error.message);
      else toast.success("Category updated");
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) toast.error(error.message);
      else toast.success("Category created");
    }
    setIsCategoryModalOpen(false);
    fetchCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure? This might affect products in this category.")) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) toast.error(error.message);
      else {
        toast.success("Category deleted");
        fetchCategories();
      }
    }
  };

  const handleToggleCategoryActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('categories').update({ is_active: !currentStatus }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(currentStatus ? "Category deactivated" : "Category activated");
      fetchCategories();
    }
  };

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
      category_id: newProduct.category_id,
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
    setNewProduct({ name: "", category: "", category_id: undefined, price: 0, stock: 0, description: "" });
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
          {ADMIN_NAV.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-1"
                  : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Nav Scroller */}
        <div className="md:hidden flex overflow-x-auto p-4 gap-2 no-scrollbar border-b border-white/10 bg-slate-900">
          {ADMIN_NAV.concat(SECONDARY_NAV).map((item) => (
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
          <button
            onClick={() => {
              setUser(null);
              window.location.href = "/";
            }}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="p-4 border-t border-white/10 hidden md:block space-y-2">
          {/* Secondary Nav (Settings) */}
          {SECONDARY_NAV.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-2 ${activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </button>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={() => {
              setUser(null);
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all mb-6"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
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
                  <div className="grid gap-8 py-4 px-2">
                    
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2">Basic Info</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input id="name" value={newProduct.name || ""} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="E.g. Zenith Pro Earbuds" />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <div className="flex gap-2">
                            <Select 
                              value={(() => {
                                const currentCat = categories.find(c => c.name === newProduct.category);
                                if (!currentCat) return "";
                                if (currentCat.parent_id) {
                                  const parent = categories.find(c => c.id === currentCat.parent_id);
                                  return parent?.name || "";
                                }
                                return currentCat.name;
                              })()}
                              onValueChange={(val) => {
                                const cat = categories.find(c => c.name === val);
                                setNewProduct({...newProduct, category: val as string || "", category_id: cat?.id});
                              }}
                            >
                               <SelectTrigger className="w-1/2 rounded-xl"><SelectValue placeholder="Main Category" /></SelectTrigger>
                               <SelectContent className="rounded-xl bg-white">
                                  {categories.filter(c => !c.parent_id).map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                               </SelectContent>
                            </Select>
                            <Select 
                              value={(() => {
                                const currentCat = categories.find(c => c.name === newProduct.category);
                                return currentCat?.parent_id ? currentCat.name : "";
                              })()}
                              onValueChange={(val) => {
                                if (!val) return;
                                const cat = categories.find(c => c.name === val);
                                setNewProduct({...newProduct, category: val as string, category_id: cat?.id});
                              }}
                              disabled={(() => {
                                const currentCat = categories.find(c => c.name === newProduct.category);
                                if (!currentCat) return true;
                                const parentId = currentCat.parent_id || currentCat.id;
                                return categories.filter(c => c.parent_id === parentId).length === 0;
                              })()}
                            >
                               <SelectTrigger className="w-1/2 rounded-xl"><SelectValue placeholder="Subcategory" /></SelectTrigger>
                               <SelectContent className="rounded-xl bg-white">
                                  {(() => {
                                    const currentCat = categories.find(c => c.name === newProduct.category);
                                    const parentId = currentCat?.parent_id || currentCat?.id;
                                    return categories.filter(c => c.parent_id === parentId).map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>);
                                  })()}
                               </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desc">Full Description</Label>
                        <Textarea id="desc" value={newProduct.description || ""} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Write a detailed product description..." className="h-24" />
                      </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-8">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Pricing</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="originalPrice">Cost / Original Price (BDT)</Label>
                            <Input id="originalPrice" type="number" value={newProduct.originalPrice || 0} onChange={e => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })} placeholder="0.00" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Sale Price (BDT)</Label>
                            <Input id="price" type="number" value={newProduct.price || 0} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} placeholder="0.00" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Inventory</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" type="number" value={newProduct.stock || 0} onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} placeholder="100" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lowStock">Low Stock Thresh.</Label>
                            <Input id="lowStock" type="number" placeholder="5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Variants & Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-8">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Variants</h4>
                        <div className="space-y-2">
                          <Label>Options (Color, Storage)</Label>
                          <Input placeholder="E.g. Midnight Aluminum, Starlight" />
                          <p className="text-[10px] text-slate-500">Separated by comma</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Highlights</h4>
                        <div className="space-y-2">
                          <Label>Bullet Features</Label>
                          <Textarea placeholder="Always-On Retina Display&#10;ECG App" className="h-20" />
                        </div>
                      </div>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-4 border-b pb-8">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Specifications</h4>
                      <div className="space-y-2">
                        <Label htmlFor="specs">Technical Details</Label>
                        <Textarea id="specs" placeholder="Display: 1.9 OLED&#10;Battery: Up to 18 hours" className="h-24" />
                      </div>
                    </div>

                    {/* Images, Tags, SEO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4 col-span-2">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Images</h4>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer bg-white">
                          <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                          <span className="font-medium text-slate-700 text-sm">Upload gallery images</span>
                        </div>
                      </div>
                      <div className="space-y-4 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Tags</h4>
                          <Input placeholder="smartwatch, wearable" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 mt-4">SEO</h4>
                          <Input placeholder="Meta description..." />
                        </div>
                      </div>
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
                        <Input id="edit-name" value={editProduct.name || ""} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} placeholder="E.g. Zenith Pro Earbuds" />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <div className="flex gap-2">
                          <Select 
                            value={(() => {
                              const currentCat = categories.find(c => c.name === editProduct.category);
                              if (!currentCat) return "";
                              if (currentCat.parent_id) {
                                const parent = categories.find(c => c.id === currentCat.parent_id);
                                return parent?.name || "";
                              }
                              return currentCat.name;
                            })()}
                            onValueChange={(val) => {
                              const cat = categories.find(c => c.name === val);
                              setEditProduct({...editProduct, category: val as string || "", category_id: cat?.id});
                            }}
                          >
                             <SelectTrigger className="w-1/2 rounded-xl"><SelectValue placeholder="Main Category" /></SelectTrigger>
                             <SelectContent className="rounded-xl bg-white">
                                {categories.filter(c => !c.parent_id).map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                             </SelectContent>
                          </Select>
                          <Select 
                            value={(() => {
                              const currentCat = categories.find(c => c.name === editProduct.category);
                              return currentCat?.parent_id ? currentCat.name : "";
                            })()}
                            onValueChange={(val) => {
                              if (!val) return;
                              const cat = categories.find(c => c.name === val);
                              setEditProduct({...editProduct, category: val as string, category_id: cat?.id});
                            }}
                            disabled={(() => {
                              const currentCat = categories.find(c => c.name === editProduct.category);
                              if (!currentCat) return true;
                              const parentId = currentCat.parent_id || currentCat.id;
                              return categories.filter(c => c.parent_id === parentId).length === 0;
                            })()}
                          >
                             <SelectTrigger className="w-1/2 rounded-xl"><SelectValue placeholder="Subcategory" /></SelectTrigger>
                             <SelectContent className="rounded-xl bg-white">
                                {(() => {
                                  const currentCat = categories.find(c => c.name === editProduct.category);
                                  const parentId = currentCat?.parent_id || currentCat?.id;
                                  return categories.filter(c => c.parent_id === parentId).map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>);
                                })()}
                             </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-originalPrice">Original Price (BDT)</Label>
                        <Input id="edit-originalPrice" type="number" value={editProduct.originalPrice || 0} onChange={e => setEditProduct({ ...editProduct, originalPrice: Number(e.target.value) })} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-price">Sale Price (BDT)</Label>
                        <Input id="edit-price" type="number" value={editProduct.price || 0} onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-stock">Inventory Stock</Label>
                        <Input id="edit-stock" type="number" value={editProduct.stock || 0} onChange={e => setEditProduct({ ...editProduct, stock: Number(e.target.value), stockStatus: Number(e.target.value) === 0 ? "Out of Stock" : Number(e.target.value) < 10 ? "Low Stock" : "In Stock", status: Number(e.target.value) === 0 ? "Out of Stock" : Number(e.target.value) < 10 ? "Low Stock" : "Active" })} placeholder="100" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-desc">Full Description</Label>
                      <Textarea id="edit-desc" value={editProduct.description || ""} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} placeholder="Write a detailed product description..." className="h-32" />
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
                    <div className="text-3xl font-bold text-slate-900">BDT 2.4M</div>
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
                              <Badge className={`border-none ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 text-right font-bold text-slate-900">BDT {order.total.toLocaleString()}</TableCell>
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
                              <Badge className={`border-none ${product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
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
                          <TableCell className="px-6 font-medium text-slate-500 text-xs font-mono" title={product.id}>#{parseInt(product.id.replace(/-/g, '').substring(0, 8), 16).toString().slice(-5).padStart(5, '0')}</TableCell>
                          <TableCell>
                            <div className="font-semibold text-slate-900">{product.name}</div>
                          </TableCell>
                          <TableCell className="text-slate-600">{product.category}</TableCell>
                          <TableCell>
                            <div className="font-bold text-slate-900">BDT {product.price.toLocaleString()}</div>
                            {product.originalPrice > product.price && (
                              <div className="text-xs font-semibold text-emerald-600 mt-0.5">Save BDT {(product.originalPrice - product.price).toLocaleString()}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${product.stock > 15 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                              <span className="font-semibold">{product.stock}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`border-none ${product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
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
                                </DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => { setEditProduct(product); setIsEditProductOpen(true); }}>Edit Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditProduct(product); setIsEditProductOpen(true); }}>Update Stock</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700" onClick={() => {
                                  removeProduct(product.id);
                                  toast.success(`${product.name} has been deleted.`);
                                }}>
                                  Delete Product
                                </DropdownMenuItem>
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

          {/* CUSTOMERS TAB */}
          {activeTab === "customers" && (
            <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Registered Users</CardTitle>
                      <CardDescription className="mt-1">{users.length} total users</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No users yet</h3>
                      <p className="text-slate-500 text-sm max-w-xs">Users will appear here when they create an account on the store.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                          <TableHead className="px-6">Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Location Details</TableHead>
                          <TableHead>Joined Date</TableHead>
                          <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors group">
                            <TableCell className="px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 border-2 border-slate-50 shadow-sm">
                                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{user.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">#{user.id.substring(0, 8)}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-slate-900 text-sm">{user.phone}</div>
                              <div className="text-slate-500 text-xs">{user.email || 'no-email@store.com'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-slate-900 font-medium">{user.district || "N/A"}, {user.area || ""}</div>
                              <div className="text-xs text-slate-500 line-clamp-1 max-w-[200px]" title={user.address}>{user.address || "No full address provided"}</div>
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm">{new Date(user.created_at).toLocaleDateString('en-GB')}</TableCell>
                            <TableCell className="text-right px-6">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl h-8 text-xs font-bold border-slate-200"
                                onClick={() => viewCustomerData(user)}
                              >
                                View Data
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Shop Orders</CardTitle>
                      <CardDescription className="mt-1">{orders.length} total transactions</CardDescription>
                    </div>
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                      {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setOrderStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${orderStatusFilter === s
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {orders.filter(o => orderStatusFilter === "All" || o.status === orderStatusFilter).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                        <ShoppingCart className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No {orderStatusFilter !== "All" ? orderStatusFilter.toLowerCase() : ""} orders</h3>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                          <TableHead className="px-6">Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.filter(o => orderStatusFilter === "All" || o.status === orderStatusFilter).map((order) => (
                          <TableRow key={order.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <TableCell className="px-6 font-mono text-xs font-medium text-slate-500" title={order.id}>#{parseInt(order.id.replace(/[^0-9a-f]/gi, '').substring(0, 8), 16).toString().slice(-5).padStart(5, '0')}</TableCell>
                            <TableCell>
                              <div className="font-semibold text-slate-900">{order.customer}</div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                {order.orderItems && order.orderItems.length > 0 ? (
                                  <div className="space-y-0.5">
                                    {order.orderItems.slice(0, 2).map((item: any, idx: number) => (
                                      <div key={idx} className="text-xs text-slate-700 truncate">
                                        <span className="font-semibold">{item.name}</span>
                                        {item.quantity > 1 && <span className="text-slate-400"> ×{item.quantity}</span>}
                                      </div>
                                    ))}
                                    {order.orderItems.length > 2 && (
                                      <span className="text-[10px] text-slate-400 font-medium">+{order.orderItems.length - 2} more</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">{order.items} item(s)</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-slate-900">BDT {order.total.toLocaleString()}</TableCell>
                            <TableCell className="text-slate-600 text-sm">{order.payment}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger render={<Button variant="ghost" className="p-0 h-auto hover:bg-transparent" />}>
                                  <Badge className={`border-none cursor-pointer hover:opacity-80 transition-opacity ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                    (order.status === 'Shipped' || order.status === 'Sent') ? 'bg-purple-100 text-purple-700' :
                                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                          order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                            'bg-slate-100 text-slate-700'
                                    }`}>
                                    {order.status === 'Sent' ? 'Shipped' : order.status}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-40 rounded-xl">
                                  <DropdownMenuGroup>
                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                  </DropdownMenuGroup>
                                  <DropdownMenuSeparator />
                                  {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                                    <DropdownMenuItem key={s} onClick={() => updateOrderStatus(order.id, s)}>
                                      {s}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">
                              {order.date}
                            </TableCell>
                            <TableCell className="text-right px-6">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrderForPrint(order);
                                  setTimeout(() => handlePrintInvoice(order.id), 100);
                                }}
                                className="rounded-xl h-8 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center gap-2 ml-auto"
                              >
                                <Printer className="w-3 h-3" />
                                Invoice
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === "categories" && (
            <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Category Manager</CardTitle>
                    <CardDescription>Organize your products into nested categories</CardDescription>
                  </div>
                  <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                    <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl" onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: "", slug: "", parent_id: "root", description: "", sort_order: categoryTree.length + 1, is_active: true });
                    }} />}>
                      <Plus className="w-4 h-4 mr-2"/> Add Category
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg rounded-3xl">
                       <DialogHeader>
                          <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                          <DialogDescription>Define the name, hierarchy and visibility of this category.</DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Category Name</Label>
                                <Input value={categoryForm.name} onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="e.g. Smartwatches" className="rounded-xl" />
                             </div>
                             <div className="space-y-2">
                                <Label>Slug (Auto-generated)</Label>
                                <Input value={categoryForm.slug} onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})} placeholder="smartwatches" className="rounded-xl" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <Label>Parent Category</Label>
                             <Select value={categoryForm.parent_id || "root"} onValueChange={(val) => setCategoryForm({...categoryForm, parent_id: val})}>
                                <SelectTrigger className="rounded-xl">
                                   <SelectValue placeholder="Select parent">
                                      {categoryForm.parent_id === "root" || !categoryForm.parent_id
                                        ? "None (Top Level)"
                                        : categories.find(c => c.id === categoryForm.parent_id)?.name || categoryForm.parent_id}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                   <SelectItem value="root">None (Top Level)</SelectItem>
                                   {categories.filter(c => c.id !== editingCategory?.id && !c.parent_id).map(cat => (
                                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                   ))}
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label>Description</Label>
                             <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Describe this category..." className="rounded-xl min-h-[80px]" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input type="number" value={categoryForm.sort_order} onChange={(e) => setCategoryForm({...categoryForm, sort_order: parseInt(e.target.value)})} className="rounded-xl" />
                             </div>
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mt-6">
                                <Label className="cursor-pointer">Active Status</Label>
                                <Switch checked={categoryForm.is_active} onCheckedChange={(checked: boolean) => setCategoryForm({...categoryForm, is_active: checked})} />
                             </div>
                          </div>
                       </div>
                       <DialogFooter>
                          <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)} className="rounded-xl">Cancel</Button>
                          <Button onClick={handleSaveCategory} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-lg shadow-blue-600/20">
                             {editingCategory ? "Update Category" : "Save Category"}
                          </Button>
                       </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  {categories.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                      <Layers className="w-16 h-16 text-blue-200 mb-6" />
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No Categories Found</h3>
                      <p className="text-slate-500 max-w-md">Start building your gadget catalog by adding your first top-level category.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                       {categoryTree.map((cat: any) => (
                         <div key={cat.id} className="flex flex-col border-b border-slate-100 last:border-none">
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 group transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                                     {cat.name.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="font-bold text-slate-900 flex items-center gap-2">
                                        {cat.name}
                                        {cat.is_active ? (
                                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px] h-4 px-1.5 border-none">Live</Badge>
                                        ) : (
                                          <Badge className="bg-slate-100 text-slate-500 text-[10px] h-4 px-1.5 border-none">Draft</Badge>
                                        )}
                                     </span>
                                     <span className="text-xs text-slate-400 font-mono">/{cat.slug}</span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-6">
                                  <div className="hidden lg:block text-xs text-slate-500 max-w-sm truncate italic">
                                     {cat.description || "No description provided."}
                                  </div>
                                  <div className="flex items-center gap-1 transition-opacity">
                                     <div className="flex items-center gap-2 mr-2 bg-slate-100 px-2 py-1 rounded-lg">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Active</span>
                                        <Switch checked={cat.is_active} onCheckedChange={() => handleToggleCategoryActive(cat.id, cat.is_active)} className="scale-75 origin-right" />
                                     </div>
                                     <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => {
                                        setEditingCategory(cat);
                                        setCategoryForm({ name: cat.name, slug: cat.slug, parent_id: "root", description: cat.description || "", sort_order: cat.sort_order, is_active: cat.is_active });
                                        setIsCategoryModalOpen(true);
                                     }}>
                                        <Edit className="w-4 h-4" />
                                     </Button>
                                     <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => handleDeleteCategory(cat.id)}>
                                        <Trash2 className="w-4 h-4" />
                                     </Button>
                                  </div>
                               </div>
                            </div>
                            {cat.children && cat.children.length > 0 && (
                               <div className="bg-slate-50/30 pl-14 pr-4 py-2 flex flex-col gap-1 border-t border-slate-50">
                                  {cat.children.sort((a: any, b: any) => a.sort_order - b.sort_order).map((child: any) => (
                                     <div key={child.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group/child">
                                        <div className="flex items-center gap-3">
                                           <ChevronRight className="w-3 h-3 text-slate-300" />
                                           <div className="flex flex-col">
                                              <span className="text-sm font-semibold text-slate-700">{child.name}</span>
                                              <span className="text-[10px] text-slate-400 font-mono">/{child.slug}</span>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3 transition-opacity">
                                           <div className="flex items-center gap-2 mr-1">
                                              <Switch checked={child.is_active} onCheckedChange={() => handleToggleCategoryActive(child.id, child.is_active)} className="scale-75" />
                                           </div>
                                           <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 rounded-md" onClick={() => {
                                              setEditingCategory(child);
                                              setCategoryForm({ name: child.name, slug: child.slug, parent_id: child.parent_id, description: child.description || "", sort_order: child.sort_order, is_active: child.is_active });
                                              setIsCategoryModalOpen(true);
                                           }}>
                                              <Edit className="w-3.5 h-3.5" />
                                           </Button>
                                           <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 rounded-md" onClick={() => handleDeleteCategory(child.id)}>
                                              <Trash2 className="w-3.5 h-3.5" />
                                           </Button>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            )}
                         </div>
                       ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* BRANDS TAB */}
          {activeTab === "brands" && (
            <motion.div key="brands" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Brand List</CardTitle>
                    <CardDescription>Manage gadget manufacturers and brand logos</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl"><Plus className="w-4 h-4 mr-2"/> Add Brand</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-16 flex flex-col items-center justify-center text-center">
                    <Hexagon className="w-16 h-16 text-blue-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Brands Infrastructure Integrated</h3>
                    <p className="text-slate-500 max-w-md">Brands table linked via brand_id on products table. Ready for Apple, Samsung, DJI, Sony, etc.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === "inventory" && (
            <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Inventory & Warehousing</CardTitle>
                    <CardDescription>Advanced stock management and warehouse locations</CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-xl"><PackageCheck className="w-4 h-4 mr-2"/> Low Stock Alerts</Button>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="p-16 flex flex-col items-center justify-center text-center">
                    <PackageCheck className="w-16 h-16 text-emerald-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Multi-Warehouse Support Active</h3>
                    <p className="text-slate-500 max-w-md">The system supports multiple warehouse locations and stock reservations through the new specialized inventory table relations.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Review Moderation</CardTitle>
                    <CardDescription>Approve, reject, or filter customer reviews</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-16 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="w-16 h-16 text-purple-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Review Pipeline Setup</h3>
                    <p className="text-slate-500 max-w-md">Customer reviews are inserted as unapproved and require admin confirmation based on the new schema policy.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* AI ASSISTANT TAB */}
          {activeTab === "ai" && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden max-w-4xl mx-auto border-[3px] border-indigo-100/50">
                <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-indigo-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2 text-indigo-950 font-black tracking-tight"><Sparkles className="w-6 h-6 text-indigo-500"/> AI Product Generator</CardTitle>
                      <CardDescription className="text-indigo-900/60 font-medium">Automatically generate SEO content, descriptions, and structural specs</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                       <Label className="text-indigo-950 font-bold ml-1 text-sm uppercase tracking-wider">Gadget Name or Model</Label>
                       <div className="flex gap-3">
                          <Input placeholder="E.g. NovaWatch Series 5" className="border-indigo-100 focus-visible:ring-indigo-500 h-12 rounded-xl text-lg shadow-sm" />
                          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 px-8 h-12 rounded-xl text-md font-bold transition-all hover:scale-105 active:scale-95"><Sparkles className="w-4 h-4 mr-2"/> Generate</Button>
                       </div>
                    </div>
                    <div className="p-12 border-2 border-dashed border-indigo-200/60 rounded-3xl bg-indigo-50/30 flex flex-col items-center justify-center text-center min-h-[300px]">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-indigo-50 mb-6">
                          <Sparkles className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h4 className="text-lg font-bold text-indigo-950 mb-2">Awaiting Prompt</h4>
                        <p className="text-indigo-900/60 font-medium max-w-sm leading-relaxed">Enter a product name or model up above to magically generate descriptions, technical specification arrays, and bulleted highlights instantly.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PLACEHOLDER FOR OTHER TABS */}
          {activeTab !== "overview" && activeTab !== "products" && activeTab !== "customers" && activeTab !== "orders" && activeTab !== "categories" && activeTab !== "brands" && activeTab !== "inventory" && activeTab !== "reviews" && activeTab !== "ai" && (
            <motion.div key="placeholder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                <Settings className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize">{activeTab} Management</h3>
              <p className="text-slate-500 text-center max-w-sm mb-8">This management module is currently being configured and connected to the database.</p>
              <Button variant="outline" onClick={() => handleTabChange("overview")} className="rounded-xl font-semibold border-slate-200">Return to Overview</Button>
            </motion.div>
          )}

          {/* CUSTOMER DATA MODAL */}
          <Dialog open={isUserViewOpen} onOpenChange={setIsUserViewOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-[95vw] xl:max-w-[1400px] w-full rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none">
              {selectedUser && (
                <>
                  <div className="bg-slate-900 p-8 text-white relative">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-3xl font-bold shadow-xl shadow-blue-500/20">
                        {selectedUser.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                        <p className="text-slate-400 font-mono text-sm mt-1">ID: {selectedUser.id}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto bg-slate-50/30">
                    {/* TOP HORIZONTAL ROW: PROFILE, STATUS, STATS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* 1. BASIC INFO */}
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 flex flex-col items-start min-h-0 w-full overflow-hidden">
                        <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest leading-none block mb-2">Contact Info</Label>
                        <div className="space-y-4 w-full">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100"><Users className="w-5 h-5 text-blue-500" /></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Phone Number</p>
                              <p className="font-bold text-slate-900 truncate tracking-tight">{selectedUser.phone || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-50 flex items-center justify-center shrink-0 border border-cyan-100"><MessageSquare className="w-5 h-5 text-cyan-500" /></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Primary Email</p>
                              <p className="font-extrabold text-slate-900 truncate" title={selectedUser.email}>{selectedUser.email || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. ACCOUNT STATUS */}
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 flex flex-col items-start min-h-0 w-full overflow-hidden">
                        <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest leading-none block mb-2">Account Lifecycle</Label>
                        <div className="space-y-4 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Registered On</span>
                            <span className="text-xs font-black text-slate-900 text-right">{new Date(selectedUser.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="py-3 px-4 bg-emerald-50 border border-emerald-100 rounded-[1.5rem] flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Status</span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider text-right">Active Customer</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. LIFECYCLE STATS */}
                      <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-900/10 text-white flex flex-col items-start min-h-0 w-full overflow-hidden">
                        <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest leading-none block mb-4">Commercial Value</Label>
                        <div className="w-full">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">Total Lifetime Revenue</p>
                          <p className="text-3xl font-black text-white leading-none truncate overflow-hidden text-ellipsis">BDT {orders.filter(o => o.customer === selectedUser.name).reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-2 gap-4 w-full">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 truncate">Total Orders</p>
                            <p className="text-xl font-black truncate">{orders.filter(o => o.customer === selectedUser.name).length}</p>
                          </div>
                          <div className="text-right min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 truncate">AOV</p>
                            <p className="text-xl font-black truncate">BDT {orders.filter(o => o.customer === selectedUser.name).length > 0 ? (orders.filter(o => o.customer === selectedUser.name).reduce((sum, o) => sum + o.total, 0) / orders.filter(o => o.customer === selectedUser.name).length).toFixed(0) : '0'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM ROW: MAIN CONTENT (LEFT) & SECONDARY (RIGHT) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* ORDER HISTORY */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-2 border-b-2 border-slate-900">
                            Transaction History
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {orders.filter(o => o.customer === selectedUser.name).length === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><ShoppingCart className="w-8 h-8 text-slate-200" /></div>
                              <p className="text-slate-400 font-bold">No purchase history found</p>
                            </div>
                          ) : (
                            orders.filter(o => o.customer === selectedUser.name).map(order => (
                              <div key={order.id} className="bg-white p-4 border border-slate-100 rounded-[1.5rem] flex items-center gap-4 hover:shadow-md transition-all group">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
                                  <Image src={order.image} alt="Product" fill className="object-contain p-2 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-black text-slate-900 text-base">BDT {order.total.toLocaleString()}</span>
                                    <Badge className={`text-[9px] font-black px-2 py-0.5 rounded-md border-none ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                      order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                        'bg-blue-100 text-blue-700'
                                      }`}>{order.status.toUpperCase()}</Badge>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-bold text-slate-400">{order.date}</span>
                                    <span className="text-[11px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{order.items} ITEMS</span>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{order.payment}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* DELIVERY ADDRESSES */}
                      <div className="space-y-4">
                        <div className="px-2">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-2 border-b-2 border-slate-200">
                            Saved Addresses
                          </h3>
                        </div>
                        <div className="space-y-4">
                          {userAddresses.length === 0 ? (
                            <div className="p-12 bg-slate-100/50 rounded-[2.5rem] border border-dashed border-slate-200 text-center text-slate-400 font-bold text-sm">No addresses saved</div>
                          ) : (
                            userAddresses.map(addr => (
                              <div key={addr.id} className={`bg-white p-5 rounded-[1.5rem] border-2 transition-all ${addr.is_default ? 'border-blue-600 shadow-lg shadow-blue-600/5' : 'border-slate-50 shadow-sm'}`}>
                                <div className="flex justify-between items-center mb-4">
                                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${addr.category === 'Home' ? 'bg-blue-100 text-blue-700' :
                                    addr.category === 'Office' ? 'bg-amber-100 text-amber-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>{addr.category}</span>
                                  {addr.is_default && <span className="text-[10px] font-black text-blue-600 flex items-center gap-1.5"><Check className="w-4 h-4" /> DEFAULT</span>}
                                </div>
                                <p className="font-black text-slate-900 text-sm leading-tight">{addr.full_address}</p>
                                <p className="text-slate-400 text-[11px] font-bold mt-2 uppercase tracking-tight">{addr.area}, {addr.district}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
                    <Button onClick={() => setIsUserViewOpen(false)} className="rounded-xl w-full py-6 font-bold bg-slate-900 hover:bg-slate-800 transition-all">Close User Profile</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </AnimatePresence>

      </main>

      {/* Hidden Invoice Components for Printing */}
      <div className="hidden print-invoice-container">
        {selectedOrderForPrint ? (
          <OrderInvoice order={selectedOrderForPrint} />
        ) : (
          orders.map(order => (
            <OrderInvoice key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}
