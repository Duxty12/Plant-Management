"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Leaf,
  Heart,
  Thermometer,
  Droplets,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface WateringRecord {
  water_id: string;
  plant_id: string;
  date: string;
  amount: number;
}

interface DashboardData {
  total_plants: number;
  sick_plants: number;
  recent_waterings: WateringRecord[];
}

interface PlantData {
  plant_id: string;
  common_name: string;
  scientific_name: string;
  section_name: string | null;
}

interface RecentActivity {
  water_id: string;
  date: string;
  plant_id: string;
  plant_name: string;
  scientific_name: string;
  amount: number;
  section_name: string | null;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/dashboard/overview`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          throw new Error("You are not authenticated.");
        }

        if (!response.ok) {
          throw new Error(
            `Failed to load dashboard data. Status: ${response.status}`
          );
        }

        const data: DashboardData = await response.json();

        if (!mounted) {
          return;
        }

        setDashboard({
          total_plants: Number(data.total_plants || 0),
          sick_plants: Number(data.sick_plants || 0),
          recent_waterings: data.recent_waterings || [],
        });
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!dashboard || dashboard.recent_waterings.length === 0) {
      setRecentActivities([]);
      return;
    }

    let mounted = true;

    const fetchPlantDetails = async () => {
      try {
        const uniquePlantIds = Array.from(
          new Set(
            dashboard.recent_waterings.map((watering) => watering.plant_id)
          )
        );

        const results = await Promise.all(
          uniquePlantIds.map(async (plantId) => {
            const response = await fetch(
              `${API_URL}/plants/${encodeURIComponent(plantId)}`,
              {
                method: "GET",
                credentials: "include",
                headers: {
                  Accept: "application/json",
                },
                cache: "no-store",
              }
            );

            if (!response.ok) {
              return null;
            }

            const plant: PlantData = await response.json();
            return plant;
          })
        );

        if (!mounted) {
          return;
        }

        const plantMap = new Map<string, PlantData>();

        results.forEach((plant) => {
          if (plant) {
            plantMap.set(plant.plant_id, plant);
          }
        });

        const activities: RecentActivity[] = dashboard.recent_waterings.map(
          (watering) => {
            const plant = plantMap.get(watering.plant_id);

            return {
              water_id: watering.water_id,
              date: watering.date,
              plant_id: watering.plant_id,
              plant_name: plant?.common_name || watering.plant_id,
              scientific_name: plant?.scientific_name || "",
              amount: Number(watering.amount || 0),
              section_name: plant?.section_name || null,
            };
          }
        );

        setRecentActivities(activities);
      } catch (err) {
        console.error("Failed to fetch plant details:", err);

        if (mounted) {
          setRecentActivities(
            dashboard.recent_waterings.map((watering) => ({
              water_id: watering.water_id,
              date: watering.date,
              plant_id: watering.plant_id,
              plant_name: watering.plant_id,
              scientific_name: "",
              amount: Number(watering.amount || 0),
              section_name: null,
            }))
          );
        }
      }
    };

    fetchPlantDetails();

    return () => {
      mounted = false;
    };
  }, [dashboard]);

  const healthyPlants = useMemo(() => {
    if (!dashboard) {
      return 0;
    }

    return Math.max(dashboard.total_plants - dashboard.sick_plants, 0);
  }, [dashboard]);

  const healthyPercentage = useMemo(() => {
    if (!dashboard || dashboard.total_plants === 0) {
      return 0;
    }

    return Math.round((healthyPlants / dashboard.total_plants) * 100);
  }, [dashboard, healthyPlants]);

  const sickPercentage = useMemo(() => {
    if (!dashboard || dashboard.total_plants === 0) {
      return 0;
    }

    return Math.round((dashboard.sick_plants / dashboard.total_plants) * 100);
  }, [dashboard]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#1B3B2C]" />
            <p className="text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Unable to Load Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {error || "Dashboard data is unavailable."}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-[#1B3B2C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153024]"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Real-time metrics and environmental status for your plants.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Plants
            </p>

            <p className="mt-1 text-3xl font-bold text-green-600">
              {dashboard.total_plants}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Plants Requiring Attention
            </p>

            <p className="mt-1 text-3xl font-bold text-red-600">
              {dashboard.sick_plants}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />

            <h2 className="text-base font-semibold text-gray-800">
              Health Overview
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Healthy
                </span>

                <span className="text-sm font-bold text-emerald-700">
                  {healthyPercentage}%
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{
                    width: `${healthyPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Requiring Attention
                </span>

                <span className="text-sm font-bold text-red-700">
                  {sickPercentage}%
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-red-500 transition-all duration-700"
                  style={{
                    width: `${sickPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />

              <span className="text-gray-600">
                {healthyPlants} healthy plants
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-red-500" />

              <span className="text-gray-600">
                {dashboard.sick_plants} requiring attention
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />

              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Recent Watering
                </h2>

                <p className="text-xs text-gray-400">
                  Latest watering records
                </p>
              </div>
            </div>

            <Link
              href="/activity"
              className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800"
            >
              View All
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {dashboard.recent_waterings.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.water_id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <Droplets className="h-4 w-4 text-blue-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {activity.plant_name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {activity.amount} ml
                      {activity.section_name
                        ? ` · ${activity.section_name}`
                        : ""}
                    </p>
                  </div>

                  <span className="whitespace-nowrap rounded-md bg-white px-2 py-1 font-mono text-xs text-gray-500">
                    {activity.date}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Droplets className="mx-auto mb-3 h-8 w-8 text-gray-300" />

              <p className="text-sm italic text-gray-400">
                No watering records found.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Recent Plant Activities
            </h2>

            <p className="mt-0.5 text-xs text-gray-400">
              Latest watering activity from your plants
            </p>
          </div>

          <Link
            href="/activity"
            className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800"
          >
            View All Logs
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentActivities.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    "Date",
                    "Plant",
                    "Plant ID",
                    "Action",
                    "Amount",
                    "Section",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentActivities.map((activity) => (
                  <tr
                    key={activity.water_id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs font-medium text-gray-500">
                      {activity.date}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-800">
                        {activity.plant_name}
                      </p>

                      {activity.scientific_name && (
                        <p className="text-xs italic text-gray-500">
                          {activity.scientific_name}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-500">
                        {activity.plant_id}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-blue-700">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        Watering
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-sm font-bold text-blue-600">
                      {activity.amount} ml
                    </td>

                    <td className="px-5 py-3.5 text-xs text-gray-600">
                      {activity.section_name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-sm italic text-gray-400">
              No recent plant activities found.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
