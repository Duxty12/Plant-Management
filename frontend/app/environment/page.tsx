"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockEnvironmentRecords, mockSections, tempSparkData, humiditySparkData, lightSparkData } from "@/data/mockData";
import { Thermometer, Droplets, Sun, Filter, ArrowUpDown, Search } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        <Tooltip
          contentStyle={{ background: "#1B3B2C", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#fff" }}
          itemStyle={{ color: "#fff" }}
          formatter={(v: any) => [v ?? 0, ""]}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function EnvironmentPage() {
  const [records, setRecords] = useState(mockEnvironmentRecords);
  const [form, setForm] = useState({
    section: "SEC-A01",
    date: new Date().toISOString().split("T")[0],
    temperature: "",
    humidity: "",
    light_level: "",
  });

  // Filter, Sort & Search for Historical Records
  const [selectedSection, setSelectedSection] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "temp_desc" | "temp_asc" | "humidity_desc" | "light_desc">("date_desc");

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const tempNum = parseFloat(form.temperature) || 25.0;
    const humidityNum = parseFloat(form.humidity) || 75.0;
    const lightNum = parseInt(form.light_level) || 800;

    const sectionObj = mockSections.find((s) => s.section_id === form.section);

    const newRecord = {
      env_id: `ENV-${Math.floor(1000 + Math.random() * 9000)}`,
      section_id: form.section,
      section_name: sectionObj ? sectionObj.section_name : form.section,
      date: form.date,
      temperature: tempNum,
      humidity: humidityNum,
      light_level: lightNum,
      status: "optimal",
    };

    setRecords([newRecord, ...records]);
    setForm({
      section: "SEC-A01",
      date: new Date().toISOString().split("T")[0],
      temperature: "",
      humidity: "",
      light_level: "",
    });
  };

  const filteredRecords = records
    .filter((r) => {
      const matchSection = selectedSection === "all" || r.section_id === selectedSection;
      const matchSearch =
        r.section_id.toLowerCase().includes(search.toLowerCase()) ||
        r.section_name.toLowerCase().includes(search.toLowerCase()) ||
        r.env_id.toLowerCase().includes(search.toLowerCase()) ||
        r.date.includes(search);
      return matchSection && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date_asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "temp_desc") return b.temperature - a.temperature;
      if (sortBy === "temp_asc") return a.temperature - b.temperature;
      if (sortBy === "humidity_desc") return b.humidity - a.humidity;
      if (sortBy === "light_desc") return b.light_level - a.light_level;
      return 0;
    });

  return (
    <DashboardLayout>
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-900">Environment Monitoring</h1>
        <p className="text-gray-500 mt-1 text-sm">Track, filter, and log real-time environmental conditions across all sections.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {[
          { label: "Avg Temperature", value: "25.6°C", icon: Thermometer, iconColor: "text-orange-500", iconBg: "bg-orange-100", spark: tempSparkData, lineColor: "#f97316" },
          { label: "Avg Humidity", value: "74.5%", icon: Droplets, iconColor: "text-blue-500", iconBg: "bg-blue-100", spark: humiditySparkData, lineColor: "#3b82f6" },
          { label: "Avg Light Level", value: "918 lux", icon: Sun, iconColor: "text-yellow-500", iconBg: "bg-yellow-100", spark: lightSparkData, lineColor: "#eab308" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{m.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{m.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full ${m.iconBg} flex items-center justify-center flex-shrink-0`}>
                <m.icon className={`w-5 h-5 ${m.iconColor}`} />
              </div>
            </div>
            <Sparkline data={m.spark} color={m.lineColor} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Record Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-green-600" /> Record Environment
          </h2>
          <form onSubmit={handleSaveRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Section</label>
              <select
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
              >
                {mockSections.map((sec) => (
                  <option key={sec.section_id} value={sec.section_id}>
                    {sec.section_id} — {sec.section_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 26.5"
                  value={form.temperature}
                  onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Humidity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 78.2"
                  value={form.humidity}
                  onChange={(e) => setForm({ ...form, humidity: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Light Level (lux)</label>
              <input
                type="number"
                step="1"
                placeholder="e.g. 920"
                value={form.light_level}
                onChange={(e) => setForm({ ...form, light_level: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                required
              />
            </div>

            <button type="submit" className="w-full py-3 bg-[#1B3B2C] hover:bg-[#14532d] text-white font-semibold text-sm rounded-xl transition shadow-sm">
              Save Record
            </button>
          </form>
        </div>

        {/* Historical Records Table */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Historical Records</h2>
                <p className="text-xs text-gray-400">Showing {filteredRecords.length} environmental entries</p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
                />
              </div>

              {/* Filter by section */}
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="all">All Sections</option>
                  {mockSections.map((s) => (
                    <option key={s.section_id} value={s.section_id}>
                      {s.section_id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="date_desc">Date: Newest</option>
                  <option value="date_asc">Date: Oldest</option>
                  <option value="temp_desc">Temp: High</option>
                  <option value="temp_asc">Temp: Low</option>
                  <option value="humidity_desc">Humidity: High</option>
                  <option value="light_desc">Light: High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Env ID", "Section", "Date", "Temp", "Humidity", "Light"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.env_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-gray-500">{rec.env_id}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-700 font-semibold">{rec.section_id}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{rec.date}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">{rec.temperature}°C</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{rec.humidity}%</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{rec.light_level} lux</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
