"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Search as SearchIcon, Leaf } from "lucide-react";
import { useState } from "react";
import { mockPlants } from "@/data/mockData";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = query.length > 1
    ? mockPlants.filter((p) =>
        p.common_name.toLowerCase().includes(query.toLowerCase()) ||
        (p.scientific_name ?? "").toLowerCase().includes(query.toLowerCase()) ||
        p.plant_id.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <DashboardLayout>
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        <p className="text-gray-500 mt-1 text-sm">Search plants by name, scientific name, or ID.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by plant name, scientific name, or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-5 py-4 border border-gray-200 rounded-2xl text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 bg-white shadow-sm transition"
          />
        </div>

        {query.length > 1 && results.length === 0 && (
          <p className="text-center text-gray-400 py-12">No plants found matching &quot;{query}&quot;.</p>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {results.map((plant) => (
              <div key={plant.plant_id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{plant.common_name}</p>
                  <p className="text-xs text-gray-400 italic">{plant.scientific_name} · <span className="not-italic font-mono">{plant.plant_id}</span></p>
                </div>
                <span className={`badge ${plant.health_status === "healthy" ? "status-healthy" : plant.health_status === "sick" ? "status-sick" : "status-recovering"}`}>
                  {plant.health_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
