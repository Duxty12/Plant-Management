"use client";

import { useState } from "react";
import { Bell, HelpCircle, Settings, Search, Plus } from "lucide-react";
import Link from "next/link";

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function TopHeader({ title, subtitle, actionLabel = "+ Add Plant", onAction }: TopHeaderProps) {
  const [searchVal, setSearchVal] = useState("");

  return (
    <header className="fixed top-0 right-0 left-[250px] h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 z-30">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search plants, species, sections…"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 w-64 transition"
        />
      </div>

      {/* Quick Nav */}
      <div className="hidden md:flex items-center gap-1 text-sm">
        <Link href="/plants" className="px-3 py-1.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-md transition font-medium">Inventory</Link>
        <Link href="/maintenance" className="px-3 py-1.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-md transition font-medium">Logs</Link>
        <Link href="/health-alerts" className="px-3 py-1.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-md transition font-medium">Alerts</Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Help */}
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition">
          <Settings className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center cursor-pointer">
          <span className="text-white text-xs font-bold">ET</span>
        </div>

        {/* CTA Button */}
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md ml-1"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      </div>
    </header>
  );
}
