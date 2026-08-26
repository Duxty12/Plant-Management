"use client";

import { useEffect, useMemo, useState } from "react";
import { Droplets, Sparkles, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

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

type WateringRecord = {
  water_id: string;
  plant_id: string;
  plant_name: string;
  date: string;
  amount: number;
};

type FertilizerRecord = {
  fertilizer_id: string;
  plant_id: string;
  plant_name: string;
  name: string;
  date: string;
  amount: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function WateringPage() {
  const [activeTab, setActiveTab] = useState<"watering" | "fertilization">(
    "watering"
  );

  const [plants, setPlants] = useState<Plant[]>([]);
  const [waterings, setWaterings] = useState<WateringRecord[]>([]);
  const [fertilizations, setFertilizations] = useState<FertilizerRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [waterForm, setWaterForm] = useState({
    plant_id: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
  });

  const [fertForm, setFertForm] = useState({
    plant_id: "",
    name: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
  });

  const [dateFilter, setDateFilter] = useState("");
  const [plantFilter, setPlantFilter] = useState("all");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [plantsResponse, wateringsResponse, fertilizerResponse] =
        await Promise.all([
          fetch(`${API_URL}/plants`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/care/waterings`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/care/fertilizer`, {
            credentials: "include",
          }),
        ]);

      if (
        plantsResponse.status === 401 ||
        wateringsResponse.status === 401 ||
        fertilizerResponse.status === 401
      ) {
        throw new Error("Unauthorized");
      }

      if (!plantsResponse.ok) {
        throw new Error("Failed to load plants");
      }

      if (!wateringsResponse.ok) {
        throw new Error("Failed to load watering records");
      }

      if (!fertilizerResponse.ok) {
        throw new Error("Failed to load fertilizer records");
      }

      const plantsData = await plantsResponse.json();
      const wateringsData = await wateringsResponse.json();
      const fertilizerData = await fertilizerResponse.json();

      setPlants(plantsData);
      setWaterings(wateringsData);
      setFertilizations(fertilizerData);

      const firstPlant = plantsData[0]?.plant_id || "";

      setWaterForm((current) => ({
        ...current,
        plant_id: current.plant_id || firstPlant,
      }));

      setFertForm((current) => ({
        ...current,
        plant_id: current.plant_id || firstPlant,
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

  const handleSaveWatering = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!waterForm.plant_id || !waterForm.amount) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/care/waterings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plant_id: waterForm.plant_id,
          date: waterForm.date,
          amount: Number(waterForm.amount),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "Failed to save watering record");
      }

      const newRecord = await response.json();

      setWaterings((current) => [newRecord, ...current]);

      setWaterForm({
        plant_id: plants[0]?.plant_id || "",
        date: new Date().toISOString().split("T")[0],
        amount: "",
      });
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save watering record"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFertilizer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fertForm.plant_id || !fertForm.name || !fertForm.amount) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/care/fertilizer`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plant_id: fertForm.plant_id,
          name: fertForm.name,
          date: fertForm.date,
          amount: Number(fertForm.amount),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "Failed to save fertilizer record");
      }

      const newRecord = await response.json();

      setFertilizations((current) => [newRecord, ...current]);

      setFertForm({
        plant_id: plants[0]?.plant_id || "",
        name: "",
        date: new Date().toISOString().split("T")[0],
        amount: "",
      });
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save fertilizer record"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWatering = async (id: string) => {
    if (!confirm("Are you sure you want to delete this watering record?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/care/waterings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "Failed to delete watering record");
      }

      setWaterings((current) =>
        current.filter((record) => record.water_id !== id)
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete watering record"
      );
    }
  };

  const handleDeleteFertilizer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fertilizer record?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/care/fertilizer/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "Failed to delete fertilizer record");
      }

      setFertilizations((current) =>
        current.filter((record) => record.fertilizer_id !== id)
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete fertilizer record"
      );
    }
  };

  const filteredWaterings = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return waterings.filter((record) => {
      const matchDate = dateFilter ? record.date === dateFilter : true;

      const matchPlant =
        plantFilter !== "all" ? record.plant_id === plantFilter : true;

      const matchSearch =
        record.plant_name.toLowerCase().includes(normalizedSearch) ||
        record.plant_id.toLowerCase().includes(normalizedSearch);

      return matchDate && matchPlant && matchSearch;
    });
  }, [waterings, dateFilter, plantFilter, search]);

  const filteredFertilizations = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return fertilizations.filter((record) => {
      const matchDate = dateFilter ? record.date === dateFilter : true;

      const matchPlant =
        plantFilter !== "all" ? record.plant_id === plantFilter : true;

      const matchSearch =
        record.plant_name.toLowerCase().includes(normalizedSearch) ||
        record.plant_id.toLowerCase().includes(normalizedSearch) ||
        record.name.toLowerCase().includes(normalizedSearch);

      return matchDate && matchPlant && matchSearch;
    });
  }, [fertilizations, dateFilter, plantFilter, search]);

  return (
    <DashboardLayout>
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-900">
          Watering &amp; Fertilization Logs
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Record and review plant care events for watering and nutrient
          applications.
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("watering")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px cursor-pointer ${
            activeTab === "watering"
              ? "border-[#1B3B2C] text-[#1B3B2C]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Droplets className="w-4 h-4 text-blue-500" />
          Watering Records
        </button>

        <button
          onClick={() => setActiveTab("fertilization")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px cursor-pointer ${
            activeTab === "fertilization"
              ? "border-[#1B3B2C] text-[#1B3B2C]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Fertilization Records
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {activeTab === "watering" ? (
              <>
                <Droplets className="w-4 h-4 text-blue-500" />
                Record New Watering
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Record New Fertilization
              </>
            )}
          </h2>

          {activeTab === "watering" ? (
            <form onSubmit={handleSaveWatering} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Plant Specimen
                </label>

                <select
                  value={waterForm.plant_id}
                  onChange={(e) =>
                    setWaterForm({
                      ...waterForm,
                      plant_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Date
                </label>

                <input
                  type="date"
                  value={waterForm.date}
                  onChange={(e) =>
                    setWaterForm({
                      ...waterForm,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Amount (ml)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 350"
                  value={waterForm.amount}
                  onChange={(e) =>
                    setWaterForm({
                      ...waterForm,
                      amount: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving || loading || plants.length === 0}
                className="w-full py-3 bg-[#1B3B2C] hover:bg-[#14532d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition shadow-sm cursor-pointer"
              >
                {saving ? "Saving..." : "Save Watering Log"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveFertilizer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Plant Specimen
                </label>

                <select
                  value={fertForm.plant_id}
                  onChange={(e) =>
                    setFertForm({
                      ...fertForm,
                      plant_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Fertilizer Name / Formula
                </label>

                <input
                  type="text"
                  placeholder="e.g. Organic NPK 10-10-10"
                  value={fertForm.name}
                  onChange={(e) =>
                    setFertForm({
                      ...fertForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Date
                </label>

                <input
                  type="date"
                  value={fertForm.date}
                  onChange={(e) =>
                    setFertForm({
                      ...fertForm,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Amount (ml)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 15.5"
                  value={fertForm.amount}
                  onChange={(e) =>
                    setFertForm({
                      ...fertForm,
                      amount: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving || loading || plants.length === 0}
                className="w-full py-3 bg-[#1B3B2C] hover:bg-[#14532d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition shadow-sm cursor-pointer"
              >
                {saving ? "Saving..." : "Save Fertilization Log"}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
            <h2 className="text-base font-semibold text-gray-800">
              {activeTab === "watering"
                ? "Watering History"
                : "Fertilization History"}
            </h2>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search plant or formula…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-200 bg-white w-36"
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
              />

              <select
                value={plantFilter}
                onChange={(e) => setPlantFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-200 bg-white cursor-pointer"
              >
                <option value="all">All Plants</option>

                {plants.map((plant) => (
                  <option key={plant.plant_id} value={plant.plant_id}>
                    {plant.common_name}
                  </option>
                ))}
              </select>

              {(dateFilter || plantFilter !== "all" || search) && (
                <button
                  onClick={() => {
                    setDateFilter("");
                    setPlantFilter("all");
                    setSearch("");
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                Loading care records...
              </div>
            ) : activeTab === "watering" ? (
              filteredWaterings.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                  No watering records found.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Plant", "Date", "Amount (ml)", "Actions"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredWaterings.map((record) => (
                      <tr
                        key={record.water_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm font-semibold text-gray-800">
                            {record.plant_name}
                          </p>
                          <p className="text-xs font-mono text-gray-400">
                            {record.plant_id}
                          </p>
                        </td>

                        <td className="px-5 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {record.date}
                        </td>

                        <td className="px-5 py-3 text-sm font-semibold text-blue-600">
                          {record.amount} ml
                        </td>

                        <td className="px-5 py-3">
                          <button
                            onClick={() =>
                              handleDeleteWatering(record.water_id)
                            }
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : filteredFertilizations.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                No fertilizer records found.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[
                      "Plant",
                      "Fertilizer Formula",
                      "Date",
                      "Amount",
                      "Actions",
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
                  {filteredFertilizations.map((record) => (
                    <tr
                      key={record.fertilizer_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-gray-800">
                          {record.plant_name}
                        </p>
                        <p className="text-xs font-mono text-gray-400">
                          {record.plant_id}
                        </p>
                      </td>

                      <td className="px-5 py-3 text-sm text-gray-700 font-medium">
                        {record.name}
                      </td>

                      <td className="px-5 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {record.date}
                      </td>

                      <td className="px-5 py-3 text-sm font-semibold text-green-700">
                        {record.amount} ml
                      </td>

                      <td className="px-5 py-3">
                        <button
                          onClick={() =>
                            handleDeleteFertilizer(record.fertilizer_id)
                          }
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}