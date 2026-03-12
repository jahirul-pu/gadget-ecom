"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User as UserIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useStore(state => state.setUser);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!identity || !password) {
      toast.error("Please enter both identity and password");
      return;
    }

    setLoading(true);
    try {
      // Check for user by email OR phone
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${identity},phone.eq.${identity}`)
        .eq('password', password)
        .single();

      if (error || !data) {
        toast.error("Invalid email/phone or password");
        return;
      }

      setUser({
        id: data.id,
        fullName: data.full_name,
        phone: data.phone,
        email: data.email,
        district: data.district,
        area: data.area,
        address: data.address
      });

      toast.success(`Welcome back, ${data.full_name}!`);
      router.push("/");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-600/20">
              T
            </div>
            <span className="font-bold text-3xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              TechFlow
            </span>
          </Link>
        </div>

        <Card className="border-none shadow-2xl shadow-blue-900/5 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="text-center space-y-2 pb-8 pt-10">
            <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base text-slate-500 font-medium">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 sm:px-10">
            
            <div className="space-y-2">
              <Label htmlFor="identity" className="text-slate-700 font-bold ml-1">Email or Phone</Label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input id="identity" type="text" value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="john@example.com or +880..." className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white text-base transition-all" required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1 mr-1">
                <Label htmlFor="password" className="text-slate-700 font-bold">Password</Label>
                <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:bg-white text-base transition-all" required />
              </div>
            </div>

            <Button onClick={handleSignIn} disabled={loading} className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-[0_8px_30px_rgb(37,99,235,0.24)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] mt-4">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </CardContent>
          <CardFooter className="pb-8 justify-center mt-6 pt-6">
            <p className="text-slate-600 font-medium">
              Don't have an account?{" "}
              <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
