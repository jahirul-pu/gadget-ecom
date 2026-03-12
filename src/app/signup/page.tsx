"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, MapPin, Phone, User as UserIcon } from "lucide-react";
import { bdDistricts } from "@/lib/locations";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

export default function SignupPage() {
  const router = useRouter();
  const setUser = useStore(state => state.setUser);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleCreateAccount = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName) newErrors.fullName = "Full name is required";
    if (!phone) newErrors.phone = "Phone number is required";
    else {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (cleanPhone.length !== 11) newErrors.phone = "Must be exactly 11 digits";
    }
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (!address) newErrors.address = "Address is required";
    if (!selectedDistrict) newErrors.district = "District is required";
    if (!selectedArea) newErrors.area = "Area is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correctly fill all required fields");
      return;
    }

    setErrors({});

    // Save to Supabase
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .or(`phone.eq.${phone},${email ? `email.eq.${email}` : 'email.is.null'}`)
        .maybeSingle();

      if (existingUser) {
        toast.error("An account with this phone or email already exists. Please login instead.");
        router.push("/login");
        return;
      }

      const { data, error } = await supabase.from('users').insert({
        name: fullName,
        phone: phone,
        email: email || null,
        district: selectedDistrict,
        area: selectedArea,
        address: address,
        password_hash: password
      }).select().single();
      if (error) throw error;
      
      // Also Save to user_addresses table as default address
      await supabase.from('user_addresses').insert({
        user_id: data.id,
        category: 'Home',
        district: selectedDistrict,
        area: selectedArea,
        full_address: address,
        is_default: true
      });

      setUser({
        id: data.id,
        fullName: data.name,
        phone: data.phone,
        email: data.email,
        district: data.district,
        area: data.area,
        address: data.address
      });

      toast.success("Account created successfully!");
      router.push("/");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              TechFlow
            </span>
          </Link>
        </div>

        <Card className="border-none shadow-xl shadow-blue-900/5 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="text-center space-y-2 pb-6 pt-8">
            <CardTitle className="text-3xl font-bold text-slate-900">Create an account</CardTitle>
            <CardDescription className="text-base text-slate-500">Join us to start shopping for the best gadgets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-8">
            <div className="space-y-2">
              <Label htmlFor="fullName" className={`font-semibold ${errors.fullName ? 'text-red-500' : 'text-slate-700'}`}>Full Name</Label>
              <div className="relative">
                <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.fullName ? 'text-red-400' : 'text-slate-400'}`} />
                <Input id="fullName" value={fullName} onChange={e => { setFullName(e.target.value); if (errors.fullName) setErrors({ ...errors, fullName: "" }); }} placeholder="John Doe" className={`pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white ${errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}`} required />
              </div>
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className={`font-semibold ${errors.phone ? 'text-red-500' : 'text-slate-700'}`}>Phone Number</Label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.phone ? 'text-red-400' : 'text-slate-400'}`} />
                  <Input id="phone" type="tel" value={phone} onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: "" }); }} placeholder="+880 17... " className={`pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`} required />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email <span className="text-slate-400 font-normal">(Optional)</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={`font-semibold ${errors.password ? 'text-red-500' : 'text-slate-700'}`}>Password</Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.password ? 'text-red-400' : 'text-slate-400'}`} />
                <Input id="password" type="password" value={password} onChange={e => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: "" }); }} placeholder="••••••••" className={`pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`} required />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            
            <div className="h-px bg-slate-100 my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-50">
              <div className="space-y-2 relative">
                <Label className={`font-semibold ${errors.district ? 'text-red-500' : 'text-slate-700'}`}>District</Label>
                <Select onValueChange={(val) => { setSelectedDistrict(val as string); if (errors.district) setErrors({ ...errors, district: "" }); }}>
                  <SelectTrigger className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white ${errors.district ? 'border-red-500' : ''}`}>
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
                <Label className={`font-semibold ${errors.area ? 'text-red-500' : 'text-slate-700'}`}>Area / Upazila</Label>
                <Select disabled={!selectedDistrict} onValueChange={(val) => { setSelectedArea(val as string); if (errors.area) setErrors({ ...errors, area: "" }); }}>
                  <SelectTrigger className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white disabled:opacity-50 ${errors.area ? 'border-red-500' : ''}`}>
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
            
            <div className="space-y-2 mt-4 relative z-0">
              <Label htmlFor="address" className={`font-semibold ${errors.address ? 'text-red-500' : 'text-slate-700'}`}>Street Address</Label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-4 h-5 w-5 ${errors.address ? 'text-red-400' : 'text-slate-400'}`} />
                <textarea 
                  id="address" 
                  value={address}
                  onChange={e => { setAddress(e.target.value); if (errors.address) setErrors({ ...errors, address: "" }); }}
                  placeholder="House/Apartment no, Street, Local landmark" 
                  className={`w-full pl-10 pt-3.5 pb-3.5 h-24 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent resize-none placeholder:text-slate-400 transition-all font-sans ${errors.address ? 'border-red-500 focus:ring-red-500' : ''}`} 
                  required
                ></textarea>
              </div>
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <Button onClick={handleCreateAccount} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-md hover:shadow-blue-600/25 mt-4">
              Create Account
            </Button>
          </CardContent>
          <CardFooter className="pb-8 justify-center border-t border-slate-100 mt-2 pt-6 bg-slate-50/50">
            <p className="text-slate-600 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
