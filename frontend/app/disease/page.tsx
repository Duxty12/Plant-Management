"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockDiseases, mockPlants, DiseaseRecord, TreatmentItem } from "@/data/mockData";
import { Bug, Plus, Pencil, Trash2, X, Stethoscope, History, Calendar, Pill, PlusCircle } from "lucide-react";

const recoveryConfig: Record<string, string> = {
  ongoing:   "status-sick",
  treating:  "status-recovering",
  recovered: "status-healthy",
};

const recoveryLabel: Record<string, string> = {
  ongoing:   "Ongoing",
  treating:  "Under Treatment",
  recovered: "Recovered",
};

export default function DiseasePage() {
  const [diseases, setDiseases] = useState<DiseaseRecord[]>(mockDiseases);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDisease, setEditingDisease] = useState<DiseaseRecord | null>(null);
  const [activeTreatmentDisease, setActiveTreatmentDisease] = useState<DiseaseRecord | null>(null);

  // Add Disease Form
  const [addForm, setAddForm] = useState({
    disease_name: "",
    plant_id: mockPlants[0]?.plant_id || "PT-1001",
    detect_date: new Date().toISOString().split("T")[0],
    recovery_status: "ongoing" as "ongoing" | "treating" | "recovered",
    heal_date: "",
  });

  // Edit Disease Form
  const [editForm, setEditForm] = useState({
    disease_name: "",
    plant_id: "",
    detect_date: "",
    recovery_status: "ongoing" as "ongoing" | "treating" | "recovered",
    heal_date: "",
  });

  // Add Treatment Form (inside treatment modal)
  const [treatmentForm, setTreatmentForm] = useState({
    medicine: "",
    treat_date: new Date().toISOString().split("T")[0],
  });

  // --- Handlers ---
  const handleAddDisease = (e: React.FormEvent) => {
    e.preventDefault();
    const plant = mockPlants.find((p) => p.plant_id === addForm.plant_id) || mockPlants[0];
    const newDisease: DiseaseRecord = {
      disease_id: `DIS-${String(diseases.length + 1).padStart(3, "0")}`,
      disease_name: addForm.disease_name || "Unspecified Pathogen",
      plant_id: addForm.plant_id,
      plant_name: plant ? plant.common_name : "Specimen",
      detect_date: addForm.detect_date,
      recovery_status: addForm.recovery_status,
      heal_date: addForm.recovery_status === "recovered" ? addForm.heal_date || addForm.detect_date : null,
      treatments: [],
    };

    setDiseases([newDisease, ...diseases]);
    setAddForm({
      disease_name: "",
      plant_id: mockPlants[0]?.plant_id || "PT-1001",
      detect_date: new Date().toISOString().split("T")[0],
      recovery_status: "ongoing",
      heal_date: "",
    });
    setShowAddModal(false);
  };

  const handleOpenEdit = (d: DiseaseRecord) => {
    setEditingDisease(d);
    setEditForm({
      disease_name: d.disease_name,
      plant_id: d.plant_id,
      detect_date: d.detect_date,
      recovery_status: d.recovery_status,
      heal_date: d.heal_date || "",
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDisease) return;

    const plant = mockPlants.find((p) => p.plant_id === editForm.plant_id);

    setDiseases(diseases.map((d) => {
      if (d.disease_id === editingDisease.disease_id) {
        return {
          ...d,
          disease_name: editForm.disease_name,
          plant_id: editForm.plant_id,
          plant_name: plant ? plant.common_name : d.plant_name,
          detect_date: editForm.detect_date,
          recovery_status: editForm.recovery_status,
          heal_date: editForm.recovery_status === "recovered" ? editForm.heal_date : null,
        };
      }
      return d;
    }));

    setEditingDisease(null);
  };

  const handleDeleteDisease = (id: string) => {
    if (confirm("Are you sure you want to remove this disease log?")) {
      setDiseases(diseases.filter((d) => d.disease_id !== id));
    }
  };

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTreatmentDisease || !treatmentForm.medicine.trim()) return;

    const newTreatment: TreatmentItem = {
      treat_id: `TRT-${Math.floor(100 + Math.random() * 900)}`,
      date: treatmentForm.treat_date,
      medicine: treatmentForm.medicine.trim(),
    };

    const updatedDiseases = diseases.map((d) => {
      if (d.disease_id === activeTreatmentDisease.disease_id) {
        const updated = {
          ...d,
          recovery_status: d.recovery_status === "ongoing" ? ("treating" as const) : d.recovery_status,
          treatments: [...d.treatments, newTreatment],
        };
        setActiveTreatmentDisease(updated);
        return updated;
      }
      return d;
    });

    setDiseases(updatedDiseases);
    setTreatmentForm({ medicine: "", treat_date: new Date().toISOString().split("T")[0] });
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [plantFilter, setPlantFilter] = useState("all");

  const filteredDiseases = diseases.filter((d) => {
    const matchesSearch =
      d.disease_name.toLowerCase().includes(search.toLowerCase()) ||
      d.disease_id.toLowerCase().includes(search.toLowerCase()) ||
      d.plant_name.toLowerCase().includes(search.toLowerCase()) ||
      d.plant_id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : d.recovery_status === statusFilter;
    const matchesPlant = plantFilter === "all" ? true : d.plant_id === plantFilter;
    return matchesSearch && matchesStatus && matchesPlant;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disease &amp; Treatment Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Track identified pathogens, affected specimens, recovery progress, and clinical treatment history.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Disease Record
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search disease, pathogen, plant name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="all">All Recovery Statuses</option>
            <option value="ongoing">Ongoing (Active)</option>
            <option value="treating">Under Treatment</option>
            <option value="recovered">Recovered</option>
          </select>

          <select
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="all">All Plants</option>
            {mockPlants.map((p) => (
              <option key={p.plant_id} value={p.plant_id}>
                {p.common_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-800">Disease &amp; Pathology Registry</h2>
          </div>
          <p className="text-xs text-gray-400 font-medium">{filteredDiseases.length} shown of {diseases.length} entries</p>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Disease Name", "Affected Plant", "Detection Date", "Recovery Status", "Recovery Date", "Treatment Details", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDiseases.map((d) => {
                const hasTreatments = d.treatments && d.treatments.length > 0;
                return (
                  <tr key={d.disease_id} className="hover:bg-gray-50 transition-colors">
                    {/* Disease Name & ID */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-900">{d.disease_name}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">{d.disease_id}</p>
                    </td>

                    {/* Affected Plant (Single Plant) */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-800">{d.plant_name}</p>
                      <p className="text-xs font-mono text-gray-400">{d.plant_id}</p>
                    </td>

                    {/* Detection Date */}
                    <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{d.detect_date}</td>

                    {/* Recovery Status */}
                    <td className="px-5 py-4">
                      <span className={`badge ${recoveryConfig[d.recovery_status] ?? "status-clear"}`}>
                        {recoveryLabel[d.recovery_status] ?? d.recovery_status}
                      </span>
                    </td>

                    {/* Recovery Date Column */}
                    <td className="px-5 py-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                      {d.recovery_status === "recovered" && d.heal_date ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-semibold">
                          <Calendar className="w-3 h-3 text-emerald-600" /> {d.heal_date}
                        </span>
                      ) : (
                        <span className="text-gray-300 font-mono">—</span>
                      )}
                    </td>

                    {/* Treatments Modal Trigger */}
                    <td className="px-5 py-4">
                      {d.recovery_status === "treating" ? (
                        <button
                          onClick={() => setActiveTreatmentDisease(d)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition"
                        >
                          <Stethoscope className="w-3.5 h-3.5 text-amber-600" />
                          Treatment Details ({d.treatments.length})
                        </button>
                      ) : d.recovery_status === "recovered" ? (
                        <button
                          onClick={() => setActiveTreatmentDisease(d)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition"
                        >
                          <History className="w-3.5 h-3.5 text-emerald-600" />
                          Treatment History ({d.treatments.length})
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTreatmentDisease(d)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-gray-500" />
                          {hasTreatments ? `Treatments (${d.treatments.length})` : "+ Add Treatment"}
                        </button>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          title="Edit Disease Record"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDisease(d.disease_id)}
                          title="Delete Disease Record"
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

      {/* Add Disease Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Disease Record</h2>
                <p className="text-xs text-gray-500 mt-0.5">Register a diagnosed condition for a plant</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDisease} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Disease Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anthracnose Leaf Blight"
                  value={addForm.disease_name}
                  onChange={(e) => setAddForm({ ...addForm, disease_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Affected Plant (Single)</label>
                <select
                  value={addForm.plant_id}
                  onChange={(e) => setAddForm({ ...addForm, plant_id: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Detection Date</label>
                  <input
                    type="date"
                    value={addForm.detect_date}
                    onChange={(e) => setAddForm({ ...addForm, detect_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Recovery Status</label>
                  <select
                    value={addForm.recovery_status}
                    onChange={(e) => setAddForm({ ...addForm, recovery_status: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  >
                    <option value="ongoing">Ongoing (Active)</option>
                    <option value="treating">Under Treatment</option>
                    <option value="recovered">Recovered</option>
                  </select>
                </div>
              </div>

              {addForm.recovery_status === "recovered" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Recovery Date</label>
                  <input
                    type="date"
                    value={addForm.heal_date}
                    onChange={(e) => setAddForm({ ...addForm, heal_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    required
                  />
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Disease Modal */}
      {editingDisease && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Disease Record</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {editingDisease.disease_id}</p>
              </div>
              <button onClick={() => setEditingDisease(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Disease Name</label>
                <input
                  type="text"
                  value={editForm.disease_name}
                  onChange={(e) => setEditForm({ ...editForm, disease_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Affected Plant</label>
                <select
                  value={editForm.plant_id}
                  onChange={(e) => setEditForm({ ...editForm, plant_id: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Detection Date</label>
                  <input
                    type="date"
                    value={editForm.detect_date}
                    onChange={(e) => setEditForm({ ...editForm, detect_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Recovery Status</label>
                  <select
                    value={editForm.recovery_status}
                    onChange={(e) => setEditForm({ ...editForm, recovery_status: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  >
                    <option value="ongoing">Ongoing (Active)</option>
                    <option value="treating">Under Treatment</option>
                    <option value="recovered">Recovered</option>
                  </select>
                </div>
              </div>

              {editForm.recovery_status === "recovered" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Recovery Date</label>
                  <input
                    type="date"
                    value={editForm.heal_date}
                    onChange={(e) => setEditForm({ ...editForm, heal_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    required
                  />
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setEditingDisease(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Treatments Details & History Modal (with Add Treatment Form) */}
      {activeTreatmentDisease && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-[#1B3B2C] text-white">
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold">Treatment Details &amp; Protocols</h2>
                </div>
                <p className="text-xs text-emerald-200 mt-1">
                  Plant: <span className="font-semibold text-white">{activeTreatmentDisease.plant_name}</span> ({activeTreatmentDisease.plant_id}) · Condition: <span className="font-semibold text-white">{activeTreatmentDisease.disease_name}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveTreatmentDisease(null)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Existing Treatments List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Applied Treatment Logs</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {activeTreatmentDisease.treatments.length} log(s)
                  </span>
                </div>

                {activeTreatmentDisease.treatments.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeTreatmentDisease.treatments.map((t) => (
                      <div key={t.treat_id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{t.medicine}</p>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" /> Treatment Date: {t.date}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                          {t.treat_id}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <Pill className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-500 font-medium">No treatment records logged yet for this plant condition.</p>
                  </div>
                )}
              </div>

              {/* Add Treatment Details Form */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-emerald-600" /> Add Treatment Details
                </h3>
                <form onSubmit={handleAddTreatment} className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Medicine / Protocol</label>
                    <input
                      type="text"
                      placeholder="e.g. Copper Fungicide Spray / Neem Oil flush"
                      value={treatmentForm.medicine}
                      onChange={(e) => setTreatmentForm({ ...treatmentForm, medicine: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Treatment Date</label>
                    <input
                      type="date"
                      value={treatmentForm.treat_date}
                      onChange={(e) => setTreatmentForm({ ...treatmentForm, treat_date: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white font-semibold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save Treatment to Log
                  </button>
                </form>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setActiveTreatmentDisease(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
