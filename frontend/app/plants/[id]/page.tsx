"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Leaf,
  ChevronLeft,
  Calendar,
  Building2,
  Truck,
  User,
  Droplets,
  Sparkles,
  Wrench,
  TrendingUp,
  Bug,
  Pill,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface WateringRecord {
  water_id: string;
  date: string;
  amount: number;
}

interface FertilizerRecord {
  fertilizer_id: string;
  name: string;
  date: string;
  amount: number;
}

interface MaintenanceLog {
  log_id: string;
  activity_type: string;
  date: string;
  note: string | null;
}

interface GrowthRecord {
  growth_id: string;
  date: string;
  height: number;
  growth_stage: string;
  leaf_count: number;
}

interface Treatment {
  treat_id: string;
  disease_id: string;
  medicine: string;
  treat_date: string;
}

interface Disease {
  disease_id: string;
  disease_name: string;
  detect_date: string;
  recovery_status: string;
  heal_date: string | null;
  plant_id: string;
  treatments: Treatment[];
}

interface Plant {
  plant_id: string;
  species_id: string;
  section_id: string | null;
  supplier_id: string | null;
  owner_id: string;
  acquire_date: string;
  health_status: string;

  common_name: string;
  scientific_name: string;
  section_name: string | null;
  supplier_name: string | null;
  owner_name: string;

