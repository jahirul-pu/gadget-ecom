"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, MapPin, Truck,  Wallet, CreditCard, Ban, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bdDistricts } from "@/lib/locations";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useStore } from "@/store/useStore";

export default function CheckoutPage() {
  const cartItems = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const addOrder = useStore(state => state.addOrder);
  const updateCartQuantity = useStore(state => state.updateCartQuantity);
  const removeFromCart = useStore(state => state.removeFromCart);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const isOutsideDhakaCity = ["Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar"].includes(selectedArea);
  const isInsideDhaka = selectedDistrict === "Dhaka" && !isOutsideDhakaCity;
  const shipping = isInsideDhaka ? 60 : selectedDistrict ? 120 : 0;
  const total = subtotal + shipping;

  const nextStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName) newErrors.fullName = "Full name is required";
    if (!phone) newErrors.phone = "Phone number is required";
    else {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (cleanPhone.length !== 11) newErrors.phone = "Must be exactly 11 digits";
    }
    if (!address) newErrors.address = "Address is required";
    if (!selectedDistrict) newErrors.district = "District is required";
    if (!selectedArea) newErrors.area = "Area is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correctly fill all required fields");
      return;
    }

    setErrors({});
    setStep(2);
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Ban className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Checkout is unavailable</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">You cannot proceed to checkout because your cart is currently empty. Please drop some items in your cart first.</p>
        <Link href="/">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-bold">
            Return to Store
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Options & Progress Indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href={step === 1 ? "/cart" : "#"} onClick={() => step === 2 && setStep(1)}>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300 ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-white text-blue-600' : 'bg-slate-300 text-slate-600'}`}>1</div>
              Shipping
            </div>
            <div className={`w-8 h-1 transition-colors duration-300 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-white text-blue-600' : 'bg-slate-300 text-slate-600'}`}>2</div>
              Payment
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1">
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden mb-6">
                    <CardHeader className="bg-white border-b border-slate-100 pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 bg-white space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className={errors.fullName ? "text-red-500" : ""}>Full Name</Label>
                        <Input id="fullName" value={fullName} onChange={e => { setFullName(e.target.value); if (errors.fullName) setErrors({ ...errors, fullName: "" }); }} placeholder="Fahim Rahman" className={`h-12 bg-slate-50 border-slate-200 rounded-xl ${errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className={errors.phone ? "text-red-500" : ""}>Phone Number (Required for OTP)</Label>
                        <div className="flex">
                          <span className={`inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 font-medium ${errors.phone ? 'border-red-500 text-red-500' : ''}`}>
                            +880
                          </span>
                          <Input id="phone" value={phone} onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: "" }); }} placeholder="017XX XXXXXX" className={`h-12 rounded-l-none bg-slate-50 border-slate-200 rounded-r-xl font-medium tracking-wider ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>Detailed Delivery Address</Label>
                        <Input id="address" value={address} onChange={e => { setAddress(e.target.value); if (errors.address) setErrors({ ...errors, address: "" }); }} placeholder="House 12, Road 4, Block C, Banani" className={`h-12 bg-slate-50 border-slate-200 rounded-xl ${errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 relative z-50">
                        <div className="space-y-2 relative">
                          <Label className={`font-medium ${errors.district ? "text-red-500" : "text-slate-900"}`}>City / District</Label>
                          <Select onValueChange={(val) => { setSelectedDistrict(val as string); if (errors.district) setErrors({ ...errors, district: "" }); }}>
                            <SelectTrigger className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white text-slate-900 ${errors.district ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select District" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl">
                              <SelectGroup>
                                {Object.keys(bdDistricts).map((district) => (
                                  <SelectItem key={district} className="hover:bg-slate-50 cursor-pointer text-slate-900" value={district}>{district}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                        </div>

                        <div className="space-y-2 relative">
                          <Label className={`font-medium ${errors.area ? "text-red-500" : "text-slate-900"}`}>Area / Upazila</Label>
                          <Select disabled={!selectedDistrict} onValueChange={(val) => { setSelectedArea(val as string); if (errors.area) setErrors({ ...errors, area: "" }); }}>
                            <SelectTrigger className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white text-slate-900 disabled:opacity-50 ${errors.area ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder={selectedDistrict ? "Select Area" : "Select District First"} />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl">
                              {selectedDistrict && bdDistricts[selectedDistrict] && (
                                <SelectGroup>
                                  {bdDistricts[selectedDistrict].map((area) => (
                                    <SelectItem key={area} className="hover:bg-slate-50 cursor-pointer text-slate-900" value={area}>{area}</SelectItem>
                                  ))}
                                </SelectGroup>
                              )}
                            </SelectContent>
                          </Select>
                          {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                        </div>
                      </div>

                      {selectedDistrict && (
                        <div className="pt-4 mt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Truck className="w-4 h-4" />
                              <span className="font-medium">Delivery Charge ({isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka"})</span>
                            </div>
                            <span className="font-bold text-slate-900 text-base">৳{shipping}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="mt-8">
                    <Button onClick={nextStep} size="lg" className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-xl shadow-lg shadow-slate-900/10 group">
                      Continue to Payment
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden mb-6">
                    <CardHeader className="bg-slate-900 text-white pb-6 pt-6">
                      <CardTitle className="flex items-center justify-between text-xl">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-blue-400" />
                          Select Payment Method
                        </div>
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 bg-white">
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-4">
                        
                        {/* Mobile Banking Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                          <div className="flex items-center space-x-3 border-2 border-slate-200 p-4 rounded-2xl cursor-pointer hover:border-pink-500/50 transition-colors [&:has(:checked)]:border-pink-500 [&:has(:checked)]:bg-pink-50/30">
                            <RadioGroupItem value="bkash" id="bkash" className="text-pink-600 border-pink-600" />
                            <Label htmlFor="bkash" className="flex flex-1 items-center gap-3 cursor-pointer">
                              <div className="w-12 h-10 bg-slate-100 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden px-1">
                                <img src="https://download.logo.wine/logo/BKash/BKash-Icon-Logo.wine.png" alt="bKash" className="object-contain h-full w-full" />
                              </div>
                              <div className="font-bold text-slate-900 text-lg">bKash</div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-3 border-2 border-slate-200 p-4 rounded-2xl cursor-pointer hover:border-orange-500/50 transition-colors [&:has(:checked)]:border-orange-500 [&:has(:checked)]:bg-orange-50/30">
                            <RadioGroupItem value="nagad" id="nagad" className="text-orange-600 border-orange-600" />
                            <Label htmlFor="nagad" className="flex flex-1 items-center gap-3 cursor-pointer">
                              <div className="w-12 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden px-1">
                                <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" alt="Nagad" className="object-cover scale-150 relative top-[1px]" />
                              </div>
                              <div className="font-bold text-slate-900 text-lg">Nagad</div>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-3 border-2 border-slate-200 p-4 rounded-2xl cursor-pointer hover:border-purple-600/50 transition-colors md:col-span-2 [&:has(:checked)]:border-purple-600 [&:has(:checked)]:bg-purple-50/30">
                            <RadioGroupItem value="rocket" id="rocket" className="text-purple-600 border-purple-600" />
                            <Label htmlFor="rocket" className="flex flex-1 items-center gap-3 cursor-pointer">
                              <div className="w-12 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden px-1">
                                <img src="https://raw.githubusercontent.com/NusratSharmin2tr/bd-payment-gateway-logos/master/assets/rocket.png" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML='<div class="font-bold text-purple-600">R</div>'}} alt="Rocket" className="object-contain h-full w-full" />
                              </div>
                              <div className="font-bold text-slate-900 text-lg">Rocket</div>
                            </Label>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Card Options */}
                        <div className="flex items-center space-x-3 border-2 border-slate-200 p-4 rounded-2xl cursor-pointer hover:border-blue-600 transition-colors [&:has(:checked)]:border-blue-600 [&:has(:checked)]:bg-blue-50/50">
                          <RadioGroupItem value="card" id="card" className="text-blue-600" />
                          <Label htmlFor="card" className="flex flex-1 items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1.5 shrink-0 px-1">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 w-auto object-contain" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/200px-MasterCard_Logo.svg.png" alt="Mastercard" className="h-6 w-auto object-contain" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png" alt="Amex" className="h-6 w-auto object-contain" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">Credit / Debit Card</div>
                                <div className="text-sm text-slate-500 font-normal">Visa, MasterCard, Amex (SSLCommerz)</div>
                              </div>
                            </div>
                          </Label>
                        </div>

                        <Separator className="my-2" />

                        {/* COD Options */}
                        <div className="flex items-center space-x-3 border-2 border-slate-200 p-4 rounded-2xl cursor-pointer hover:border-emerald-600 transition-colors [&:has(:checked)]:border-emerald-600 [&:has(:checked)]:bg-emerald-50/50">
                          <RadioGroupItem value="cod" id="cod" className="text-emerald-600 border-emerald-600" />
                          <Label htmlFor="cod" className="flex flex-1 items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Truck className="w-6 h-6 text-slate-700" />
                              <div>
                                <div className="font-bold text-slate-900">Cash on Delivery</div>
                                <div className="text-sm text-slate-500 font-normal">Pay with cash upon delivery</div>
                              </div>
                            </div>
                          </Label>
                        </div>

                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <div className="mt-8 flex gap-4">
                    <Button onClick={() => setStep(1)} variant="outline" size="lg" className="h-14 bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold px-8">
                      Back
                    </Button>
                    <Button onClick={async () => {
                      await addOrder({
                        id: "", // Generated by backend
                        customer: "Guest Customer",
                        date: "",
                        total: total,
                        status: "Processing",
                        payment: "Card",
                        items: cartItems.length,
                        image: cartItems[0]?.image || ""
                      });
                      toast.success("Order Placed Successfully!");
                      clearCart();
                      setTimeout(() => {
                        window.location.href = "/dashboard";
                      }, 1000);
                    }} size="lg" className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 group">
                      Confirm & Pay ৳{total.toLocaleString()}
                      <CheckIcon className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Column: Order Summary Mini */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-1 lg:order-2">
            <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden sticky top-24">
              <div className="bg-white p-6 pb-0 border-b border-slate-100 flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 pb-4">Order Summary ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items)</h3>
                <Link href="/cart" className="text-sm text-blue-600 hover:underline pb-4 font-medium">Edit Cart</Link>
              </div>
              <CardContent className="p-6 pt-0">
                
                {/* Micro Item List */}
                <div className="space-y-4 mb-6 pt-4">
                  {cartItems?.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-16 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                      </div>
                      <div className="flex-1 overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-sm text-slate-900 truncate" title={item.name}>{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{typeof item.variant === 'object' ? (item.variant as any)?.name || 'Default' : item.variant}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3 bg-white rounded-full px-2 border border-slate-200 shadow-sm h-7">
                            <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="text-slate-500 hover:text-slate-900 w-4 flex items-center justify-center cursor-pointer" disabled={item.quantity <= 1}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="text-slate-500 hover:text-slate-900 w-4 flex items-center justify-center cursor-pointer">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="font-bold text-sm text-slate-900">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="mb-6" />

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span>
                    <span className="font-medium text-slate-900">৳{shipping}</span>
                  </div>
                </div>

                <Separator className="mb-6 border-slate-200 border-dashed" />

                <div className="flex justify-between items-end bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 tracking-tight">৳{total.toLocaleString()}</div>
                  </div>
                </div>

              </CardContent>
            </Card>

            <div className="flex items-start gap-3 text-sm text-slate-500 justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <p>Safe & secure checkout using advanced 256-bit encryption.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
