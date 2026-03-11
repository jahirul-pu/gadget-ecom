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

export default function SignupPage() {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleCreateAccount = () => {
    toast.success("Account created successfully!");
    router.push("/");
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
              <Label htmlFor="fullName" className="text-slate-700 font-semibold">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input id="fullName" placeholder="John Doe" className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-semibold">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input id="phone" type="tel" placeholder="+880 17... " className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email <span className="text-slate-400 font-normal">(Optional)</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input id="email" type="email" placeholder="john@example.com" className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white" required />
              </div>
            </div>
            
            <div className="h-px bg-slate-100 my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-50">
              <div className="space-y-2 relative">
                <Label className="text-slate-700 font-semibold">District</Label>
                <Select onValueChange={(val) => setSelectedDistrict(val as string)}>
                  <SelectTrigger className="h-12 w-full rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white">
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
              </div>

              <div className="space-y-2 relative">
                <Label className="text-slate-700 font-semibold">Area / Upazila</Label>
                <Select disabled={!selectedDistrict}>
                  <SelectTrigger className="h-12 w-full rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white disabled:opacity-50">
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
              </div>
            </div>
            
            <div className="space-y-2 mt-4 relative z-0">
              <Label htmlFor="address" className="text-slate-700 font-semibold">Street Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                <textarea 
                  id="address" 
                  placeholder="House/Apartment no, Street, Local landmark" 
                  className="w-full pl-10 pt-3.5 pb-3.5 h-24 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent resize-none placeholder:text-slate-400 transition-all font-sans" 
                  required
                ></textarea>
              </div>
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