  waterings: WateringRecord[];
  fertilizer: FertilizerRecord[];
  maintenance_logs: MaintenanceLog[];
  growth_records: GrowthRecord[];
  diseases: Disease[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

type Tab =
  | "all"
  | "care"
  | "growth"
  | "disease"
  | "maintenance";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatChartDate(value: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function normalizeStatus(status: string | null | undefined) {
  return String(status ?? "")
    .trim()
    .toLowerCase();
}


const healthConfig: Record<
  string,
  {
    label: string;
    cls: string;
    dot: string;
  }
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

const recoveryConfig: Record<string, string> = {
  ongoing: "status-sick",
  treating: "status-recovering",
  recovered: "status-healthy",
};

const recoveryLabel: Record<string, string> = {
  ongoing: "Ongoing Active",
  treating: "Under Treatment",
  recovered: "Recovered",
};


export default function PlantDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] =
    useState<Tab>("all");


  useEffect(() => {
    let cancelled = false;

    const fetchPlant = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/plants/${encodeURIComponent(id)}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (cancelled) return;

        if (response.status === 401) {
          setPlant(null);
          setError("You are not authenticated.");
          return;
        }

        if (response.status === 403) {
          setPlant(null);
          setError(
            "You do not have permission to view this plant."
          );
          return;
        }

        if (response.status === 404) {
          setPlant(null);
          setError("Plant not found.");
          return;
        }

        if (!response.ok) {
          const message = await response.text();

          throw new Error(
            message || "Failed to load plant details."
          );
        }

        const data: Plant = await response.json();


        setPlant(data);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to fetch plant:", err);

        setPlant(null);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load plant details."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPlant();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const growthRecords = plant?.growth_records ?? [];
  const waterings = plant?.waterings ?? [];
  const fertilizers = plant?.fertilizer ?? [];
  const maintenanceLogs =
    plant?.maintenance_logs ?? [];
  const diseases = plant?.diseases ?? [];

  const chartData = useMemo(() => {
    return growthRecords.map((growth, index) => ({
      date: formatChartDate(growth.date),
      height: growth.height,
      isLatest: index === growthRecords.length - 1,
    }));
  }, [growthRecords]);

  const latestGrowth = useMemo(() => {
    if (growthRecords.length === 0) {
      return null;
    }

    return growthRecords[growthRecords.length - 1];
  }, [growthRecords]);

  const latestHeight = latestGrowth?.height ?? null;
  const latestLeafCount =
    latestGrowth?.leaf_count ?? null;
  const latestStage =
    latestGrowth?.growth_stage ?? null;

  const healthStatus = normalizeStatus(
    plant?.health_status
  );

  const healthInfo = plant
    ? healthConfig[healthStatus]
    : null;


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#1B3B2C]" />

            <p className="text-sm text-gray-500">
              Loading plant details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  if (error || !plant) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Link
            href="/plants"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-[#1B3B2C]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Plant Inventory
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Leaf className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            Plant Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "The requested plant could not be found."}
          </p>

          <Link
            href="/plants"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1B3B2C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153024]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Plant Inventory
          </Link>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link
          href="/plants"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-[#1B3B2C]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Plant Inventory
        </Link>
      </div>

      <div className="mb-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-md">
              <Leaf className="h-10 w-10 text-white" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {plant.common_name || "Unnamed Plant"}
                </h1>

                <span className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700">
                  {plant.plant_id}
                </span>

                {healthInfo ? (
                  <span
                    className={`badge ${healthInfo.cls} flex items-center gap-1.5`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${healthInfo.dot}`}
                    />

                    {healthInfo.label}
                  </span>
                ) : plant.health_status ? (
                  <span className="badge flex items-center gap-1.5 bg-gray-100 text-gray-700">
                    {plant.health_status}
                  </span>
                ) : null}
              </div>

              {plant.scientific_name && (
                <p className="mt-1 text-sm italic text-gray-500">
                  {plant.scientific_name}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                {plant.section_name && (
                  <>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />

                      <strong className="font-semibold text-gray-800">
                        {plant.section_name}
                      </strong>

                      {plant.section_id && (
                        <span>
                          ({plant.section_id})
                        </span>
                      )}
                    </span>

                    <span className="text-gray-300">
                      |
                    </span>
                  </>
                )}

                {plant.supplier_name && (
                  <>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-gray-400" />

                      Supplier:

                      <strong className="font-semibold text-gray-800">
                        {plant.supplier_name}
                      </strong>
                    </span>

                    <span className="text-gray-300">
                      |
                    </span>
                  </>
                )}

                {plant.acquire_date && (
                  <>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />

                      Acquired:

                      <strong className="font-semibold text-gray-800">
                        {formatDate(
                          plant.acquire_date
                        )}
                      </strong>
                    </span>

                    {plant.owner_name && (
                      <span className="text-gray-300">
                        |
                      </span>
                    )}
                  </>
                )}

                {plant.owner_name && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-gray-400" />

                    Botanist:

                    <strong className="font-semibold text-gray-800">
                      {plant.owner_name}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>


        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4">
          <div className="rounded-xl bg-gray-50/80 p-3.5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Watering Logs
            </p>

            <p className="mt-1 text-xl font-bold text-blue-600">
              {waterings.length}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50/80 p-3.5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Fertilization
            </p>

            <p className="mt-1 text-xl font-bold text-emerald-600">
              {fertilizers.length}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50/80 p-3.5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Current Height
            </p>

            <p className="mt-1 text-xl font-bold text-gray-800">
              {latestHeight !== null
                ? `${latestHeight} cm`
                : "—"}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50/80 p-3.5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Pathology Records
            </p>

            <p
              className={`mt-1 text-xl font-bold ${
                diseases.length > 0
                  ? "text-amber-600"
                  : "text-green-600"
              }`}
            >
              {diseases.length}
            </p>
          </div>
        </div>
      </div>


      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200">
        {[
          {
            key: "all" as const,
            label: "Overview & All Logs",
          },
          {
            key: "care" as const,
            label: `Care & Watering (${
              waterings.length + fertilizers.length
            })`,
          },
          {
            key: "growth" as const,
            label: `Growth Progression (${growthRecords.length})`,
          },
          {
            key: "maintenance" as const,
            label: `Maintenance (${maintenanceLogs.length})`,
          },
          {
            key: "disease" as const,
            label: `Pathology & Treatments (${diseases.length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() =>
              setActiveTab(tab.key)
            }
            className={`-mb-px whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border-[#1B3B2C] text-[#1B3B2C]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">

        {(activeTab === "all" ||
          activeTab === "growth") && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />

                <h2 className="text-lg font-bold text-gray-900">
                  Growth &amp; Height Progression
                </h2>
              </div>

              {latestGrowth && (
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {latestStage
                    ? `Current Stage: ${latestStage}`
                    : "Latest Growth Record"}
                  {latestLeafCount !== null &&
                    ` · ${latestLeafCount} leaves`}
                </span>
              )}
            </div>

            {chartData.length > 0 ? (
              <div className="mb-6">
                <ResponsiveContainer
                  width="100%"
                  height={200}
                >
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 10,
                      bottom: 0,
                      left: -20,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                        fill: "#9ca3af",
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "#9ca3af",
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#1B3B2C",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12,
                        color: "#fff",
                      }}
                      formatter={(value) => [`${value ?? 0} cm`, "Height"]}
                    />


                    <Bar
                      dataKey="height"
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map(
                        (entry, index) => (
                          <Cell
                            key={`${entry.date}-${index}`}
                            fill={
                              entry.isLatest
                                ? "#1B3B2C"
                                : "#86efac"
                            }
                          />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mb-4 text-sm italic text-gray-400">
                No growth records available.
              </p>
            )}

            {growthRecords.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {[
                        "Log Date",
                        "Height (cm)",
                        "Growth Stage",
                        "Leaf Count",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {growthRecords.map(
                      (growth) => (
                        <tr
                          key={growth.growth_id}
                          className="transition-colors hover:bg-gray-50/80"
                        >
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {formatDate(
                              growth.date
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm font-bold text-gray-800">
                            {growth.height} cm
                          </td>

                          <td className="px-4 py-3 text-xs font-semibold text-gray-700">
                            {growth.growth_stage ||
                              "—"}
                          </td>

                          <td className="px-4 py-3 text-xs font-medium text-gray-700">
                            {growth.leaf_count}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {(activeTab === "all" ||
          activeTab === "care") && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Watering */}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />

                <h2 className="text-lg font-bold text-gray-900">
                  Watering Logs
                </h2>
              </div>

              {waterings.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {[
                          "Date",
                          "Amount (ml)",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {waterings.map(
                        (watering) => (
                          <tr
                            key={
                              watering.water_id
                            }
                            className="hover:bg-gray-50/80"
                          >
                            <td className="px-4 py-3 text-xs text-gray-600">
                              {formatDate(
                                watering.date
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm font-bold text-blue-600">
                              {watering.amount} ml
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">
                  No watering records available.
                </p>
              )}
            </div>

            {/* Fertilization */}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />

                <h2 className="text-lg font-bold text-gray-900">
                  Fertilization Logs
                </h2>
              </div>

              {fertilizers.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {[
                          "Date",
                          "Fertilizer Formula",
                          "Amount (ml)",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {fertilizers.map(
                        (fertilizer) => (
                          <tr
                            key={
                              fertilizer.fertilizer_id
                            }
                            className="hover:bg-gray-50/80"
                          >
                            <td className="px-4 py-3 text-xs text-gray-600">
                              {formatDate(
                                fertilizer.date
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                              {fertilizer.name ||
                                "—"}
                            </td>

                            <td className="px-4 py-3 text-sm font-bold text-emerald-700">
                              {fertilizer.amount} ml
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">
                  No fertilizer records available.
                </p>
              )}
            </div>
          </div>
        )}

        {(activeTab === "all" ||
          activeTab === "maintenance") && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-600" />

              <h2 className="text-lg font-bold text-gray-900">
                Maintenance &amp; Husbandry Logs
              </h2>
            </div>

            {maintenanceLogs.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {[
                        "Date",
                        "Activity Type",
                        "Observations & Notes",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {maintenanceLogs.map(
                      (maintenance) => (
                        <tr
                          key={
                            maintenance.log_id
                          }
                          className="hover:bg-gray-50/80"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">
                            {formatDate(
                              maintenance.date
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {maintenance.activity_type ? (
                              <span className="badge bg-purple-50 font-semibold text-purple-700">
                                {
                                  maintenance.activity_type
                                }
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm text-gray-700">
                            {maintenance.note ||
                              "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm italic text-gray-400">
                No maintenance records available.
              </p>
            )}
          </div>
        )}


        {(activeTab === "all" ||
          activeTab === "disease") && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />

              <h2 className="text-lg font-bold text-gray-900">
                Pathology, Diseases &amp; Treatment
                History
              </h2>
            </div>

            {diseases.length > 0 ? (
              <div className="space-y-4">
                {diseases.map((disease) => {
                  const status =
                    normalizeStatus(
                      disease.recovery_status
                    );

                  const statusClass =
                    recoveryConfig[status];

                  const statusText =
                    recoveryLabel[status] ||
                    disease.recovery_status ||
                    null;

                  return (
                    <div
                      key={disease.disease_id}
                      className="rounded-xl border border-gray-200 bg-gray-50/50 p-5"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-base font-bold text-gray-900">
                              {disease.disease_name ||
                                "Unnamed Disease"}
                            </h3>

                            <span className="font-mono text-xs text-gray-400">
                              ({disease.disease_id})
                            </span>

                            {statusText && (
                              <span
                                className={`badge ${
                                  statusClass ||
                                  "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {statusText}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-gray-500">
                            Detected on:{" "}
                            <strong className="text-gray-700">
                              {formatDate(
                                disease.detect_date
                              )}
                            </strong>

                            {disease.heal_date && (
                              <>
                                {" "}
                                · Healed on:{" "}
                                <strong className="text-emerald-700">
                                  {formatDate(
                                    disease.heal_date
                                  )}
                                </strong>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700">
                          <Pill className="h-3.5 w-3.5 text-emerald-600" />

                          Applied Treatments (
                          {disease.treatments?.length ??
                            0}
                          )
                        </p>

                        {disease.treatments &&
                        disease.treatments.length > 0 ? (
                          <div className="space-y-2">
                            {disease.treatments.map(
                              (treatment) => (
                                <div
                                  key={
                                    treatment.treat_id
                                  }
                                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-xs"
                                >
                                  <div>
                                    <span className="font-semibold text-gray-800">
                                      {treatment.medicine ||
                                        "—"}
                                    </span>
                                  </div>

                                  <span className="rounded border border-gray-100 bg-gray-50 px-2 py-0.5 font-mono text-gray-500">
                                    {formatDate(
                                      treatment.treat_date
                                    )}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-gray-400">
                            No treatment records available.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-600">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-gray-400" />

                <p className="text-sm font-medium">
                  No disease records available for
                  this plant.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
