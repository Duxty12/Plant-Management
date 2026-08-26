"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  mockPlants,
  mockWateringRecords,
  mockFertilizerRecords,
  mockMaintenanceLogs,
  mockGrowthHistory,
  mockDiseases,
} from "@/data/mockData";
import { Droplets, TrendingUp, Bug, Wrench, Sparkles, ChevronDown } from "lucide-react";

const filterTypes = ["All Events", "Watering", "Fertilization", "Disease", "Growth", "Maintenance"] as const;
type FilterType = typeof filterTypes[number];

const typeConfig: Record<string, { icon: typeof Droplets; color: string; bg: string }> = {
  watering:      { icon: Droplets,   color: "text-blue-600",   bg: "bg-blue-100" },
  fertilization: { icon: Sparkles,   color: "text-amber-600",  bg: "bg-amber-100" },
  growth:        { icon: TrendingUp, color: "text-green-600",  bg: "bg-green-100" },
  disease:       { icon: Bug,        color: "text-red-600",    bg: "bg-red-100" },
  maintenance:   { icon: Wrench,     color: "text-purple-600", bg: "bg-purple-100" },
};

export default function ActivityPage() {
  const [selectedPlant, setSelectedPlant] = useState("PT-1001");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All Events");

  const plant = mockPlants.find((p) => p.plant_id === selectedPlant) || mockPlants[0];

  // Aggregate all events for this plant
  const events: {
    id: string;
    type: "watering" | "fertilization" | "growth" | "disease" | "maintenance";
    date: string;
    title: string;
    details: string;
  }[] = [];

  // Waterings (Only show water amount)
  mockWateringRecords
    .filter((w) => w.plant_id === plant.plant_id)
    .forEach((w) => {
      events.push({
        id: w.water_id,
        type: "watering",
        date: w.date,
        title: "Watering",
        details: `${w.amount} ml`,
      });
    });

  // Fertilization (Only show fertilizer name and amount)
  mockFertilizerRecords
    .filter((f) => f.plant_id === plant.plant_id)
    .forEach((f) => {
      events.push({
        id: f.fertilizer_id,
        type: "fertilization",
        date: f.date,
        title: "Fertilization",
        details: `${f.name} · ${f.amount} ml`,
      });
    });

  // Growth (Height and leaves)
  mockGrowthHistory
    .filter((g) => g.plant_id === plant.plant_id)
    .forEach((g) => {
      events.push({
        id: g.growth_id,
        type: "growth",
        date: g.date,
        title: "Growth Log",
        details: `${g.height} cm (${g.growth_stage}, ${g.leaf_count} leaves)`,
      });
    });

  // Maintenance (Only display maintenance note, if any)
  mockMaintenanceLogs
    .filter((m) => m.plant_id === plant.plant_id)
    .forEach((m) => {
      events.push({
        id: m.log_id,
        type: "maintenance",
        date: m.date,
        title: `Maintenance: ${m.activity_type}`,
        details: m.note || "Routine care",
      });
    });

  // Disease (Disease Name and status)
  mockDiseases
    .filter((d) => d.plant_id === plant.plant_id)
    .forEach((d) => {
      events.push({
        id: d.disease_id,
        type: "disease",
        date: d.detect_date,
        title: `Disease: ${d.disease_name}`,
        details: d.recovery_status === "recovered" ? `Recovered on ${d.heal_date}` : `Status: ${d.recovery_status}`,
      });
    });

  const [search, setSearch] = useState("");

  const filtered = events.filter((e) => {
    const matchType = activeFilter === "All Events" ? true : e.type === activeFilter.toLowerCase();
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.details.toLowerCase().includes(search.toLowerCase()) ||
      e.date.includes(search);
    return matchType && matchSearch;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plant Activity Timeline</h1>
          <p className="text-gray-500 mt-1 text-sm">Chronological log of plant events and care history.</p>
        </div>
        {/* Specimen Dropdown */}
        <div className="relative">
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200 bg-white shadow-sm cursor-pointer min-w-[260px]"
          >
            {mockPlants.map((p) => (
              <option key={p.plant_id} value={p.plant_id}>
                {p.common_name} · {p.plant_id}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Plant Info Banner (Cleaned) */}
      {plant && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0 text-white font-bold text-base shadow-sm">
              {plant.common_name[0]}
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{plant.common_name}</p>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{plant.plant_id} · {plant.section_name}</p>
            </div>
          </div>

          {/* Search box within timeline */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Search timeline events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50/70"
            />
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {filterTypes.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              activeFilter === f
                ? "bg-[#1B3B2C] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((event) => {
              const tc = typeConfig[event.type] ?? typeConfig.maintenance;
              return (
                <div key={event.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors">
                  {/* Icon marker */}
                  <div className={`w-9 h-9 rounded-full ${tc.bg} flex items-center justify-center flex-shrink-0`}>
                    <tc.icon className={`w-4 h-4 ${tc.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{event.title}:</span>
                      <span className="text-sm text-gray-700 font-medium">{event.details}</span>
                    </div>
                    {/* Date only, no time */}
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md whitespace-nowrap self-start sm:self-auto">
                      {event.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-400 italic">
            No timeline logs found for this filter.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
