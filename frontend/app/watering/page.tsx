"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockWateringRecords, mockFertilizerRecords, mockPlants } from "@/data/mockData";
import { Pencil, Trash2, Droplets, Sparkles, Filter } from "lucide-react";

export default function WateringPage() {
  const [activeTab, setActiveTab] = useState<"watering" | "fertilization">("watering");
  const [waterings, setWaterings] = useState(mockWateringRecords);
  const [fertilizations, setFertilizations] = useState(mockFertilizerRecords);

  const [waterForm, setWaterForm] = useState({
    plant_id: mockPlants[0]?.plant_id || "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
  });

  const [fertForm, setFertForm] = useState({
    plant_id: mockPlants[0]?.plant_id || "",
    name: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
  });

  const [dateFilter, setDateFilter] = useState("");
  const [plantFilter, setPlantFilter] = useState("all");
  const [search, setSearch] = useState("");

  const handleSaveWatering = (e: React.FormEvent) => {
    e.preventDefault();
    const plant = mockPlants.find((p) => p.plant_id === waterForm.plant_id) || mockPlants[0];
    const newRecord = {
      water_id: `WAT-${String(waterings.length + 1).padStart(4, "0")}`,
      plant_id: waterForm.plant_id,
      plant_name: plant ? plant.common_name : "Specimen",
      date: waterForm.date,
      amount: parseFloat(waterForm.amount) || 250,
    };
    setWaterings([newRecord, ...waterings]);
    setWaterForm({ plant_id: mockPlants[0]?.plant_id || "", date: new Date().toISOString().split("T")[0], amount: "" });
  };

  const handleSaveFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    const plant = mockPlants.find((p) => p.plant_id === fertForm.plant_id) || mockPlants[0];
    const newRecord = {
      fertilizer_id: `FRT-${String(fertilizations.length + 1).padStart(4, "0")}`,
      plant_id: fertForm.plant_id,
      plant_name: plant ? plant.common_name : "Specimen",
      name: fertForm.name || "Balanced Botanical Fertilizer",
      date: fertForm.date,
      amount: parseFloat(fertForm.amount) || 15.0,
    };
    setFertilizations([newRecord, ...fertilizations]);
    setFertForm({ plant_id: mockPlants[0]?.plant_id || "", name: "", date: new Date().toISOString().split("T")[0], amount: "" });
  };

  const handleDeleteWatering = (id: string) => {
    setWaterings(waterings.filter((w) => w.water_id !== id));
  };

  const handleDeleteFertilizer = (id: string) => {
    setFertilizations(fertilizations.filter((f) => f.fertilizer_id !== id));
  };

  const filteredWaterings = waterings.filter((w) => {
    const matchDate = dateFilter ? w.date === dateFilter : true;
    const matchPlant = plantFilter !== "all" ? w.plant_id === plantFilter : true;
    const matchSearch =
      w.plant_name.toLowerCase().includes(search.toLowerCase()) ||
      w.plant_id.toLowerCase().includes(search.toLowerCase());
    return matchDate && matchPlant && matchSearch;
  });

  const filteredFertilizations = fertilizations.filter((f) => {
    const matchDate = dateFilter ? f.date === dateFilter : true;
    const matchPlant = plantFilter !== "all" ? f.plant_id === plantFilter : true;
    const matchSearch =
      f.plant_name.toLowerCase().includes(search.toLowerCase()) ||
      f.plant_id.toLowerCase().includes(search.toLowerCase()) ||
      f.name.toLowerCase().includes(search.toLowerCase());
    return matchDate && matchPlant && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-900">Watering &amp; Fertilization Logs</h1>
        <p className="text-gray-500 mt-1 text-sm">Record and review plant care events for watering and nutrient applications.</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("watering")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
            activeTab === "watering"
              ? "border-[#1B3B2C] text-[#1B3B2C]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Droplets className="w-4 h-4 text-blue-500" /> Watering Records
        </button>
        <button
          onClick={() => setActiveTab("fertilization")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
            activeTab === "fertilization"
              ? "border-[#1B3B2C] text-[#1B3B2C]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" /> Fertilization Records
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {activeTab === "watering" ? (
              <>
                <Droplets className="w-4 h-4 text-blue-500" /> Record New Watering
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-600" /> Record New Fertilization
              </>
            )}
          </h2>

          {activeTab === "watering" ? (
            <form onSubmit={handleSaveWatering} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Plant Specimen</label>
                <select
                  value={waterForm.plant_id}
                  onChange={(e) => setWaterForm({ ...waterForm, plant_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                >
                  {mockPlants.map((p) => (
                    <option key={p.plant_id} value={p.plant_id}>
                      {p.common_name} ({p.plant_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  value={waterForm.date}
                  onChange={(e) => setWaterForm({ ...waterForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Amount (ml)</label>
                <input
                  type="number"
                  placeholder="e.g. 350"
                  value={waterForm.amount}
                  onChange={(e) => setWaterForm({ ...waterForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <button type="submit" className="w-full py-3 bg-[#1B3B2C] hover:bg-[#14532d] text-white font-semibold text-sm rounded-xl transition shadow-sm">
                Save Watering Log
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveFertilizer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Plant Specimen</label>
                <select
                  value={fertForm.plant_id}
                  onChange={(e) => setFertForm({ ...fertForm, plant_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                >
                  {mockPlants.map((p) => (
                    <option key={p.plant_id} value={p.plant_id}>
                      {p.common_name} ({p.plant_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Fertilizer Name / Formula</label>
                <input
                  type="text"
                  placeholder="e.g. Organic NPK 10-10-10"
                  value={fertForm.name}
                  onChange={(e) => setFertForm({ ...fertForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  value={fertForm.date}
                  onChange={(e) => setFertForm({ ...fertForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Amount (ml)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 15.5"
                  value={fertForm.amount}
                  onChange={(e) => setFertForm({ ...fertForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <button type="submit" className="w-full py-3 bg-[#1B3B2C] hover:bg-[#14532d] text-white font-semibold text-sm rounded-xl transition shadow-sm">
                Save Fertilization Log
              </button>
            </form>
          )}
        </div>

        {/* History Table */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
            <h2 className="text-base font-semibold text-gray-800">
              {activeTab === "watering" ? "Watering History" : "Fertilization History"}
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
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
              >
                <option value="all">All Plants</option>
                {mockPlants.map((p) => (
                  <option key={p.plant_id} value={p.plant_id}>
                    {p.common_name}
                  </option>
                ))}
              </select>
              {(dateFilter || plantFilter !== "all" || search) && (
                <button
                  onClick={() => { setDateFilter(""); setPlantFilter("all"); setSearch(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            {activeTab === "watering" ? (
              <table>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Plant", "Date", "Amount (ml)", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredWaterings.map((rec) => (
                    <tr key={rec.water_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-gray-800">{rec.plant_name}</p>
                        <p className="text-xs font-mono text-gray-400">{rec.plant_id}</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600 whitespace-nowrap">{rec.date}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-blue-600">{rec.amount} ml</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleDeleteWatering(rec.water_id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Plant", "Fertilizer Formula", "Date", "Amount", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFertilizations.map((rec) => (
                    <tr key={rec.fertilizer_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-gray-800">{rec.plant_name}</p>
                        <p className="text-xs font-mono text-gray-400">{rec.plant_id}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700 font-medium">{rec.name}</td>
                      <td className="px-5 py-3 text-xs text-gray-600 whitespace-nowrap">{rec.date}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-green-700">{rec.amount} ml</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleDeleteFertilizer(rec.fertilizer_id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
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
