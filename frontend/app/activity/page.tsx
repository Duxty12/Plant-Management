"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Droplets,
  TrendingUp,
  Bug,
  Wrench,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const filterTypes = [
  "All Events",
  "Watering",
  "Fertilization",
  "Disease",
  "Growth",
  "Maintenance",
] as const;

type FilterType = (typeof filterTypes)[number];

type EventType =
  | "watering"
  | "fertilization"
  | "growth"
  | "disease"
  | "maintenance";

const typeConfig: Record<
  EventType,
  {
    icon: typeof Droplets;
    color: string;
    bg: string;
  }
> = {
  watering: {
    icon: Droplets,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  fertilization: {
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  growth: {
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  disease: {
    icon: Bug,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  maintenance: {
    icon: Wrench,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
};

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

interface TimelineEvent {
  id: string;
  type: EventType;
  date: string;
  title: string;
  details: string;
}

export default function ActivityPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All Events");
  const [search, setSearch] = useState("");
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [loadingPlant, setLoadingPlant] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoadingPlants(true);
        setError("");

        const response = await fetch(`${API_URL}/plants`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          setError("You are not authenticated.");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load plants.");
        }

        const data = await response.json();

        const plantList: Plant[] = Array.isArray(data)
          ? data
          : Array.isArray(data.plants)
          ? data.plants
          : [];

        setPlants(plantList);

        if (plantList.length > 0) {
          setSelectedPlant(plantList[0].plant_id);
        }
      } catch (err) {
        console.error("Failed to fetch plants:", err);

        setError(
          err instanceof Error ? err.message : "Failed to load plants."
        );
      } finally {
        setLoadingPlants(false);
      }
    };

    fetchPlants();
  }, []);

  useEffect(() => {
    if (!selectedPlant) return;

    const fetchPlantDetails = async () => {
      try {
        setLoadingPlant(true);
        setError("");

        const response = await fetch(
          `${API_URL}/plants/${encodeURIComponent(selectedPlant)}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          setError("You are not authenticated.");
          return;
        }

        if (response.status === 404) {
          setError("Plant not found.");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load plant activity.");
        }

        const data: Plant = await response.json();

        setPlants((currentPlants) =>
          currentPlants.map((plant) =>
            plant.plant_id === data.plant_id ? data : plant
          )
        );
      } catch (err) {
        console.error("Failed to fetch plant activity:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load plant activity."
        );
      } finally {
        setLoadingPlant(false);
      }
    };

    fetchPlantDetails();
  }, [selectedPlant]);

  const plant = useMemo(
    () => plants.find((item) => item.plant_id === selectedPlant) ?? null,
    [plants, selectedPlant]
  );

  const events = useMemo<TimelineEvent[]>(() => {
    if (!plant) return [];

    const timeline: TimelineEvent[] = [];

    plant.waterings?.forEach((watering) => {
      timeline.push({
        id: `watering-${watering.water_id}`,
        type: "watering",
        date: watering.date,
        title: "Watering",
        details: `${watering.amount} ml`,
      });
    });

    plant.fertilizer?.forEach((fertilizer) => {
      timeline.push({
        id: `fertilization-${fertilizer.fertilizer_id}`,
        type: "fertilization",
        date: fertilizer.date,
        title: "Fertilization",
        details: `${fertilizer.name} · ${fertilizer.amount} ml`,
      });
    });

    plant.growth_records?.forEach((growth) => {
      timeline.push({
        id: `growth-${growth.growth_id}`,
        type: "growth",
        date: growth.date,
        title: "Growth Log",
        details: `${growth.height} cm (${growth.growth_stage}, ${growth.leaf_count} leaves)`,
      });
    });

    plant.maintenance_logs?.forEach((maintenance) => {
      timeline.push({
        id: `maintenance-${maintenance.log_id}`,
        type: "maintenance",
        date: maintenance.date,
        title: `Maintenance: ${maintenance.activity_type}`,
        details: maintenance.note || "No notes recorded",
      });
    });

    plant.diseases?.forEach((disease) => {
      const recoveryStatus = disease.recovery_status?.toLowerCase();

      let details = `Status: ${disease.recovery_status}`;

      if (recoveryStatus === "recovered" && disease.heal_date) {
        details = `Recovered on ${disease.heal_date}`;
      }

      timeline.push({
        id: `disease-${disease.disease_id}`,
        type: "disease",
        date: disease.detect_date,
        title: `Disease: ${disease.disease_name}`,
        details,
      });
    });

    return timeline.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [plant]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchType =
        activeFilter === "All Events" ||
        event.type === activeFilter.toLowerCase();

      if (!normalizedSearch) {
        return matchType;
      }

      const matchSearch =
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.details.toLowerCase().includes(normalizedSearch) ||
        event.date.toLowerCase().includes(normalizedSearch);

      return matchType && matchSearch;
    });
  }, [events, activeFilter, search]);

  if (loadingPlants) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#1B3B2C]" />
            <p className="text-sm text-gray-500">Loading plants...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && plants.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (plants.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              No Plants Found
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              There are no plants available for your account.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Plant Activity Timeline
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Chronological log of plant events and care history.
          </p>
        </div>

        <div className="relative">
          <select
            value={selectedPlant}
            onChange={(e) => {
              setSelectedPlant(e.target.value);
              setActiveFilter("All Events");
              setSearch("");
            }}
            className="min-w-[260px] cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            {plants.map((item) => (
              <option key={item.plant_id} value={item.plant_id}>
                {item.common_name} · {item.plant_id}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {plant && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-base font-bold text-white shadow-sm">
              {plant.common_name?.charAt(0).toUpperCase() || "P"}
            </div>

            <div>
              <p className="text-base font-bold text-gray-900">
                {plant.common_name}
              </p>

              <p className="mt-0.5 font-mono text-xs text-gray-400">
                {plant.plant_id}
                {plant.section_name ? ` · ${plant.section_name}` : ""}
              </p>
            </div>
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Search timeline events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filterTypes.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeFilter === filter
                ? "bg-[#1B3B2C] text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loadingPlant ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1B3B2C]" />
              <p className="text-sm text-gray-500">Loading activity...</p>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((event) => {
              const config = typeConfig[event.type];
              const Icon = config.icon;

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80"
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">
                        {event.title}:
                      </span>

                      <span className="text-sm font-medium text-gray-700">
                        {event.details}
                      </span>
                    </div>

                    <span className="self-start whitespace-nowrap rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-500 sm:self-auto">
                      {event.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-sm italic text-gray-400">
            No timeline logs found for this filter.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
