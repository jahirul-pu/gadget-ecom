"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  ShoppingBag,
  Bell,
  Search,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Home,
  Briefcase,
  Building2,
  Check,
  Printer
} from "lucide-react";
import { OrderInvoice } from "@/components/OrderInvoice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bdDistricts } from "@/lib/locations";
import { toast } from "sonner";
import { useStore, Address } from "@/store/useStore";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Order History", icon: Package },
  { id: "tracking", label: "Order Tracking", icon: Truck },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const TRACKING_STEPS = [
  { id: "Pending", label: "Confirmed", date: "12 Mar, 10:00 AM", description: "Your order has been received." },
  { id: "Processing", label: "Processing", date: "Pending", description: "We are preparing your items." },
  { id: "Shipped", label: "Shipped", date: "Pending", description: "Your order has been handed over to the courier." },
  { id: "Delivered", label: "Delivered", date: "Pending", description: "Your order has been securely delivered." },
];

export default function UserDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const RECENT_ORDERS = useStore(state => state.orders);
  const updateOrderStatus = useStore(state => state.updateOrderStatus);
  const addresses = useStore(state => state.addresses);
  const fetchAddresses = useStore(state => state.fetchAddresses);
  const addAddress = useStore(state => state.addAddress);
  const updateAddress = useStore(state => state.updateAddress);
  const deleteAddress = useStore(state => state.deleteAddress);
  const _hasHydrated = useStore(state => state._hasHydrated);
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(RECENT_ORDERS[0]?.id || null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    category: 'Home',
    district: '',
    area: '',
    fullAddress: '',
    isDefault: false
  });
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<any | null>(null);

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

  useEffect(() => {
    setMounted(true);
    const savedTab = localStorage.getItem('dashboard_active_tab');
    if (savedTab) setActiveTab(savedTab);
    
    if (user?.id) fetchAddresses(user.id);
  }, [user?.id, fetchAddresses]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem('dashboard_active_tab', tabId);
  };

  const selectedOrder = RECENT_ORDERS.find(o => o.id === selectedOrderId) || RECENT_ORDERS[0];

  useEffect(() => {
    if (mounted && _hasHydrated && !user) {
      router.push('/login');
    }
  }, [mounted, _hasHydrated, user, router]);

  if (!mounted || !_hasHydrated || !user) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSignOut = () => {
    setUser(null);
    router.push("/");
  };

  const handleSaveAddress = async () => {
    if (!addressForm.district || !addressForm.area || !addressForm.fullAddress) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingAddress) {
        await updateAddress({ ...editingAddress, ...(addressForm as any), userId: user.id });
        toast.success("Address updated successfully");
      } else {
        await addAddress({ 
          userId: user.id, 
          ...(addressForm as any) 
        });
        toast.success("Address added successfully");
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      setAddressForm({ category: 'Home', district: '', area: '', fullAddress: '', isDefault: false });
      // Re-fetch to sync default status logic from server
      await fetchAddresses(user.id);
    } catch (e: any) {
      toast.error(e.message || "Failed to save address");
    }
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      category: addr.category,
      district: addr.district,
      area: addr.area,
      fullAddress: addr.fullAddress,
      isDefault: addr.isDefault
    });
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    try {
        await deleteAddress(id);
        toast.success("Address deleted successfully");
        // Re-fetch to ensure the last remaining address is shown as default in UI
        if (user?.id) await fetchAddresses(user.id);
    } catch (e: any) {
        // This will now catch "can't delete default address" from server
        toast.error(e.message || "Failed to delete address");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="w-5 h-5 text-slate-600" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden sticky top-24">
              <div className="p-6 bg-slate-900 text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-xl backdrop-blur-md border border-white/20">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.fullName}</h3>
                  <p className="text-sm text-slate-400">Regular Member</p>
                </div>
              </div>
              <div className="p-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                      activeTab === item.id 
                        ? "bg-blue-50 text-blue-600 font-semibold" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-blue-600" : "text-slate-400"}`} />
                      {item.label}
                    </div>
                    {activeTab === item.id && <ChevronRight className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
                
                <Separator className="my-4" />
                
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              
              {/* DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="hidden md:flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                  </div>

                  {/* Highlight Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <Card className="border-none shadow-sm rounded-3xl bg-blue-600 text-white overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <CardContent className="p-6 relative z-10">
                        <ShoppingBag className="w-8 h-8 text-blue-200 mb-4" />
                        <h4 className="text-3xl font-bold text-white mb-1">{RECENT_ORDERS.length}</h4>
                        <p className="text-blue-100 font-medium">Total Orders</p>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
                      <CardContent className="p-6">
                        <Truck className="w-8 h-8 text-cyan-500 mb-4" />
                        <h4 className="text-3xl font-bold text-slate-900 mb-1">{RECENT_ORDERS.filter(o => o.status !== 'Delivered').length}</h4>
                        <p className="text-slate-500 font-medium">Active Delivery</p>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
                      <CardContent className="p-6">
                        <Heart className="w-8 h-8 text-rose-500 mb-4" />
                        <h4 className="text-3xl font-bold text-slate-900 mb-1">5</h4>
                        <p className="text-slate-500 font-medium">Wishlist Items</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Orders Sneak Peek */}
                  <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden mb-8">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-slate-900">Recent Orders</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => handleTabChange("orders")} className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">View All</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-100">
                        {RECENT_ORDERS.map((order) => (
                          <div key={order.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center shrink-0">
                                <Image src={order.image} alt="Product" fill className="object-contain p-2" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900" title={order.id}>#{parseInt(order.id.replace(/[^0-9a-f]/gi, '').substring(0, 8), 16).toString().slice(-5).padStart(5, '0')}</h4>
                                <p className="text-sm text-slate-500 mt-0.5">{order.date} • {order.items} Item(s)</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6">
                              <div className="text-left sm:text-right">
                                <div className="font-bold text-slate-900">৳{order.total.toLocaleString()}</div>
                                <Badge className={`mt-1 border-none ${
                                  order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                                  order.status === 'Out for Delivery' ? 'bg-cyan-100 text-cyan-700' : 
                                  (order.status === 'Shipped' || order.status === 'Sent') ? 'bg-purple-100 text-purple-700' : 
                                  order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                                  order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                  order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {order.status === 'Sent' ? 'Shipped' : order.status}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedOrderId(order.id); handleTabChange("tracking"); }} className="group-hover:translate-x-1 transition-transform">
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* TRACKING TAB */}
              {activeTab === "tracking" && (
                <motion.div key="tracking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Order Tracking</h2>
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="Enter Tracking ID" className="pl-9 h-11 bg-white border-slate-200 rounded-xl" />
                    </div>
                  </div>

                  <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden mb-6">
                    <CardHeader className="bg-slate-900 text-white p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-slate-400 text-sm font-medium mb-1">Order ID</p>
                          <h3 className="text-xl font-bold" title={selectedOrder?.id}>
                            #{selectedOrder ? parseInt(selectedOrder.id.replace(/[^0-9a-f]/gi, '').substring(0, 8), 16).toString().slice(-5).padStart(5, '0') : "N/A"}
                          </h3>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-slate-400 text-sm font-medium mb-1">Estimated Delivery</p>
                          <h3 className="text-xl font-bold text-emerald-400">14 Mar, 2026</h3>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="mb-10 p-4 bg-blue-50 rounded-2xl flex items-start gap-4 border border-blue-100">
                         <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                            <Truck className="w-6 h-6 text-blue-600" />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-900 text-lg">
                              {selectedOrder?.status === 'Cancelled' ? 'This order was cancelled' : `Your order is ${selectedOrder?.status.toLowerCase() === 'sent' || selectedOrder?.status.toLowerCase() === 'shipped' ? 'shipped' : selectedOrder?.status.toLowerCase() || 'being processed'}`}
                            </h4>
                            <p className="text-slate-600 mt-1">
                              {selectedOrder?.status === 'Cancelled' ? 'This order has been cancelled and will not be fulfilled.' :
                               selectedOrder?.status.toLowerCase() === 'pending' ? 'We have received your order and it is awaiting confirmation.' :
                               selectedOrder?.status.toLowerCase() === 'processing' ? 'We are currently picking and packing your items.' :
                               (selectedOrder?.status.toLowerCase() === 'shipped' || selectedOrder?.status.toLowerCase() === 'sent') ? 'Your order has been dispatched and is on its way.' :
                               selectedOrder?.status === 'Out for Delivery' ? 'Our delivery partner is out with your package.' :
                               selectedOrder?.status.toLowerCase() === 'delivered' ? 'Your order has been successfully delivered. Enjoy!' :
                               'We are actively preparing your items for shipment.'}
                            </p>
                         </div>
                      </div>

                      {/* Visual Progress Tracker */}
                      <div className="relative pl-6 md:pl-0">
                        {/* Hidden on mobile, visible on desktop lines */}
                        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-1 bg-slate-100 rounded-full" />
                        <div 
                          className={`hidden md:block absolute top-[28px] left-[10%] h-1 rounded-full transition-all duration-1000 ${selectedOrder?.status === 'Cancelled' ? 'bg-rose-200' : 'bg-blue-600'}`} 
                          style={{ 
                            width: selectedOrder?.status === 'Cancelled' ? '100%' :
                                   selectedOrder?.status === 'Delivered' ? '100%' : 
                                   selectedOrder?.status === 'Out for Delivery' ? '80%' : 
                                   (selectedOrder?.status === 'Shipped' || selectedOrder?.status === 'Sent') ? '55%' :
                                   selectedOrder?.status === 'Processing' ? '30%' : '5%' 
                          }} 
                        />

                        {/* Mobile Vertical Line */}
                        <div className="md:hidden absolute top-0 bottom-0 left-[27px] w-0.5 bg-slate-100" />
                        <div 
                          className={`md:hidden absolute top-0 left-[27px] w-0.5 transition-all duration-1000 ${selectedOrder?.status === 'Cancelled' ? 'bg-rose-200' : 'bg-blue-600'}`} 
                          style={{ 
                            height: selectedOrder?.status === 'Cancelled' ? '100%' :
                                    selectedOrder?.status === 'Delivered' ? '100%' : 
                                    selectedOrder?.status === 'Out for Delivery' ? '80%' : 
                                    (selectedOrder?.status === 'Shipped' || selectedOrder?.status === 'Sent') ? '60%' :
                                    selectedOrder?.status === 'Processing' ? '35%' : '10%' 
                          }}
                        />

                        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0 relative z-10">
                           {TRACKING_STEPS.map((step, idx) => {
                             if (selectedOrder?.status === 'Cancelled') {
                               return (
                                 <div key={step.id} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 lg:w-48 opacity-50">
                                   <div className="w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-200 text-slate-300 transition-colors shrink-0 z-10 relative bg-white">
                                     <Circle className="w-5 h-5 fill-white text-slate-200" />
                                   </div>
                                    <div className="md:text-center mt-1 md:mt-0">
                                     <h5 className="font-bold text-slate-400">{step.label}</h5>
                                     <p className="text-xs text-slate-500 mt-1 mb-1 font-medium">Cancelled</p>
                                   </div>
                                 </div>
                               );
                             }

                             const isCompleted = 
                               selectedOrder?.status === 'Delivered' ? true :
                               selectedOrder?.status === 'Out for Delivery' ? ['Pending', 'Processing', 'Shipped', 'Out for Delivery'].includes(step.id) :
                               (selectedOrder?.status === 'Shipped' || selectedOrder?.status === 'Sent') ? ['Pending', 'Processing', 'Shipped'].includes(step.id) :
                               selectedOrder?.status === 'Processing' ? ['Pending', 'Processing'].includes(step.id) :
                               step.id === 'Pending';

                             return (
                               <div key={step.id} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 lg:w-48">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-colors shrink-0 z-10 relative bg-white ${
                                   isCompleted ? 'border-blue-600 text-blue-600' : 'border-slate-200 text-slate-300'
                                 }`}>
                                   {isCompleted ? <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white" /> : <Circle className="w-5 h-5 fill-white text-slate-200" />}
                                 </div>
                                 <div className="md:text-center mt-1 md:mt-0">
                                   <h5 className={`font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</h5>
                                   <p className="text-xs text-slate-500 mt-1 mb-1 font-medium">{isCompleted ? (step.id === 'placed' ? selectedOrder?.date : 'Processed') : 'Pending'}</p>
                                   <p className="text-sm text-slate-500 hidden md:block mx-auto max-w-[140px] leading-snug">{step.description}</p>
                                 </div>
                               </div>
                             );
                           })}
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ORDER HISTORY TAB */}
              {activeTab === "orders" && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Order History</h2>
                   </div>
                   <div className="space-y-6">
                     {RECENT_ORDERS.map((order) => (
                       <Card key={order.id} className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
                          <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                             <div>
                               <p className="text-sm text-slate-500 font-medium">Order Placed</p>
                               <p className="font-bold text-slate-900">{order.date}</p>
                             </div>
                             <div className="hidden sm:block">
                               <p className="text-sm text-slate-500 font-medium">Total</p>
                               <p className="font-bold text-slate-900">৳{order.total.toLocaleString()}</p>
                             </div>
                             <div className="hidden md:block">
                               <p className="text-sm text-slate-500 font-medium">Order ID</p>
                               <p className="font-bold text-slate-900" title={order.id}>#{parseInt(order.id.replace(/[^0-9a-f]/gi, '').substring(0, 8), 16).toString().slice(-5).padStart(5, '0')}</p>
                             </div>
                             <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <Button variant="outline" className="flex-1 sm:flex-none border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl" onClick={() => { setSelectedOrderId(order.id); handleTabChange("tracking"); }}>Track Order</Button>
                                <Button
                                  variant="secondary"
                                  className="flex-1 sm:flex-none bg-slate-900 text-white hover:bg-slate-800 rounded-xl flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedOrderForPrint(order);
                                    setTimeout(() => handlePrintInvoice(order.id), 100);
                                  }}
                                >
                                    <Printer className="w-4 h-4" />
                                    Invoice
                                 </Button>
                              </div>
                          </CardHeader>
                          <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center">
                             <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 shrink-0 relative flex justify-center items-center">
                                <Image src={order.image} alt="Product" fill className="object-contain p-2" />
                             </div>
                             <div className="flex-1 text-center sm:text-left">
                                <Badge className={`mb-2 border-none ${
                                   order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                   order.status === 'Out for Delivery' ? 'bg-cyan-100 text-cyan-700' :
                                   (order.status === 'Shipped' || order.status === 'Sent') ? 'bg-purple-100 text-purple-700' :
                                   order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                   order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                   order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                   'bg-slate-100 text-slate-700'
                                 }`}>
                                  {order.status === 'Sent' ? 'Shipped' : order.status}
                                </Badge>
                                <h4 className="font-bold text-lg text-slate-900 mb-1">
                                  {order.orderItems && order.orderItems.length > 0
                                    ? order.orderItems.map((item: any) => item.name).join(', ')
                                    : order.status === 'Delivered' ? 'Delivered successfully' : 'Order in progress'}
                                </h4>
                                <p className="text-slate-500 text-sm">{order.items} item{order.items !== 1 ? 's' : ''} · {order.payment}</p>
                             </div>
                             <div className="w-full sm:w-auto pt-4 sm:pt-0 flex flex-col gap-2 min-w-[140px]">
                                {order.status === 'Pending' && (order.payment === 'COD' || order.payment === 'Cash on Delivery') && (
                                  <Button
                                    variant="outline"
                                    onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                                    className="w-full text-rose-600 border-rose-100 hover:bg-rose-50 h-10 rounded-xl text-xs font-bold"
                                  >
                                    Cancel Order
                                  </Button>
                                )}
                                <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-10 rounded-xl group text-xs font-bold">
                                  Buy Again <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                             </div>
                          </CardContent>
                       </Card>
                     ))}
                   </div>
                </motion.div>
              )}

              {/* SAVED ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Saved Addresses</h2>
                    <Button
                      onClick={() => { setEditingAddress(null); setAddressForm({ category: 'Home', district: '', area: '', fullAddress: '', isDefault: false }); setIsAddressModalOpen(true); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-bold flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Address
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {addresses.length === 0 ? (
                      <Card className="md:col-span-2 border-dashed border-2 border-slate-200 shadow-none rounded-3xl bg-transparent p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                          <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No addresses saved</h3>
                        <p className="text-slate-500 text-sm max-w-xs mb-6">You haven't added any shipping addresses yet. Add one to speed up your checkout process.</p>
                      </Card>
                    ) : (
                      addresses.map((addr) => (
                         <div key={addr.id} className={`group relative bg-white border rounded-2xl p-3.5 transition-all hover:shadow-md ${addr.isDefault ? 'border-blue-600 ring-1 ring-blue-600/5' : 'border-slate-100 shadow-sm'}`}>
                           <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-xl shrink-0 ${
                               addr.category === 'Home' ? 'bg-blue-50 text-blue-600' :
                               addr.category === 'Office' ? 'bg-amber-50 text-amber-600' :
                               'bg-purple-50 text-purple-600'
                             }`}>
                               {addr.category === 'Home' && <Home className="w-4 h-4" />}
                               {addr.category === 'Office' && <Briefcase className="w-4 h-4" />}
                               {addr.category === 'Business' && <Building2 className="w-4 h-4" />}
                             </div>
                             <div className="flex-1 min-w-0 pr-8">
                               <div className="flex items-center gap-2 mb-0.5">
                                 <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">{addr.category}</h4>
                                 {addr.isDefault && <span className="bg-blue-600 text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Default</span>}
                               </div>
                               <p className="text-slate-900 text-sm font-bold leading-tight truncate">{addr.area}, {addr.district}</p>
                               <p className="text-slate-500 text-[11px] mt-0.5 truncate" title={addr.fullAddress}>{addr.fullAddress}</p>
                             </div>
                           </div>

                           <div className="absolute top-3.5 right-3.5 hidden group-hover:flex items-center gap-1">
                             <Button variant="ghost" size="icon" onClick={() => openEditAddress(addr)} className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                               <Edit2 className="w-3 h-3" />
                             </Button>
                             {!addr.isDefault && (
                               <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr.id)} className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                                 <Trash2 className="w-3 h-3" />
                               </Button>
                             )}
                           </div>
                         </div>
                       ))
                    )}
                  </div>

                  <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                        <DialogDescription>
                          Provide your accurate delivery details to ensure fast shipping.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-3 gap-3">
                          {['Home', 'Office', 'Business'].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setAddressForm({...addressForm, category: cat as "Home" | "Office" | "Business"})}
                              className={`h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 relative ${
                                addressForm.category === cat
                                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                              {cat === 'Home' && <Home className="w-6 h-6" />}
                              {cat === 'Office' && <Briefcase className="w-6 h-6" />}
                              {cat === 'Business' && <Building2 className="w-6 h-6" />}
                              <span className="font-bold text-sm tracking-wide">{cat}</span>
                              {addressForm.category === cat && <div className="absolute top-2 right-2"><Check className="w-4 h-4" /></div>}
                            </button>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-900 font-semibold">District</Label>
                             <Select value={addressForm.district ? addressForm.district : undefined} onValueChange={(val: string | null) => setAddressForm({...addressForm, district: val ?? '', area: ''})}>
                              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Select District" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl">
                                {Object.keys(bdDistricts).map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-900 font-semibold">Area</Label>
                            <Select disabled={!addressForm.district} value={addressForm.area ? addressForm.area : undefined} onValueChange={(val: string | null) => setAddressForm({...addressForm, area: val ?? ''})}>
                              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 disabled:opacity-50">
                                <SelectValue placeholder="Select Area" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl">
                                {addressForm.district && bdDistricts[addressForm.district]?.map((a) => (
                                  <SelectItem key={a} value={a}>{a}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-900 font-semibold">Detailed Address</Label>
                          <Input
                            value={addressForm.fullAddress}
                            onChange={(e) => setAddressForm({...addressForm, fullAddress: e.target.value})}
                            placeholder="House no, road no, block, etc."
                            className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                          />
                        </div>

                        <div
                           className={`flex items-center gap-2 ${addressForm.isDefault ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                           onClick={() => {
                             if (!addressForm.isDefault) {
                               setAddressForm({...addressForm, isDefault: true});
                             }
                           }}
                         >
                           <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${addressForm.isDefault ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                             {addressForm.isDefault && <Check className="w-3.5 h-3.5 text-white" />}
                           </div>
                           <Label className="text-sm font-medium text-slate-600 cursor-pointer">
                             {addressForm.isDefault ? 'Default Shipping Address' : 'Set as default shipping address'}
                           </Label>
                         </div>
                      </div>

                      <DialogFooter className="sm:justify-between gap-3">
                        <Button variant="outline" onClick={() => setIsAddressModalOpen(false)} className="rounded-xl h-12 flex-1 border-slate-200 font-bold hover:bg-slate-50">Cancel</Button>
                        <Button onClick={handleSaveAddress} className="rounded-xl h-12 flex-1 bg-blue-600 hover:bg-blue-700 font-bold">Save Address</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              )}
                           {/* ACCOUNT SETTINGS TAB */}
               {activeTab === "settings" && (
                 <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                     <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
                   </div>

                   <div className="grid gap-6">
                     <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                       <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                         <CardTitle className="text-lg">Personal Information</CardTitle>
                         <CardDescription>Update your personal details and how we contact you.</CardDescription>
                       </CardHeader>
                       <CardContent className="p-6 space-y-4">
                         <div className="grid md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-slate-600 font-medium">Full Name</Label>
                             <Input value={user.fullName} readOnly className="bg-slate-50 border-slate-200 rounded-xl" />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-slate-600 font-medium">Phone Number</Label>
                             <Input value={user.phone} readOnly className="bg-slate-50 border-slate-200 rounded-xl" />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-slate-600 font-medium">Email Address</Label>
                             <Input value={user.email || 'Not provided'} readOnly className="bg-slate-50 border-slate-200 rounded-xl" />
                           </div>
                         </div>
                       </CardContent>
                     </Card>

                     <Card className="border-rose-100 shadow-sm rounded-3xl overflow-hidden bg-rose-50/20">
                       <CardHeader className="bg-rose-50 border-b border-rose-100/50">
                         <CardTitle className="text-lg text-rose-900 flex items-center gap-2">
                           <Trash2 className="w-5 h-5" />
                           Danger Zone
                         </CardTitle>
                         <CardDescription className="text-rose-600">Irreversible actions regarding your account.</CardDescription>
                       </CardHeader>
                       <CardContent className="p-6">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div>
                             <h4 className="font-bold text-slate-900">Delete Account</h4>
                             <p className="text-sm text-slate-500 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                           </div>
                            <Dialog>
                              <DialogTrigger render={<Button variant="destructive" className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-rose-600/20" />}>
                                Delete My Account
                              </DialogTrigger>
                             <DialogContent className="rounded-3xl border-rose-100 shadow-2xl">
                               <DialogHeader>
                                 <DialogTitle className="text-2xl font-bold text-rose-600">Are you absolutely sure?</DialogTitle>
                                 <DialogDescription className="text-slate-600 text-lg py-2">
                                   This action will permanently delete your profile. Your order history will remain anonymously for our records.
                                 </DialogDescription>
                               </DialogHeader>
                               <DialogFooter className="mt-6 gap-3 sm:gap-0">
                                 <Button variant="outline" className="rounded-xl h-12 border-slate-200 flex-1 hover:bg-slate-50">I've changed my mind</Button>
                                 <Button
                                   onClick={async () => {
                                     try {
                                       const res = await fetch('/api/users/delete', {
                                         method: 'POST',
                                         headers: { 'Content-Type': 'application/json' },
                                         body: JSON.stringify({ userId: user.id })
                                       });
                                       if (!res.ok) throw new Error("Failed to delete account");

                                       toast.success("Account deleted successfully. We're sorry to see you go.");
                                       setUser(null);
                                       router.push("/");
                                     } catch (e) {
                                       toast.error("An error occurred while deleting your account");
                                     }
                                   }}
                                   className="rounded-xl h-12 bg-rose-600 hover:bg-rose-700 flex-1 font-bold shadow-lg shadow-rose-600/20"
                                 >
                                   Yes, Delete Everything
                                 </Button>
                               </DialogFooter>
                             </DialogContent>
                           </Dialog>
                         </div>
                       </CardContent>
                     </Card>
                   </div>
                 </motion.div>
               )}

               {/* EMPTY TABS (Wishlist) */}
               {activeTab === "wishlist" && (
                 <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100">
                   <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                     <Heart className="w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2 capitalize">{activeTab}</h3>
                   <p className="text-slate-500 text-center max-w-sm mb-6">This section is currently under development. Setup your preferences soon.</p>
                   <Button variant="outline" onClick={() => handleTabChange("dashboard")} className="rounded-xl font-semibold">Back to Dashboard</Button>
                 </motion.div>
               )}

            </AnimatePresence>
          </div>

        </div>
      </div>
      {/* Hidden Invoice Components for Printing */}
      <div className="hidden">
        {selectedOrderForPrint && (
          <OrderInvoice order={selectedOrderForPrint} />
        )}
      </div>
    </div>
  );
}
