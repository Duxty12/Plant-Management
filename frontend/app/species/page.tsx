"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockSpecies } from "@/data/mockData";
import { Plus, Pencil, Trash2, Search, Globe, X, Check } from "lucide-react";



interface SpeciesItem {
  species_id: string;
  common_name: string;
  scientific_name?: string | null;
  origin_country?: string | null;
  plant_count: number;
  is_user_owned?: boolean;
}

export default function SpeciesPage() {
  const [speciesList, setSpeciesList] = useState<SpeciesItem[]>(mockSpecies);
  const [filter, setFilter] = useState("");
  const [showAll, setShowAll] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<SpeciesItem | null>(null);

  // Add Form
  const [addForm, setAddForm] = useState({
    common_name: "",
    scientific_name: "",
    origin_country: "",
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    common_name: "",
    scientific_name: "",
    origin_country: "",
  });

  const displayedList = speciesList.filter((s) => {
    const matchesShowAll = showAll ? true : (s.plant_count > 0);
    const matchesSearch =
      s.common_name.toLowerCase().includes(filter.toLowerCase()) ||
      (s.scientific_name ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      (s.origin_country ?? "").toLowerCase().includes(filter.toLowerCase());
    return matchesShowAll && matchesSearch;
  });

  const handleAddSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    const newSp = {
      species_id: `SPC-${String(speciesList.length + 1).padStart(4, "0")}`,
      common_name: addForm.common_name,
      scientific_name: addForm.scientific_name || null,
      origin_country: addForm.origin_country || null,
      plant_count: 0,
      is_user_owned: false,
    };
    setSpeciesList([newSp, ...speciesList]);
    setAddForm({ common_name: "", scientific_name: "", origin_country: "" });
    setShowAddModal(false);
  };

  const handleOpenEdit = (sp: SpeciesItem) => {
    setEditingSpecies(sp);
    setEditForm({
      common_name: sp.common_name,
      scientific_name: sp.scientific_name || "",
      origin_country: sp.origin_country || "",
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecies) return;
    setSpeciesList(speciesList.map((s) => {
      if (s.species_id === editingSpecies.species_id) {
        return {
          ...s,
          common_name: editForm.common_name,
          scientific_name: editForm.scientific_name || null,
          origin_country: editForm.origin_country || null,
        };
      }
      return s;
    }));
    setEditingSpecies(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this species classification?")) {
      setSpeciesList(speciesList.filter((s) => s.species_id !== id));
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Species Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Browse, filter, and manage registered botanical species classifications.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Show All Toggle Button */}
          <button
            onClick={() => setShowAll(!showAll)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition ${
              showAll
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Globe className="w-4 h-4 text-green-600" />
            {showAll ? "Showing All Available Species" : "Show All Species (Catalog)"}
            {showAll && <span className="w-2 h-2 rounded-full bg-green-500" />}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Species
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 mb-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Filter species by common name, scientific name, or country…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
        />
        <div className="text-xs text-gray-400 font-medium">
          {displayedList.length} species {showAll ? "in catalog" : "in user inventory"}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Species ID", "Common Name", "Scientific Name", "Origin Country", "No. of Plants", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedList.map((sp) => (
                <tr key={sp.species_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono font-medium text-gray-500">{sp.species_id}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">
                    {sp.common_name}
                    {sp.plant_count === 0 && (
                      <span className="ml-2 text-[10px] uppercase font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Catalog Only
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 italic">{sp.scientific_name || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">
                    {sp.origin_country || "Unknown"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full text-xs font-bold ${
                      sp.plant_count > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {sp.plant_count} plants
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(sp)}
                        title="Edit Species"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sp.species_id)}
                        title="Delete Species"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add New Species</h2>
                <p className="text-xs text-gray-500 mt-0.5">Register botanical classification to system</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSpecies} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Common Name</label>
                <input
                  type="text"
                  placeholder="e.g. Philodendron Pink Princess"
                  value={addForm.common_name}
                  onChange={(e) => setAddForm({ ...addForm, common_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Scientific Name</label>
                <input
                  type="text"
                  placeholder="e.g. Philodendron erubescens"
                  value={addForm.scientific_name}
                  onChange={(e) => setAddForm({ ...addForm, scientific_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Origin Country</label>
                <input
                  type="text"
                  placeholder="e.g. Colombia"
                  value={addForm.origin_country}
                  onChange={(e) => setAddForm({ ...addForm, origin_country: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm">Save Species</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Species Modal */}
      {editingSpecies && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Species Details</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {editingSpecies.species_id}</p>
              </div>
              <button onClick={() => setEditingSpecies(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
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
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Scientific Name</label>
                <input
                  type="text"
                  value={editForm.scientific_name}
                  onChange={(e) => setEditForm({ ...editForm, scientific_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Origin Country</label>
                <input
                  type="text"
                  value={editForm.origin_country}
                  onChange={(e) => setEditForm({ ...editForm, origin_country: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setEditingSpecies(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
