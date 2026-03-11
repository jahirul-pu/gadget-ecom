import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Shop</h3>
          <ul className="space-y-2">
            <li><Link href="/category/phones" className="hover:text-cyan-400 transition-colors">Phones</Link></li>
            <li><Link href="/category/wearables" className="hover:text-cyan-400 transition-colors">Wearables</Link></li>
            <li><Link href="/category/audio" className="hover:text-cyan-400 transition-colors">Audio</Link></li>
            <li><Link href="/category/smart-home" className="hover:text-cyan-400 transition-colors">Smart home</Link></li>
            <li><Link href="/category/accessories" className="hover:text-cyan-400 transition-colors">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Customer Support</h3>
          <ul className="space-y-2">
            <li><Link href="/help" className="hover:text-cyan-400 transition-colors">Help center</Link></li>
            <li><Link href="/order-tracking" className="hover:text-cyan-400 transition-colors">Order tracking</Link></li>
            <li><Link href="/shipping" className="hover:text-cyan-400 transition-colors">Shipping information</Link></li>
            <li><Link href="/returns" className="hover:text-cyan-400 transition-colors">Returns</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About us</Link></li>
            <li><Link href="/careers" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
            <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
          <ul className="space-y-2">
            <li>Hotline: 16XXX</li>
            <li>Email: support@techflow.local</li>
            <li>Address: TechFlow Tower, Dhaka</li>
          </ul>
          <div className="flex gap-4 mt-6">
            <Link href="#" className="hover:text-cyan-400 transition-colors"><Facebook className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors"><Twitter className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors"><Instagram className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors"><Youtube className="w-5 h-5" /></Link>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-slate-800 text-sm flex flex-col sm:flex-row justify-between items-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} TechFlow. All rights reserved.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy policy</Link>
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of service</Link>
        </div>
      </div>
    </footer>
  );
}
