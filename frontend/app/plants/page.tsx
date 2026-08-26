"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Leaf,
  HeartPulse,
  AlertTriangle,
  Stethoscope,
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuthStore } from "@/store/authStore";

type Species = {
  species_id: string;
  common_name: string;
  scientific_name?: string | null;
  origin_country?: string | null;
  plant_count?: number;
  is_user_owned?: boolean;
  user_id?: string | null;
};

type Supplier = {
  supplier_id: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  plants_supplied?: number;
  is_user_owned?: boolean;
  user_id?: string | null;
};

type Section = {
  section_id: string;
  section_name: string;
  user_id: string;
  temperature?: number | null;
  humidity?: number | null;
  light_level?: number | null;
  plant_count?: number;
};

type Plant = {
  plant_id: string;
  species_id: string;
  common_name: string;
  scientific_name?: string | null;
  section_id?: string | null;
  section_name?: string | null;
  supplier_id?: string | null;
  supplier_name?: string | null;
  acquire_date: string;
  health_status: string;
  owner_id: string;
  owner_name: string;
};

type PlantForm = {
  species_id: string;
  section_id: string;
  supplier_id: string;
  acquire_date: string;
  health_status: string;
};

const healthConfig: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  healthy: {
    label: "Healthy",
    cls: "status-healthy",
    dot: "bg-emerald-500",
  },
  sick: {
    label: "Sick",
    cls: "status-sick",
    dot: "bg-red-500",
  },
  recovering: {
    label: "Under Treatment",
    cls: "status-recovering",
    dot: "bg-amber-500",
  },
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PlantsPage() {
  const { user } = useAuthStore();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  const [addForm, setAddForm] = useState<PlantForm>({
    species_id: "",
    section_id: "",
    supplier_id: "",
    acquire_date: new Date().toISOString().split("T")[0],
    health_status: "healthy",
  });

  const [editForm, setEditForm] = useState<PlantForm>({
    species_id: "",
    section_id: "",
    supplier_id: "",
    acquire_date: "",
    health_status: "healthy",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [plantsRes, speciesRes, sectionsRes, suppliersRes] =
        await Promise.all([
          fetch(`${API_URL}/api/plants`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/species`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/sections`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/suppliers`, {
            credentials: "include",
          }),
        ]);

      if (
        plantsRes.status === 401 ||
        speciesRes.status === 401 ||
        sectionsRes.status === 401 ||
        suppliersRes.status === 401
      ) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!plantsRes.ok) {
        throw new Error("Failed to load plants.");
      }

      if (!speciesRes.ok) {
        throw new Error("Failed to load species.");
      }

      if (!sectionsRes.ok) {
        throw new Error("Failed to load sections.");
      }

      if (!suppliersRes.ok) {
        throw new Error("Failed to load suppliers.");
      }

      const [
        plantsData,
        speciesData,
        sectionsData,
        suppliersData,
      ] = await Promise.all([
        plantsRes.json(),
        speciesRes.json(),
        sectionsRes.json(),
        suppliersRes.json(),
      ]);

      setPlants(plantsData);
      setSpecies(speciesData);
      setSections(sectionsData);
      setSuppliers(suppliersData);

      if (speciesData.length > 0) {
        setAddForm((current) => ({
          ...current,
          species_id: current.species_id || speciesData[0].species_id,
        }));
      }

      if (sectionsData.length > 0) {
        setAddForm((current) => ({
          ...current,
          section_id: current.section_id || sectionsData[0].section_id,
        }));
      }

      if (suppliersData.length > 0) {
        setAddForm((current) => ({
          ...current,
          supplier_id: current.supplier_id || suppliersData[0].supplier_id,
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the plant inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return plants.filter((plant) => {
      const matchesSearch =
        !query ||
        plant.common_name.toLowerCase().includes(query) ||
        plant.plant_id.toLowerCase().includes(query) ||
        (plant.scientific_name || "").toLowerCase().includes(query);

      const matchesHealth =
        healthFilter === "all" ||
        plant.health_status === healthFilter;

      const matchesSection =
        sectionFilter === "all" ||
        plant.section_id === sectionFilter;

      return matchesSearch && matchesHealth && matchesSection;
    });
  }, [plants, search, healthFilter, sectionFilter]);

  const stats = [
    {
      label: "Total Plants",
      value: plants.length,
      icon: Leaf,
      color: "text-green-700",
      bg: "bg-green-100",
    },
    {
      label: "Healthy",
      value: plants.filter((p) => p.health_status === "healthy").length,
      icon: HeartPulse,
      color: "text-emerald-700",
      bg: "bg-emerald-100",
    },
    {
      label: "Under Treatment",
      value: plants.filter((p) => p.health_status === "recovering").length,
      icon: Stethoscope,
      color: "text-amber-700",
      bg: "bg-amber-100",
    },
    {
      label: "Sick Specimen",
      value: plants.filter((p) => p.health_status === "sick").length,
      icon: AlertTriangle,
      color: "text-red-700",
      bg: "bg-red-100",
    },
  ];

  const resetAddForm = () => {
    setAddForm({
      species_id: species[0]?.species_id || "",
      section_id: sections[0]?.section_id || "",
      supplier_id: suppliers[0]?.supplier_id || "",
      acquire_date: new Date().toISOString().split("T")[0],
      health_status: "healthy",
    });
  };

  const handleOpenAdd = () => {
    resetAddForm();
    setError("");
    setShowAddModal(true);
  };

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.species_id) {
      setError("Please select a species.");
      return;
    }

    if (!addForm.section_id) {
      setError("Please select a section.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/plants`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          species_id: addForm.species_id,
          section_id: addForm.section_id || null,
          supplier_id: addForm.supplier_id || null,
          acquire_date: addForm.acquire_date,
          health_status: addForm.health_status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create the plant."
        );
      }

      setPlants((current) => [data, ...current]);
      setShowAddModal(false);
      resetAddForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create the plant."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setEditForm({
      species_id: plant.species_id,
      section_id: plant.section_id || "",
      supplier_id: plant.supplier_id || "",
      acquire_date: plant.acquire_date,
      health_status: plant.health_status,
    });
    setError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPlant) {
      return;
    }

    if (!editForm.species_id) {
      setError("Please select a species.");
      return;
    }

    if (!editForm.section_id) {
      setError("Please select a section.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/plants/${editingPlant.plant_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            species_id: editForm.species_id,
            section_id: editForm.section_id || null,
            supplier_id: editForm.supplier_id || null,
            acquire_date: editForm.acquire_date,
            health_status: editForm.health_status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update the plant."
        );
      }

      setPlants((current) =>
        current.map((plant) =>
          plant.plant_id === editingPlant.plant_id
            ? data
            : plant
        )
      );

      setEditingPlant(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update the plant."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlant = async (plantId: string) => {
    if (!confirm("Are you sure you want to remove this plant?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/plants/${plantId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete the plant."
        );
      }

      setPlants((current) =>
        current.filter((plant) => plant.plant_id !== plantId)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete the plant."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Plant Inventory
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage and monitor all botanical specimens across
            your facility sections. Click a plant to view its
            full details.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={
            loading ||
            species.length === 0 ||
            sections.length === 0
          }
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Plant
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>

            <div
              className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}
            >
              <stat.icon
                className={`w-6 h-6 ${stat.color}`}
              />
            </div>
          </div>
        ))}
      </div>

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
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />

            <select
              value={healthFilter}
              onChange={(e) =>
                setHealthFilter(e.target.value)
              }
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200 cursor-pointer"
            >
              <option value="all">
                All Health Statuses
              </option>
              <option value="healthy">Healthy</option>
              <option value="recovering">
                Under Treatment
              </option>
              <option value="sick">Sick</option>
            </select>
          </div>

          <select
            value={sectionFilter}
            onChange={(e) =>
              setSectionFilter(e.target.value)
            }
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200 cursor-pointer"
          >
            <option value="all">All Sections</option>

            {sections.map((section) => (
              <option
                key={section.section_id}
                value={section.section_id}
              >
                {section.section_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            All Registered Botanical Specimens
          </h2>

          <span className="text-xs font-medium text-gray-500">
            {loading ? "Loading..." : `${filtered.length} plants shown`}
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            Loading plant inventory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Leaf className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-600">
              No plants found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Plant ID",
                    "Species",
                    "Section",
                    "Supplier",
                    "Acquired",
                    "Health Status",
                    "Owner",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filtered.map((plant) => {
                  const health =
                    healthConfig[plant.health_status] ||
                    healthConfig.healthy;

                  return (
                    <tr
                      key={plant.plant_id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-5 py-3.5 text-xs font-mono font-medium text-gray-600">
                        <Link
                          href={`/plants/${plant.plant_id}`}
                          className="text-green-700 hover:underline font-bold"
                        >
                          {plant.plant_id}
                        </Link>
                      </td>

                      <td className="px-5 py-3.5">
                        <Link
                          href={`/plants/${plant.plant_id}`}
                          className="flex items-center gap-3 group-hover:opacity-90"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                            <Leaf className="w-4 h-4 text-green-700" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-green-800 transition flex items-center gap-1">
                              {plant.common_name}

                              <ArrowUpRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                            </p>

                            <p className="text-xs text-gray-400 italic">
                              {plant.scientific_name || "—"}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-600">
                        {plant.section_name || "Unassigned"}
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-600 max-w-[140px] truncate">
                        {plant.supplier_name || "No supplier"}
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                        {plant.acquire_date}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${health.dot}`}
                          />

                          <span
                            className={`badge ${health.cls}`}
                          >
                            {health.label}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-600">
                        {plant.owner_name}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleOpenEdit(plant)
                            }
                            title="Edit Plant"
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() =>
                              handleDeletePlant(
                                plant.plant_id
                              )
                            }
                            title="Delete Plant"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
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
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add New Plant
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                  Register a botanical specimen to inventory
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddPlant}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Species
                </label>

                <select
                  value={addForm.species_id}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      species_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select species
                  </option>

                  {species.map((item) => (
                    <option
                      key={item.species_id}
                      value={item.species_id}
                    >
                      {item.common_name}
                      {item.scientific_name
                        ? ` (${item.scientific_name})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Section
                  </label>

                  <select
                    value={addForm.section_id}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        section_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      Select section
                    </option>

                    {sections.map((section) => (
                      <option
                        key={section.section_id}
                        value={section.section_id}
                      >
                        {section.section_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Supplier
                  </label>

                  <select
                    value={addForm.supplier_id}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        supplier_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
                  >
                    <option value="">
                      No supplier
                    </option>

                    {suppliers.map((supplier) => (
                      <option
                        key={supplier.supplier_id}
                        value={supplier.supplier_id}
                      >
                        {supplier.company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Acquire Date
                  </label>

                  <input
                    type="date"
                    value={addForm.acquire_date}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        acquire_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Health Status
                  </label>

                  <select
                    value={addForm.health_status}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        health_status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
                  >
                    <option value="healthy">
                      Healthy
                    </option>
                    <option value="recovering">
                      Under Treatment
                    </option>
                    <option value="sick">
                      Sick
                    </option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Owner
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  {user?.username || "Current user"}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  {saving ? "Adding..." : "Add Plant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingPlant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Plant Details
                </h2>

                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  ID: {editingPlant.plant_id}
                </p>
              </div>

              <button
                onClick={() => setEditingPlant(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Species
                </label>

                <select
                  value={editForm.species_id}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      species_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select species
                  </option>

                  {species.map((item) => (
                    <option
                      key={item.species_id}
                      value={item.species_id}
                    >
                      {item.common_name}
                      {item.scientific_name
                        ? ` (${item.scientific_name})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Section
                  </label>

                  <select
                    value={editForm.section_id}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        section_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      Select section
                    </option>

                    {sections.map((section) => (
                      <option
                        key={section.section_id}
                        value={section.section_id}
                      >
                        {section.section_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Supplier
                  </label>

                  <select
                    value={editForm.supplier_id}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        supplier_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
                  >
                    <option value="">
                      No supplier
                    </option>

                    {suppliers.map((supplier) => (
                      <option
                        key={supplier.supplier_id}
                        value={supplier.supplier_id}
                      >
                        {supplier.company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Acquire Date
                  </label>

                  <input
                    type="date"
                    value={editForm.acquire_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        acquire_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Health Status
                  </label>

                  <select
                    value={editForm.health_status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        health_status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
                  >
                    <option value="healthy">
                      Healthy
                    </option>
                    <option value="recovering">
                      Under Treatment
                    </option>
                    <option value="sick">
                      Sick
                    </option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Owner
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  {editingPlant.owner_name}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlant(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
