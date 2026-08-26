"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  X,
  Wrench,
  Calendar,
  ClipboardCheck,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

type Plant = {
  plant_id: string;
  common_name: string;
};

type MaintenanceLog = {
  log_id: string;
  plant_id: string;
  plant_name: string;
  activity_type: string;
  date: string;
  note: string | null;
};

const activityColors: Record<string, string> = {
  Pruning: "status-healthy",
  Repotting: "status-clear",
  "Pest Check": "status-recovering",
  Cleaning: "bg-purple-100 text-purple-700",
  "Soil Treatment": "status-warning",
  Staking: "bg-gray-100 text-gray-700",
};

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    plant_id: "",
    activity_type: "Pruning",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [maintenanceResponse, plantsResponse] = await Promise.all([
        fetch("http://localhost:8000/api/maintenance", {
          credentials: "include",
        }),
        fetch("http://localhost:8000/api/plants", {
          credentials: "include",
        }),
      ]);

      if (!maintenanceResponse.ok) {
        throw new Error("Failed to load maintenance logs");
      }

      if (!plantsResponse.ok) {
        throw new Error("Failed to load plants");
      }

      const maintenanceData = await maintenanceResponse.json();
      const plantsData = await plantsResponse.json();

      setLogs(maintenanceData);
      setPlants(plantsData);

      if (plantsData.length > 0) {
        setForm((prev) => ({
          ...prev,
          plant_id: prev.plant_id || plantsData[0].plant_id,
        }));
      }
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load maintenance data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.plant_id) {
      alert("Please select a plant.");
      return;
    }

    if (!form.activity_type.trim()) {
      alert("Please enter an activity type.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:8000/api/maintenance",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plant_id: form.plant_id,
            activity_type: form.activity_type.trim(),
            date: form.date,
            note: form.note.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to create maintenance log";

        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch {
        }

        throw new Error(errorMessage);
      }

      await loadData();

      setForm({
        plant_id: plants[0]?.plant_id || "",
        activity_type: "Pruning",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });

      setShowModal(false);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create maintenance log"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this maintenance log?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/maintenance/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to delete maintenance log";

        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch {
        }

        throw new Error(errorMessage);
      }

      setLogs((currentLogs) =>
        currentLogs.filter((log) => log.log_id !== id)
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete maintenance log"
      );
    }
  };

  const filteredLogs = logs.filter((log) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      log.plant_name.toLowerCase().includes(searchValue) ||
      log.plant_id.toLowerCase().includes(searchValue) ||
      log.activity_type.toLowerCase().includes(searchValue) ||
      (log.note ?? "").toLowerCase().includes(searchValue) ||
      log.log_id.toLowerCase().includes(searchValue);

    const matchesActivity =
      activityFilter === "all"
        ? true
        : log.activity_type === activityFilter;

    return matchesSearch && matchesActivity;
  });

  const activityTypes = Array.from(
    new Set(logs.map((log) => log.activity_type))
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Maintenance &amp; Care Logs
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Oversee routine botanical care logs, pruning, repotting, and soil
            upkeep activities.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={plants.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log New Activity
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Logs
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-1">
              {logs.length}
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Plants Maintained
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-1">
              {new Set(logs.map((log) => log.plant_id)).size}
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recent Activity
            </p>

            <p className="text-sm font-bold text-gray-800 mt-1 truncate max-w-[170px]">
              {logs[0]?.activity_type || "None"}
            </p>

            <p className="text-xs text-gray-400">
              {logs[0]?.date || "—"}
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-green-600" />

            <h2 className="text-base font-semibold text-gray-800">
              Activity Log History
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />

              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200 cursor-pointer"
              >
                <option value="all">All Activity Types</option>

                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />

              <input
                type="text"
                placeholder="Search logs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-200 bg-white w-44"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading maintenance logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-10 text-center">
              <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-2" />

              <p className="text-sm font-medium text-gray-500">
                No maintenance logs found.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Log ID",
                    "Date",
                    "Activity Type",
                    "Plant Specimen",
                    "Observations & Notes",
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
                {filteredLogs.map((log) => (
                  <tr
                    key={log.log_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-xs font-mono text-gray-500 font-medium">
                      {log.log_id}
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                      {log.date}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`badge ${
                          activityColors[log.activity_type] ??
                          "status-clear"
                        }`}
                      >
                        {log.activity_type}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-800">
                        {log.plant_name}
                      </p>

                      <p className="text-xs font-mono text-gray-400">
                        {log.plant_id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-600 max-w-[280px] leading-relaxed">
                      {log.note || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDeleteLog(log.log_id)}
                        title="Delete log"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Log New Activity
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                  Record a maintenance or care event for a plant
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleLogActivity}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Plant Specimen
                </label>

                <select
                  value={form.plant_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      plant_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select a plant
                  </option>

                  {plants.map((plant) => (
                    <option
                      key={plant.plant_id}
                      value={plant.plant_id}
                    >
                      {plant.common_name} ({plant.plant_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Activity Type
                </label>

                <input
                  type="text"
                  placeholder="e.g. Pruning, Repotting, Cleaning..."
                  value={form.activity_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      activity_type: e.target.value,
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
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Observations &amp; Note
                </label>

                <textarea
                  rows={3}
                  placeholder="e.g. Trimmed dead leaves from lower canopy and cleaned cuts."
                  value={form.note}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      note: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || plants.length === 0}
                  className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] disabled:bg-gray-400 text-white rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}