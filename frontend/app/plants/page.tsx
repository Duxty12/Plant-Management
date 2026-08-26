"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { mockPlants, mockSpecies, mockSections, mockSuppliers } from "@/data/mockData";
import { Leaf, HeartPulse, AlertTriangle, Stethoscope, Search, Pencil, Trash2, Plus, X, ArrowUpRight, Filter } from "lucide-react";

const healthConfig: Record<string, { label: string; cls: string; dot: string }> = {
  healthy:    { label: "Healthy",          cls: "status-healthy",    dot: "bg-emerald-500" },
  sick:       { label: "Sick",             cls: "status-sick",       dot: "bg-red-500" },
  recovering: { label: "Under Treatment",  cls: "status-recovering", dot: "bg-amber-500" },
};

export default function PlantsPage() {
  const [plants, setPlants] = useState(mockPlants);
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<typeof mockPlants[0] | null>(null);

  // Add Form
  const [addForm, setAddForm] = useState({
    species_id: mockSpecies[0]?.species_id || "SPC-0001",
    section_id: mockSections[0]?.section_id || "SEC-A01",
    supplier_id: mockSuppliers[0]?.supplier_id || "SUP-001",
    acquire_date: new Date().toISOString().split("T")[0],
    health_status: "healthy",
    owner_name: "Dr. E. Thorne",
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    common_name: "",
    species_id: "",
    section_id: "",
    supplier_id: "",
    acquire_date: "",
    health_status: "healthy",
    owner_name: "",
  });

  const filtered = plants.filter((p) => {
    const matchesSearch =
      p.common_name.toLowerCase().includes(search.toLowerCase()) ||
      p.plant_id.toLowerCase().includes(search.toLowerCase()) ||
      (p.scientific_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesHealth = healthFilter === "all" ? true : p.health_status === healthFilter;
    const matchesSection = sectionFilter === "all" ? true : p.section_id === sectionFilter;
    return matchesSearch && matchesHealth && matchesSection;
  });

  const stats = [
    { label: "Total Plants", value: plants.length, icon: Leaf, color: "text-green-700", bg: "bg-green-100" },
    { label: "Healthy", value: plants.filter((p) => p.health_status === "healthy").length, icon: HeartPulse, color: "text-emerald-700", bg: "bg-emerald-100" },
    { label: "Under Treatment", value: plants.filter((p) => p.health_status === "recovering").length, icon: Stethoscope, color: "text-amber-700", bg: "bg-amber-100" },
    { label: "Sick Specimen", value: plants.filter((p) => p.health_status === "sick").length, icon: AlertTriangle, color: "text-red-700", bg: "bg-red-100" },
  ];

  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault();
    const species = mockSpecies.find((s) => s.species_id === addForm.species_id) || mockSpecies[0];
    const section = mockSections.find((s) => s.section_id === addForm.section_id) || mockSections[0];
    const supplier = mockSuppliers.find((s) => s.supplier_id === addForm.supplier_id) || mockSuppliers[0];

    const newPlant = {
      plant_id: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      species_id: species.species_id,
      common_name: species.common_name,
      scientific_name: species.scientific_name || "",
      family: "Araceae",
      section_id: section.section_id,
      section_name: section.section_name,
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.company,
      acquire_date: addForm.acquire_date,
      health_status: addForm.health_status,
      owner_id: "USR-001",
      owner_name: addForm.owner_name,
    };

    setPlants([newPlant, ...plants]);
    setShowAddModal(false);
  };

  const handleOpenEdit = (plant: typeof mockPlants[0]) => {
    setEditingPlant(plant);
    setEditForm({
      common_name: plant.common_name,
      species_id: plant.species_id,
      section_id: plant.section_id,
      supplier_id: plant.supplier_id,
      acquire_date: plant.acquire_date,
      health_status: plant.health_status,
      owner_name: plant.owner_name,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlant) return;

    const species = mockSpecies.find((s) => s.species_id === editForm.species_id);
    const section = mockSections.find((s) => s.section_id === editForm.section_id);
    const supplier = mockSuppliers.find((s) => s.supplier_id === editForm.supplier_id);

    setPlants(plants.map((p) => {
      if (p.plant_id === editingPlant.plant_id) {
        return {
          ...p,
          common_name: editForm.common_name || (species ? species.common_name : p.common_name),
          species_id: editForm.species_id,
          scientific_name: species ? species.scientific_name || p.scientific_name : p.scientific_name,
          section_id: editForm.section_id,
          section_name: section ? section.section_name : p.section_name,
          supplier_id: editForm.supplier_id,
          supplier_name: supplier ? supplier.company : p.supplier_name,
          acquire_date: editForm.acquire_date,
          health_status: editForm.health_status,
          owner_name: editForm.owner_name,
        };
      }
      return p;
    }));

    setEditingPlant(null);
  };

  const handleDeletePlant = (id: string) => {
    if (confirm("Are you sure you want to remove this plant?")) {
      setPlants(plants.filter((p) => p.plant_id !== id));
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plant Inventory</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage and monitor all botanical specimens across facility sections. Click a plant to view its full details.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Plant
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search plants by name, ID, scientific name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Health Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              <option value="all">All Health Statuses</option>
              <option value="healthy">Healthy</option>
              <option value="recovering">Under Treatment</option>
              <option value="sick">Sick</option>
            </select>
          </div>

          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="all">All Sections</option>
            {mockSections.map((sec) => (
              <option key={sec.section_id} value={sec.section_id}>
                {sec.section_id} ({sec.section_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card (All items on 1 page) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">All Registered Botanical Specimens</h2>
          <span className="text-xs font-medium text-gray-500">{filtered.length} plants shown</span>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Plant ID", "Species", "Section", "Supplier", "Acquired", "Health Status", "Owner", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((plant) => {
                const hc = healthConfig[plant.health_status] ?? healthConfig.healthy;
                return (
                  <tr key={plant.plant_id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-5 py-3.5 text-xs font-mono font-medium text-gray-600">
                      <Link href={`/plants/${plant.plant_id}`} className="text-green-700 hover:underline font-bold">
                        {plant.plant_id}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/plants/${plant.plant_id}`} className="flex items-center gap-3 group-hover:opacity-90">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                          <Leaf className="w-4 h-4 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-green-800 transition flex items-center gap-1">
                            {plant.common_name}
                            <ArrowUpRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                          </p>
                          <p className="text-xs text-gray-400 italic">{plant.scientific_name}</p>
                          <p className="text-xs text-gray-400">{plant.family}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-600">{plant.section_id}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 max-w-[140px] truncate">{plant.supplier_name}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{plant.acquire_date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${hc.dot}`} />
                        <span className={`badge ${hc.cls}`}>{hc.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{plant.owner_name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(plant)}
                          title="Edit Plant"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlant(plant.plant_id)}
                          title="Delete Plant"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add New Plant</h2>
                <p className="text-xs text-gray-500 mt-0.5">Register a botanical specimen to inventory</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPlant} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Species</label>
                <select
                  value={addForm.species_id}
                  onChange={(e) => setAddForm({ ...addForm, species_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                >
                  {mockSpecies.map((s) => (
                    <option key={s.species_id} value={s.species_id}>
                      {s.common_name} ({s.scientific_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Section</label>
                  <select
                    value={addForm.section_id}
                    onChange={(e) => setAddForm({ ...addForm, section_id: e.target.value })}
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
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Supplier</label>
                  <select
                    value={addForm.supplier_id}
                    onChange={(e) => setAddForm({ ...addForm, supplier_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  >
                    {mockSuppliers.map((sup) => (
                      <option key={sup.supplier_id} value={sup.supplier_id}>
                        {sup.company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Acquire Date</label>
                  <input
                    type="date"
                    value={addForm.acquire_date}
                    onChange={(e) => setAddForm({ ...addForm, acquire_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Health Status</label>
                  <select
                    value={addForm.health_status}
                    onChange={(e) => setAddForm({ ...addForm, health_status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="recovering">Under Treatment</option>
                    <option value="sick">Sick</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Assigned Botanist / Owner</label>
                <input
                  type="text"
                  value={addForm.owner_name}
                  onChange={(e) => setAddForm({ ...addForm, owner_name: e.target.value })}
                  placeholder="e.g. Dr. E. Thorne"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  Add Plant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plant Modal */}
      {editingPlant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Plant Details</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {editingPlant.plant_id}</p>
              </div>
              <button onClick={() => setEditingPlant(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Common Name</label>
                <input
                  type="text"
                  value={editForm.common_name}
                  onChange={(e) => setEditForm({ ...editForm, common_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Species Classification</label>
                <select
                  value={editForm.species_id}
                  onChange={(e) => setEditForm({ ...editForm, species_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                >
                  {mockSpecies.map((s) => (
                    <option key={s.species_id} value={s.species_id}>
                      {s.common_name} ({s.scientific_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Section</label>
                  <select
                    value={editForm.section_id}
                    onChange={(e) => setEditForm({ ...editForm, section_id: e.target.value })}
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
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Supplier</label>
                  <select
                    value={editForm.supplier_id}
                    onChange={(e) => setEditForm({ ...editForm, supplier_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  >
                    {mockSuppliers.map((sup) => (
                      <option key={sup.supplier_id} value={sup.supplier_id}>
                        {sup.company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Acquired Date</label>
                  <input
                    type="date"
                    value={editForm.acquire_date}
                    onChange={(e) => setEditForm({ ...editForm, acquire_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Health Status</label>
                  <select
                    value={editForm.health_status}
                    onChange={(e) => setEditForm({ ...editForm, health_status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="recovering">Under Treatment</option>
                    <option value="sick">Sick</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Owner / Botanist</label>
                <input
                  type="text"
                  value={editForm.owner_name}
                  onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlant(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
