"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Leaf,
  FlaskConical,
  Building2,
  Thermometer,
  Droplets,
  TrendingUp,
  Bug,
  Wrench,
  Truck,
  Activity,
  LogOut,
  PackagePlus,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Plants", icon: Leaf, href: "/plants" },
  { label: "Species", icon: FlaskConical, href: "/species" },
  { label: "Sections", icon: Building2, href: "/sections" },
  { label: "Environment", icon: Thermometer, href: "/environment" },
  { label: "Watering & Fert.", icon: Droplets, href: "/watering" },
  { label: "Growth", icon: TrendingUp, href: "/growth" },
  { label: "Disease", icon: Bug, href: "/disease" },
  { label: "Maintenance", icon: Wrench, href: "/maintenance" },
  { label: "Suppliers", icon: Truck, href: "/suppliers" },
  { label: "Activity Timeline", icon: Activity, href: "/activity" },
  { label: "Request Plant", icon: PackagePlus, href: "/request" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);


  return (
    <aside className="fixed left-0 top-0 h-full w-[250px] bg-[#1B3B2C] flex flex-col z-40 overflow-hidden shadow-lg">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#2d5c45]">
        <Link href="/" className="flex items-center gap-3 group transition">
          <div className="w-10 h-10 rounded-xl bg-[#16a34a] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight tracking-wide group-hover:text-green-300 transition-colors">Exotica</p>
            <p className="text-green-400 text-xs leading-tight">Management System</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-[#2d5c45] text-white shadow-sm"
                  : "text-green-200/85 hover:bg-[#243f30] hover:text-white"
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-green-400" : "text-green-400/70"}`} />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Block */}
      <div className="px-4 py-4 border-t border-[#2d5c45] bg-[#173326]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0 ring-1 ring-green-400/30">
              <span className="text-white text-xs font-bold">ET</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.username}</p>
              <p className="text-green-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            href="/login"
            title="Log out"
            className="p-1.5 rounded-lg text-green-300 hover:text-white hover:bg-[#243f30] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
