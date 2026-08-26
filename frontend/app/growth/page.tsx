"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  TrendingUp,
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

type Plant = {
  plant_id: string;
  common_name: string;
  scientific_name?: string | null;
  section_id?: string | null;
  section_name?: string | null;
  supplier_id?: string | null;
  supplier_name?: string | null;
  acquire_date: string;
  health_status: string;
  owner_id: string;
  owner_name?: string | null;
};

type GrowthRecord = {
  growth_id: string;
  plant_id: string;
  plant_name?: string;
  date: string;
  height: number;
  growth_stage: string;
  leaf_count: number;
};

const stageConfig: Record<string, string> = {
  Seedling: "status-recovering",
  Vegetative: "status-clear",
  Budding: "status-optimal",
  Flowering: "status-healthy",
  Mature: "status-healthy",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function GrowthPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [history, setHistory] = useState<GrowthRecord[]>([]);
  const [selectedPlantChart, setSelectedPlantChart] = useState("");
  const [tablePlantFilter, setTablePlantFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    plant_id: "",
    date: new Date().toISOString().split("T")[0],
    height: "",
    growth_stage: "Vegetative",
    leaf_count: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [plantsResponse, growthResponse] = await Promise.all([
        fetch(`${API_URL}/plants`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/growth`, {
          credentials: "include",
        }),
      ]);

      if (plantsResponse.status === 401 || growthResponse.status === 401) {
        throw new Error("Unauthorized");
      }

      if (!plantsResponse.ok) {
        throw new Error("Failed to load plants");
      }

      if (!growthResponse.ok) {
        throw new Error("Failed to load growth records");
      }

      const plantsData: Plant[] = await plantsResponse.json();
      const growthData: GrowthRecord[] = await growthResponse.json();

      setPlants(plantsData);
      setHistory(growthData);

      const firstPlantId = plantsData[0]?.plant_id || "";

      setSelectedPlantChart((current) => current || firstPlantId);

      setForm((current) => ({
        ...current,
        plant_id: current.plant_id || firstPlantId,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartRecords = useMemo(() => {
    return history
      .filter((g) => g.plant_id === selectedPlantChart)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [history, selectedPlantChart]);

  const chartData = useMemo(() => {
    return chartRecords.map((g, i) => ({
      date: g.date.slice(5),
      height: g.height,
      isLatest: i === chartRecords.length - 1,
    }));
  }, [chartRecords]);

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.plant_id ||
      !form.date ||
      !form.height ||
      !form.growth_stage ||
      !form.leaf_count
    ) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/growth`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plant_id: form.plant_id,
          date: form.date,
          height: Number(form.height),
          growth_stage: form.growth_stage,
          leaf_count: Number(form.leaf_count),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "Failed to save growth record");
      }

      const newRecord: GrowthRecord = await response.json();

      setHistory((current) => [...current, newRecord]);
      setSelectedPlantChart(form.plant_id);

      setForm({
        plant_id: form.plant_id,
        date: new Date().toISOString().split("T")[0],
        height: "",
        growth_stage: "Vegetative",
        leaf_count: "",
      });
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save growth record"
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredHistory = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return history.filter((g) => {
      const matchesPlant =
        tablePlantFilter === "all"
          ? true
          : g.plant_id === tablePlantFilter;

      const matchesSearch =
        g.plant_id.toLowerCase().includes(normalizedSearch) ||
        (g.plant_name || "").toLowerCase().includes(normalizedSearch) ||
        g.growth_stage.toLowerCase().includes(normalizedSearch) ||
        g.date.includes(normalizedSearch);

      return matchesPlant && matchesSearch;
    });
  }, [history, tablePlantFilter, search]);

  const currentPlantObj = plants.find(
    (p) => p.plant_id === selectedPlantChart
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Growth &amp; Reports
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Track height progression, growth stages, and leaf count
            measurements per plant.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Growth Record Form
          </h2>

          <form onSubmit={handleSaveRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Plant Specimen
              </label>

              <select
                value={form.plant_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    plant_id: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                required
                disabled={loading || plants.length === 0}
              >
                {plants.length === 0 ? (
                  <option value="">No plants available</option>
                ) : (
                  plants.map((plant) => (
                    <option key={plant.plant_id} value={plant.plant_id}>
                      {plant.common_name} ({plant.plant_id})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Date
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Height (cm)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 45.2"
                  value={form.height}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      height: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Growth Stage
                </label>

                <select
                  value={form.growth_stage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      growth_stage: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                >
                  {[
                    "Seedling",
                    "Vegetative",
                    "Budding",
                    "Flowering",
                    "Mature",
                  ].map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Leaf Count
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 8"
                  value={form.leaf_count}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      leaf_count: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || loading || plants.length === 0}
              className="w-full py-3 bg-[#1B3B2C] hover:bg-[#14532d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              {saving ? "Saving..." : "Save Growth Record"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Height Progression
                </h2>

                <p className="text-xs text-gray-400">
                  Showing growth curve for{" "}
                  {currentPlantObj?.common_name || selectedPlantChart}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  Filter Plant:
                </span>

                <select
                  value={selectedPlantChart}
                  onChange={(e) =>
                    setSelectedPlantChart(e.target.value)
                  }
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-[#1B3B2C] bg-green-50/70 focus:outline-none focus:ring-2 focus:ring-green-200"
                  disabled={loading || plants.length === 0}
                >
                  {plants.length === 0 ? (
                    <option value="">No plants available</option>
                  ) : (
                    plants.map((plant) => (
                      <option key={plant.plant_id} value={plant.plant_id}>
                        {plant.common_name} ({plant.plant_id})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="h-[180px] flex items-center justify-center text-xs text-gray-400">
                Loading growth data...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={chartData}
                  margin={{
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: -20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 10,
                      fill: "#9ca3af",
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "#9ca3af",
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#1B3B2C",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#fff",
                    }}
                    formatter={(v: any) => [
                      `${v ?? 0} cm`,
                      "Height",
                    ]}
                  />

                  <Bar
                    dataKey="height"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.isLatest
                            ? "#1B3B2C"
                            : "#86efac"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-xs text-gray-400 italic">
                No growth measurements logged yet for this plant.
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-2">
              <h2 className="text-base font-semibold text-gray-800">
                Growth History
              </h2>

              <div className="flex items-center gap-2">
                <select
                  value={tablePlantFilter}
                  onChange={(e) =>
                    setTablePlantFilter(e.target.value)
                  }
                  className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                  disabled={loading || plants.length === 0}
                >
                  <option value="all">All Plants</option>

                  {plants.map((plant) => (
                    <option
                      key={plant.plant_id}
                      value={plant.plant_id}
                    >
                      {plant.common_name}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />

                  <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-200 bg-white w-32"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                  Loading growth records...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                  No growth records found.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {[
                        "Date",
                        "Plant",
                        "Height (cm)",
                        "Stage",
                        "Leaves",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredHistory.map((g) => (
                      <tr
                        key={g.growth_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {g.date}
                        </td>

                        <td className="px-5 py-3">
                          <p className="text-sm font-semibold text-gray-800">
                            {g.plant_name || "Unknown Plant"}
                          </p>

                          <p className="text-xs font-mono font-medium text-gray-400">
                            {g.plant_id}
                          </p>
                        </td>

                        <td className="px-5 py-3 text-sm font-bold text-gray-800">
                          {g.height} cm
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`badge ${
                              stageConfig[g.growth_stage] ??
                              "status-clear"
                            }`}
                          >
                            {g.growth_stage}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-sm text-gray-700 font-semibold">
                          {g.leaf_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}