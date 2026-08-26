"use client";

import { use, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import {
  mockPlants,
  mockWateringRecords,
  mockFertilizerRecords,
  mockMaintenanceLogs,
  mockGrowthHistory,
  mockDiseases,
} from "@/data/mockData";
import {
  Leaf,
  ChevronLeft,
  Calendar,
  Building2,
  Truck,
  User,
  Droplets,
  Sparkles,
  Wrench,
  TrendingUp,
  Bug,
  Stethoscope,
  Pill,
  History,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const healthConfig: Record<string, { label: string; cls: string; dot: string }> = {
  healthy:    { label: "Healthy",          cls: "status-healthy",    dot: "bg-emerald-500" },
  sick:       { label: "Sick",             cls: "status-sick",       dot: "bg-red-500" },
  recovering: { label: "Under Treatment",  cls: "status-recovering", dot: "bg-amber-500" },
};

const recoveryConfig: Record<string, string> = {
  ongoing:   "status-sick",
  treating:  "status-recovering",
  recovered: "status-healthy",
};

const recoveryLabel: Record<string, string> = {
  ongoing:   "Ongoing Active",
  treating:  "Under Treatment",
  recovered: "Recovered",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlantDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Find the plant specimen
  const plant = mockPlants.find((p) => p.plant_id.toLowerCase() === id.toLowerCase()) || mockPlants[0];

  const [activeTab, setActiveTab] = useState<"all" | "care" | "growth" | "disease" | "maintenance">("all");

  // Filter logs for this particular plant
  const plantWaterings = mockWateringRecords.filter((w) => w.plant_id === plant.plant_id);
  const plantFertilizers = mockFertilizerRecords.filter((f) => f.plant_id === plant.plant_id);
  const plantMaintenance = mockMaintenanceLogs.filter((m) => m.plant_id === plant.plant_id);
  const plantGrowth = mockGrowthHistory.filter((g) => g.plant_id === plant.plant_id);
  const plantDiseases = mockDiseases.filter((d) => d.plant_id === plant.plant_id);

  const hc = healthConfig[plant.health_status] ?? healthConfig.healthy;

  // Chart data for height progression
  const chartData = plantGrowth.map((g, i) => ({
    date: g.date.slice(5),
    height: g.height,
    isLatest: i === plantGrowth.length - 1,
  }));

  const latestHeight = plantGrowth.length > 0 ? plantGrowth[plantGrowth.length - 1].height : null;
  const latestLeafCount = plantGrowth.length > 0 ? plantGrowth[plantGrowth.length - 1].leaf_count : null;
  const latestStage = plantGrowth.length > 0 ? plantGrowth[plantGrowth.length - 1].growth_stage : "Vegetative";

  return (
    <DashboardLayout>
      {/* Back button & Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/plants"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#1B3B2C] transition mb-3"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Plant Inventory
        </Link>
      </div>

      {/* Main Specimen Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-7">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar and Main Info */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-md">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{plant.common_name}</h1>
                <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                  {plant.plant_id}
                </span>
                <span className={`badge ${hc.cls} flex items-center gap-1.5`}>
                  <span className={`w-2 h-2 rounded-full ${hc.dot}`} />
                  {hc.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 italic mt-1">
                {plant.scientific_name} · <span className="not-italic text-gray-400 font-sans">{plant.family}</span>
              </p>

              {/* Meta tags */}
              <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <strong className="font-semibold text-gray-800">{plant.section_name}</strong> ({plant.section_id})
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  Supplier: <strong className="font-semibold text-gray-800">{plant.supplier_name}</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Acquired: <strong className="font-semibold text-gray-800">{plant.acquire_date}</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Botanist: <strong className="font-semibold text-gray-800">{plant.owner_name}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="bg-gray-50/80 rounded-xl p-3.5 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Watering Logs</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{plantWaterings.length} events</p>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-3.5 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fertilization</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{plantFertilizers.length} applications</p>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-3.5 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Height</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{latestHeight ? `${latestHeight} cm` : "—"}</p>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-3.5 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pathology Records</p>
            <p className={`text-xl font-bold mt-1 ${plantDiseases.length > 0 ? "text-amber-600" : "text-green-600"}`}>
              {plantDiseases.length} recorded
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: "all", label: "Overview & All Logs" },
          { key: "care", label: `Care & Watering (${plantWaterings.length + plantFertilizers.length})` },
          { key: "growth", label: `Growth Progression (${plantGrowth.length})` },
          { key: "maintenance", label: `Maintenance (${plantMaintenance.length})` },
          { key: "disease", label: `Pathology & Treatments (${plantDiseases.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-[#1B3B2C] text-[#1B3B2C]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* 1. Growth & Height Progression Chart */}
        {(activeTab === "all" || activeTab === "growth") && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Growth &amp; Height Progression</h2>
              </div>
              {latestStage && (
                <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                  Current Stage: {latestStage} · {latestLeafCount} leaves
                </span>
              )}
            </div>

            {chartData.length > 0 ? (
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <Tooltip
                      contentStyle={{ background: "#1B3B2C", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#fff" }}
                      formatter={(v: any) => [`${v ?? 0} cm`, "Height"]}
                    />
                    <Bar dataKey="height" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.isLatest ? "#1B3B2C" : "#86efac"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic mb-4">No height measurements logged yet.</p>
            )}

            {/* Growth Logs Table */}
            {plantGrowth.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table>
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Log Date", "Height (cm)", "Growth Stage", "Leaf Count"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plantGrowth.map((g) => (
                      <tr key={g.growth_id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-600">{g.date}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{g.height} cm</td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-700">{g.growth_stage}</td>
                        <td className="px-4 py-3 text-xs text-gray-700 font-medium">{g.leaf_count} leaves</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. Care: Watering & Fertilization */}
        {(activeTab === "all" || activeTab === "care") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Watering Logs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold text-gray-900">Watering Logs</h2>
              </div>
              {plantWaterings.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table>
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {["Date", "Amount (ml)", "Status"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {plantWaterings.map((w) => (
                        <tr key={w.water_id} className="hover:bg-gray-50/80">
                          <td className="px-4 py-3 text-xs text-gray-600">{w.date}</td>
                          <td className="px-4 py-3 text-sm font-bold text-blue-600">{w.amount} ml</td>
                          <td className="px-4 py-3 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Applied
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No watering records logged for this specimen.</p>
              )}
            </div>

            {/* Fertilization Logs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">Fertilization Logs</h2>
              </div>
              {plantFertilizers.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table>
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {["Date", "Fertilizer Formula", "Amount (ml)"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {plantFertilizers.map((f) => (
                        <tr key={f.fertilizer_id} className="hover:bg-gray-50/80">
                          <td className="px-4 py-3 text-xs text-gray-600">{f.date}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">{f.name}</td>
                          <td className="px-4 py-3 text-sm font-bold text-emerald-700">{f.amount} ml</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No fertilizer applications logged for this specimen.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. Maintenance Logs */}
        {(activeTab === "all" || activeTab === "maintenance") && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Maintenance &amp; Husbandry Logs</h2>
            </div>
            {plantMaintenance.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table>
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Date", "Activity Type", "Observations & Notes"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plantMaintenance.map((m) => (
                      <tr key={m.log_id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{m.date}</td>
                        <td className="px-4 py-3">
                          <span className="badge bg-purple-50 text-purple-700 font-semibold">{m.activity_type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{m.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No maintenance activities logged for this specimen.</p>
            )}
          </div>
        )}

        {/* 4. Pathology, Diseases & Treatment History */}
        {(activeTab === "all" || activeTab === "disease") && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bug className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Pathology, Diseases &amp; Treatment History</h2>
            </div>

            {plantDiseases.length > 0 ? (
              <div className="space-y-4">
                {plantDiseases.map((d) => (
                  <div key={d.disease_id} className="rounded-xl border border-gray-200 p-5 bg-gray-50/50">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-bold text-gray-900">{d.disease_name}</h3>
                          <span className="font-mono text-xs text-gray-400">({d.disease_id})</span>
                          <span className={`badge ${recoveryConfig[d.recovery_status] ?? "status-clear"}`}>
                            {recoveryLabel[d.recovery_status] ?? d.recovery_status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Diagnosed on: <strong className="text-gray-700">{d.detect_date}</strong>
                          {d.heal_date && (
                            <> · Fully Recovered on: <strong className="text-emerald-700">{d.heal_date}</strong></>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Applied Treatments sub-list */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-emerald-600" /> Applied Treatments ({d.treatments.length})
                      </p>
                      {d.treatments.length > 0 ? (
                        <div className="space-y-2">
                          {d.treatments.map((t) => (
                            <div key={t.treat_id} className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-gray-800">{t.medicine}</span>
                              </div>
                              <span className="text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{t.date}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No specific treatments applied for this pathology log.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-green-200 bg-green-50/50 flex items-center gap-3 text-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium">No disease or pest infestation records registered for this healthy plant.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
