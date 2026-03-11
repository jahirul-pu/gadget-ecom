"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Order History", icon: Package },
  { id: "tracking", label: "Order Tracking", icon: Truck },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const TRACKING_STEPS = [
  { id: "placed", label: "Order Placed", date: "12 Mar, 10:00 AM", completed: true, description: "Your order has been received." },
  { id: "processing", label: "Processing", date: "12 Mar, 02:30 PM", completed: true, description: "We are preparing your items." },
  { id: "shipped", label: "Shipped", date: "Pending", completed: false, description: "Your order has been handed over to the courier." },
  { id: "out", label: "Out for Delivery", date: "Pending", completed: false, description: "The rider is on the way to your address." },
  { id: "delivered", label: "Delivered", date: "Pending", completed: false, description: "Your order has been securely delivered." },
];

export default function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const RECENT_ORDERS = useStore(state => state.orders);

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
                  F
                </div>
                <div>
                  <h3 className="font-bold text-lg">Fahim Rahman</h3>
                  <p className="text-sm text-slate-400">Regular Member</p>
                </div>
              </div>
              <div className="p-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
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
                
                <button className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-red-500 hover:bg-red-50">
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
                        <h4 className="text-3xl font-bold text-white mb-1">12</h4>
                        <p className="text-blue-100 font-medium">Total Orders</p>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
                      <CardContent className="p-6">
                        <Truck className="w-8 h-8 text-cyan-500 mb-4" />
                        <h4 className="text-3xl font-bold text-slate-900 mb-1">1</h4>
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
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")} className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">View All</Button>
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
                                <h4 className="font-bold text-slate-900">{order.id}</h4>
                                <p className="text-sm text-slate-500 mt-0.5">{order.date} • {order.items} Item(s)</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6">
                              <div className="text-left sm:text-right">
                                <div className="font-bold text-slate-900">৳{order.total.toLocaleString()}</div>
                                <Badge className={`mt-1 border-none ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {order.status}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
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
                          <h3 className="text-xl font-bold">ORD-74011</h3>
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
                           <h4 className="font-bold text-slate-900 text-lg">Your order is processing</h4>
                           <p className="text-slate-600 mt-1">We are actively preparing your items for shipment. You will receive an SMS once it's on the way.</p>
                         </div>
                      </div>

                      {/* Visual Progress Tracker */}
                      <div className="relative pl-6 md:pl-0">
                        {/* Hidden on mobile, visible on desktop lines */}
                        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-1 bg-slate-100 rounded-full" />
                        <div 
                          className="hidden md:block absolute top-[28px] left-[10%] h-1 bg-blue-600 rounded-full transition-all duration-1000" 
                          style={{ width: '25%' }} 
                        />

                        {/* Mobile Vertical Line */}
                        <div className="md:hidden absolute top-0 bottom-0 left-[27px] w-0.5 bg-slate-100" />
                        <div className="md:hidden absolute top-0 bottom-1/2 left-[27px] w-0.5 bg-blue-600" />

                        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0 relative z-10">
                          {TRACKING_STEPS.map((step, idx) => (
                            <div key={step.id} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 lg:w-48">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-colors shrink-0 z-10 relative bg-white ${
                                step.completed ? 'border-blue-600 text-blue-600' : 'border-slate-200 text-slate-300'
                              }`}>
                                {step.completed ? <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white" /> : <Circle className="w-5 h-5 fill-white text-slate-200" />}
                              </div>
                              <div className="md:text-center mt-1 md:mt-0">
                                <h5 className={`font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</h5>
                                <p className="text-xs text-slate-500 mt-1 mb-1 font-medium">{step.date}</p>
                                <p className="text-sm text-slate-500 hidden md:block mx-auto max-w-[140px] leading-snug">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                  
                  {/* Items in this shipment */}
                  <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">Items in this shipment</h3>
                  <div className="bg-white border border-slate-100 rounded-3xl p-4 flex items-center gap-4 mb-8">
                     <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 relative">
                        <Image src="/images/smart_home_cam_1773260594833.png" alt="Aura Smart Security Hub" fill className="object-contain p-2" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-slate-900 line-clamp-1">Aura Smart Security Hub</h4>
                        <p className="text-sm text-slate-500">Qty: 1</p>
                     </div>
                     <div className="font-bold text-slate-900 pr-4">৳8,500</div>
                  </div>
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
                               <p className="font-bold text-slate-900">{order.id}</p>
                             </div>
                             <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <Button variant="outline" className="flex-1 sm:flex-none border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl" onClick={() => setActiveTab("tracking")}>Track Order</Button>
                                <Button variant="secondary" className="flex-1 sm:flex-none bg-slate-900 text-white hover:bg-slate-800 rounded-xl">Invoice</Button>
                             </div>
                          </CardHeader>
                          <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center">
                             <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 shrink-0 relative flex justify-center items-center">
                                <Image src={order.image} alt="Product" fill className="object-contain p-2" />
                             </div>
                             <div className="flex-1 text-center sm:text-left">
                                <Badge className={`mb-2 border-none ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {order.status}
                                </Badge>
                                <h4 className="font-bold text-lg text-slate-900 mb-1">
                                  {order.status === 'Delivered' ? 'Delivered successfully' : 'Preparing for shipment'}
                                </h4>
                                <p className="text-slate-500 text-sm">Your order contains {order.items} items.</p>
                             </div>
                             <div className="w-full sm:w-auto pt-4 sm:pt-0">
                                <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-12 rounded-xl group">
                                  Buy Again <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                             </div>
                          </CardContent>
                       </Card>
                     ))}
                   </div>
                </motion.div>
              )}

              {/* EMPTY TABS (Wishlist, Addresses, Settings) */}
              {(activeTab === "wishlist" || activeTab === "addresses" || activeTab === "settings") && (
                <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    {activeTab === "wishlist" && <Heart className="w-8 h-8" />}
                    {activeTab === "addresses" && <MapPin className="w-8 h-8" />}
                    {activeTab === "settings" && <Settings className="w-8 h-8" />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 capitalize">{activeTab}</h3>
                  <p className="text-slate-500 text-center max-w-sm mb-6">This section is currently under development. Setup your preferences soon.</p>
                  <Button variant="outline" onClick={() => setActiveTab("dashboard")} className="rounded-xl font-semibold">Back to Dashboard</Button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
