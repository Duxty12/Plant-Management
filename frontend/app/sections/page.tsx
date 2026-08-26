"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockSections } from "@/data/mockData";
import { Thermometer, Droplets, Sun, Plus, X, Building2, Search, Filter } from "lucide-react";

export default function SectionsPage() {
  const [sections, setSections] = useState(mockSections);
  const [search, setSearch] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ section_name: "", env_id: "" });

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    const newSection = {
      section_id: `SEC-${String.fromCharCode(65 + sections.length)}${String(sections.length + 1).padStart(2, "0")}`,
      section_name: form.section_name,
      env_id: form.env_id || `ENV-${Math.floor(1000 + Math.random() * 9000)}`,
      temperature: 24.5,
      humidity: 75.0,
      light_level: 800,
      date: new Date().toISOString().split("T")[0],
      plant_count: 0,
    };
    setSections([...sections, newSection]);
    setForm({ section_name: "", env_id: "" });
    setShowModal(false);
  };

  const filteredSections = sections.filter((sec) => {
    const matchesSearch =
      sec.section_name.toLowerCase().includes(search.toLowerCase()) ||
      sec.section_id.toLowerCase().includes(search.toLowerCase());
    let matchesOccupancy = true;
    if (occupancyFilter === "active") matchesOccupancy = sec.plant_count > 0;
    if (occupancyFilter === "empty") matchesOccupancy = sec.plant_count === 0;
    if (occupancyFilter === "high") matchesOccupancy = sec.plant_count >= 8;
    return matchesSearch && matchesOccupancy;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Section Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage greenhouse sections and their real-time environmental readings.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sections by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={occupancyFilter}
            onChange={(e) => setOccupancyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="all">All Sections ({sections.length})</option>
            <option value="active">With Plants ({sections.filter((s) => s.plant_count > 0).length})</option>
            <option value="high">High Density (&gt;=8 plants)</option>
            <option value="empty">Empty Zones ({sections.filter((s) => s.plant_count === 0).length})</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSections.map((sec) => (
          <div
            key={sec.section_id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md"
          >
            {/* Card Header */}
            <div className="px-5 py-4 flex items-start justify-between border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-gray-400 mb-0.5">{sec.section_id}</p>
                  <h3 className="text-base font-bold text-gray-900">{sec.section_name}</h3>
                </div>
              </div>
            </div>

            {/* Plant count */}
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-0.5">Active Plants</p>
              <p className="text-4xl font-bold text-[#1B3B2C]">{sec.plant_count}</p>
            </div>

            {/* Env Metrics */}
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Latest Environmental Readings</p>
              <div className="grid grid-cols-3 gap-2">
                {/* Temp */}
                <div className="rounded-lg p-2.5 text-center bg-gray-50">
                  <Thermometer className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                  <p className="text-sm font-bold text-gray-800">{sec.temperature}°C</p>
                  <p className="text-xs text-gray-400">Temp</p>
                </div>
                {/* Humidity */}
                <div className="rounded-lg p-2.5 text-center bg-gray-50">
                  <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-sm font-bold text-gray-800">{sec.humidity}%</p>
                  <p className="text-xs text-gray-400">Humidity</p>
                </div>
                {/* Light */}
                <div className="rounded-lg p-2.5 text-center bg-gray-50">
                  <Sun className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                  <p className="text-sm font-bold text-gray-800">{sec.light_level}</p>
                  <p className="text-xs text-gray-400">lux</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 flex flex-col items-center justify-center gap-3 py-12 transition-all duration-200 hover:bg-green-50/30 group min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 group-hover:text-green-700 transition">Register New Section</p>
            <p className="text-xs text-gray-400 mt-0.5">Add a greenhouse zone to the facility</p>
          </div>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Register New Section</h2>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">POST /sections</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSection} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Section Name</label>
                <input
                  type="text"
                  placeholder="e.g. Highland Orchids Section"
                  value={form.section_name}
                  onChange={(e) => setForm({ ...form, section_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Env ID (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ENV-1007"
                  value={form.env_id}
                  onChange={(e) => setForm({ ...form, env_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm">Register Section</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
