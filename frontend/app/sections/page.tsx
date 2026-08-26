"use client";

import { useEffect, useState } from "react";
import {
  Thermometer,
  Droplets,
  Sun,
  Plus,
  X,
  Building2,
  Search,
  Filter,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/components/DashboardLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SectionItem {
  section_id: string;
  section_name: string;
  user_id?: string;
  temperature?: number | null;
  humidity?: number | null;
  light_level?: number | null;
  plant_count: number;
}

const sectionSchema = z.object({
  section_name: z
    .string()
    .trim()
    .min(2, "Section name must be at least 2 characters")
    .max(100, "Section name cannot exceed 100 characters"),
});

type SectionFormData = z.infer<typeof sectionSchema>;

export default function SectionsPage() {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [search, setSearch] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] =
    useState<SectionItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      section_name: "",
    },
  });

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/sections`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("You are not authenticated.");
        }

        throw new Error("Failed to load sections.");
      }

      const data = await response.json();
      setSections(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to load sections."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const openCreateModal = () => {
    setEditingSection(null);
    reset({
      section_name: "",
    });
    setShowModal(true);
  };

  const openEditModal = (section: SectionItem) => {
    setEditingSection(section);
    reset({
      section_name: section.section_name,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingSection(null);
    reset({
      section_name: "",
    });
  };

  const onSubmit = async (data: SectionFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const isEditing = Boolean(editingSection);
      const url = isEditing
        ? `${API_URL}/api/sections/${editingSection?.section_id}`
        : `${API_URL}/api/sections`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          section_name: data.section_name,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
            `Failed to ${isEditing ? "update" : "create"} section.`
        );
      }

      closeModal();
      await fetchSections();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (section: SectionItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${section.section_name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(section.section_id);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/sections/${section.section_id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData?.detail || "Failed to delete section."
        );
      }

      setSections((current) =>
        current.filter((s) => s.section_id !== section.section_id)
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to delete section."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSections = sections.filter((sec) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      sec.section_name.toLowerCase().includes(searchTerm) ||
      sec.section_id.toLowerCase().includes(searchTerm);

    let matchesOccupancy = true;

    if (occupancyFilter === "active") {
      matchesOccupancy = sec.plant_count > 0;
    }

    if (occupancyFilter === "empty") {
      matchesOccupancy = sec.plant_count === 0;
    }

    if (occupancyFilter === "high") {
      matchesOccupancy = sec.plant_count >= 8;
    }

    return matchesSearch && matchesOccupancy;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Section Management
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Manage your greenhouse sections and their environmental readings.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>

          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200 cursor-pointer"
          >
            <option value="all">
              All Sections ({sections.length})
            </option>

            <option value="active">
              With Plants (
              {sections.filter((s) => s.plant_count > 0).length})
            </option>

            <option value="high">
              High Density (&gt;=8 plants)
            </option>

            <option value="empty">
              Empty Zones (
              {sections.filter((s) => s.plant_count === 0).length})
            </option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 text-green-700 animate-spin" />

            <p className="text-sm text-gray-500">
              Loading your sections...
            </p>
          </div>
        </div>
      ) : (
        <>
          {!filteredSections.length ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-green-600" />
                </div>

                <h3 className="text-lg font-bold text-gray-800">
                  {sections.length === 0
                    ? "No sections yet"
                    : "No sections found"}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {sections.length === 0
                    ? "Create your first greenhouse section."
                    : "Try changing your search or filter."}
                </p>

                {sections.length === 0 && (
                  <button
                    onClick={openCreateModal}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSections.map((sec) => (
                <div
                  key={sec.section_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div className="px-5 py-4 flex items-start justify-between border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                        <Building2 className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="text-xs font-mono text-gray-400 mb-0.5">
                          {sec.section_id}
                        </p>

                        <h3 className="text-base font-bold text-gray-900">
                          {sec.section_name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(sec)}
                        title="Edit Section"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(sec)}
                        disabled={deletingId === sec.section_id}
                        title="Delete Section"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition disabled:opacity-50 cursor-pointer"
                      >
                        {deletingId === sec.section_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-0.5">
                      Active Plants
                    </p>

                    <p className="text-4xl font-bold text-[#1B3B2C]">
                      {sec.plant_count}
                    </p>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      Latest Environmental Readings
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg p-2.5 text-center bg-gray-50">
                        <Thermometer className="w-4 h-4 mx-auto mb-1 text-orange-500" />

                        <p className="text-sm font-bold text-gray-800">
                          {sec.temperature !== null &&
                          sec.temperature !== undefined
                            ? `${sec.temperature}°C`
                            : "—"}
                        </p>

                        <p className="text-xs text-gray-400">
                          Temp
                        </p>
                      </div>

                      <div className="rounded-lg p-2.5 text-center bg-gray-50">
                        <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />

                        <p className="text-sm font-bold text-gray-800">
                          {sec.humidity !== null &&
                          sec.humidity !== undefined
                            ? `${sec.humidity}%`
                            : "—"}
                        </p>

                        <p className="text-xs text-gray-400">
                          Humidity
                        </p>
                      </div>

                      <div className="rounded-lg p-2.5 text-center bg-gray-50">
                        <Sun className="w-4 h-4 mx-auto mb-1 text-yellow-500" />

                        <p className="text-sm font-bold text-gray-800">
                          {sec.light_level !== null &&
                          sec.light_level !== undefined
                            ? sec.light_level
                            : "—"}
                        </p>

                        <p className="text-xs text-gray-400">
                          lux
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={openCreateModal}
                className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 flex flex-col items-center justify-center gap-3 py-12 transition-all duration-200 hover:bg-green-50/30 group min-h-[220px] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition" />
                </div>

                <div className="text-center">
                  <p className="text-sm font-bold text-gray-700 group-hover:text-green-700 transition">
                    Register New Section
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">
                    Add a greenhouse zone
                  </p>
                </div>
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingSection ? "Edit Section" : "Register New Section"}
                </h2>

                <p className="text-xs text-gray-400 mt-0.5">
                  {editingSection
                    ? `ID: ${editingSection.section_id}`
                    : "Create a greenhouse section"}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Section Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Highland Orchids Section"
                  {...register("section_name")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    errors.section_name
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                  disabled={submitting}
                />

                {errors.section_name && (
                  <p className="text-xs text-red-600 mt-1.5">
                    {errors.section_name.message}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {editingSection ? "Save Changes" : "Register Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
