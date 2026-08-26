"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, Search, Globe, X } from "lucide-react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const API_URL = "http://localhost:8000/api";

interface SpeciesItem {
  species_id: string;
  common_name: string;
  scientific_name?: string | null;
  origin_country?: string | null;
  plant_count: number;
  is_user_owned?: boolean;
}

const speciesSchema = z.object({
  common_name: z
    .string()
    .min(1, "Common name is required")
    .max(255, "Common name is too long"),

  scientific_name: z
    .string()
    .max(255, "Scientific name is too long")
    .optional(),

  origin_country: z
    .string()
    .max(255, "Origin country is too long")
    .optional(),
});

type SpeciesFormValues = z.infer<typeof speciesSchema>;

export default function SpeciesPage() {
  const [speciesList, setSpeciesList] = useState<SpeciesItem[]>([]);
  const [filter, setFilter] = useState("");
  const [showAll, setShowAll] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSpecies, setEditingSpecies] =
    useState<SpeciesItem | null>(null);

  const addForm = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      common_name: "",
      scientific_name: "",
      origin_country: "",
    },
  });

  const editForm = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      common_name: "",
      scientific_name: "",
      origin_country: "",
    },
  });


  async function fetchSpecies() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/species`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load species");
      }

      const data = await response.json();

      setSpeciesList(data);
    } catch (err) {
      console.error("Error fetching species:", err);
      setError("Unable to load species. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSpecies();
  }, []);

  async function handleAddSpecies(values: SpeciesFormValues) {
    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_URL}/species`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          common_name: values.common_name,
          scientific_name: values.scientific_name || null,
          origin_country: values.origin_country || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create species"
        );
      }


      setShowAddModal(false);


      addForm.reset();


      await fetchSpecies();
    } catch (err) {
      console.error("Error creating species:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create species"
      );
    } finally {
      setSubmitting(false);
    }
  }


  function handleOpenEdit(species: SpeciesItem) {
    setEditingSpecies(species);

    editForm.reset({
      common_name: species.common_name,
      scientific_name: species.scientific_name || "",
      origin_country: species.origin_country || "",
    });
  }

  async function handleSaveEdit(values: SpeciesFormValues) {
    if (!editingSpecies) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/species/${editingSpecies.species_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            common_name: values.common_name,
            scientific_name: values.scientific_name || null,
            origin_country: values.origin_country || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update species"
        );
      }

      setEditingSpecies(null);

      await fetchSpecies();
    } catch (err) {
      console.error("Error updating species:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update species"
      );
    } finally {
      setSubmitting(false);
    }
  }


  async function handleDelete(speciesId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this species classification?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/species/${speciesId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete species"
        );
      }

      setSpeciesList((current) =>
        current.filter(
          (species) => species.species_id !== speciesId
        )
      );
    } catch (err) {
      console.error("Error deleting species:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete species"
      );
    }
  }


  const displayedList = speciesList.filter((species) => {
    const matchesShowAll = showAll
      ? true
      : species.plant_count > 0;

    const search = filter.toLowerCase();

    const matchesSearch =
      species.common_name
        .toLowerCase()
        .includes(search) ||
      (species.scientific_name ?? "")
        .toLowerCase()
        .includes(search) ||
      (species.origin_country ?? "")
        .toLowerCase()
        .includes(search);

    return matchesShowAll && matchesSearch;
  });


  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Species Management
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Browse, filter, and manage registered botanical
            species classifications.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Show All Toggle */}
          <button
            onClick={() => setShowAll(!showAll)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition ${
              showAll
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Globe className="w-4 h-4 text-green-600" />

            {showAll
              ? "Showing All Available Species"
              : "Show All Species (Catalog)"}

            {showAll && (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
          </button>

          {/* Add */}
          <button
            onClick={() => {
              addForm.reset();
              setShowAddModal(true);
              setError("");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Species
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

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
          {displayedList.length} species{" "}
          {showAll ? "in catalog" : "in user inventory"}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Species ID",
                  "Common Name",
                  "Scientific Name",
                  "Origin Country",
                  "No. of Plants",
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
              {/* Loading */}
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading species...
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && displayedList.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No species found.
                  </td>
                </tr>
              )}

              {/* Data */}
              {!loading &&
                displayedList.map((species) => (
                  <tr
                    key={species.species_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-xs font-mono font-medium text-gray-500">
                      {species.species_id}
                    </td>

                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">
                      {species.common_name}

                      {species.plant_count === 0 && (
                        <span className="ml-2 text-[10px] uppercase font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          Catalog Only
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-sm text-gray-500 italic">
                      {species.scientific_name || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      {species.origin_country || "Unknown"}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full text-xs font-bold ${
                          species.plant_count > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {species.plant_count} plants
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      {species.is_user_owned ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(species)}
                            title="Edit Species"
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(species.species_id)}
                            title="Delete Species"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Catalog
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================
          ADD SPECIES MODAL
          ================================================== */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add New Species
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                  Register botanical classification to system
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  addForm.reset();
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={addForm.handleSubmit(
                handleAddSpecies
              )}
              className="p-6 space-y-4"
            >
              {/* Common Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Common Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Philodendron Pink Princess"
                  {...addForm.register("common_name")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    addForm.formState.errors.common_name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {addForm.formState.errors.common_name && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      addForm.formState.errors.common_name
                        .message
                    }
                  </p>
                )}
              </div>

              {/* Scientific Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Scientific Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Philodendron erubescens"
                  {...addForm.register("scientific_name")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    addForm.formState.errors
                      .scientific_name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {addForm.formState.errors
                  .scientific_name && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      addForm.formState.errors
                        .scientific_name.message
                    }
                  </p>
                )}
              </div>

              {/* Origin */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Origin Country
                </label>

                <input
                  type="text"
                  placeholder="e.g. Colombia"
                  {...addForm.register("origin_country")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    addForm.formState.errors
                      .origin_country
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {addForm.formState.errors.origin_country && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      addForm.formState.errors.origin_country
                        .message
                    }
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    addForm.reset();
                  }}
                  disabled={submitting}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Saving..."
                    : "Save Species"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT SPECIES MODAL
          ================================================== */}

      {editingSpecies && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Species Details
                </h2>

                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  ID: {editingSpecies.species_id}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingSpecies(null);
                  editForm.reset();
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={editForm.handleSubmit(
                handleSaveEdit
              )}
              className="p-6 space-y-4"
            >
              {/* Common Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Common Name
                </label>

                <input
                  type="text"
                  {...editForm.register("common_name")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    editForm.formState.errors.common_name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {editForm.formState.errors.common_name && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      editForm.formState.errors.common_name
                        .message
                    }
                  </p>
                )}
              </div>

              {/* Scientific Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Scientific Name
                </label>

                <input
                  type="text"
                  {...editForm.register("scientific_name")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    editForm.formState.errors
                      .scientific_name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {editForm.formState.errors
                  .scientific_name && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      editForm.formState.errors
                        .scientific_name.message
                    }
                  </p>
                )}
              </div>

              {/* Origin */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Origin Country
                </label>

                <input
                  type="text"
                  {...editForm.register("origin_country")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    editForm.formState.errors
                      .origin_country
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {editForm.formState.errors.origin_country && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      editForm.formState.errors.origin_country
                        .message
                    }
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSpecies(null);
                    editForm.reset();
                  }}
                  disabled={submitting}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
