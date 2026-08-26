"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Thermometer,
  Droplets,
  Sun,
  Filter,
  ArrowUpDown,
  Search,
  Loader2,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Section {
  section_id: string;
  section_name: string;
  temperature?: number | null;
  humidity?: number | null;
  light_level?: number | null;
  plant_count: number;
}

interface EnvironmentRecord {
  env_id: string;
  section_id: string;
  section_name: string;
  date: string;
  temperature: number;
  humidity: number;
  light_level: number;
}

const environmentSchema = z.object({
  section_id: z
    .string()
    .min(1, "Please select a section"),

  date: z
    .string()
    .min(1, "Date is required"),

  temperature: z
    .string()
    .min(1, "Temperature is required")
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Temperature must be a valid number",
    })
    .refine((value) => Number(value) >= -50 && Number(value) <= 100, {
      message: "Temperature must be between -50°C and 100°C",
    }),

  humidity: z
    .string()
    .min(1, "Humidity is required")
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Humidity must be a valid number",
    })
    .refine((value) => Number(value) >= 0 && Number(value) <= 100, {
      message: "Humidity must be between 0% and 100%",
    }),

  light_level: z
    .string()
    .min(1, "Light level is required")
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Light level must be a valid number",
    })
    .refine((value) => Number(value) >= 0, {
      message: "Light level cannot be negative",
    }),
});

type EnvironmentFormValues = z.infer<typeof environmentSchema>;

function Sparkline({
  data,
  color,
}: {
  data: { v: number }[];
  color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart
        data={data}
        margin={{ top: 4, right: 0, bottom: 4, left: 0 }}
      >
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1B3B2C",
            border: "none",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            color: "#fff",
          }}
          itemStyle={{ color: "#fff" }}
          formatter={(v: any) => [v ?? 0, ""]}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function EnvironmentPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [records, setRecords] = useState<EnvironmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedSection, setSelectedSection] = useState("all");
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState<
    | "date_desc"
    | "date_asc"
    | "temp_desc"
    | "temp_asc"
    | "humidity_desc"
    | "light_desc"
  >("date_desc");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnvironmentFormValues>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      section_id: "",
      date: new Date().toISOString().split("T")[0],
      temperature: "",
      humidity: "",
      light_level: "",
    },
  });

  const loadSections = async () => {
    const response = await fetch(`${API_URL}/sections`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load sections");
    }

    const data = await response.json();
    setSections(data);

    return data;
  };

  const loadRecords = async () => {
    const response = await fetch(`${API_URL}/environment/records`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      throw new Error("Failed to load environment records");
    }

    const data = await response.json();
    setRecords(data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const loadedSections = await loadSections();

        if (loadedSections.length > 0) {
          reset({
            section_id: loadedSections[0].section_id,
            date: new Date().toISOString().split("T")[0],
            temperature: "",
            humidity: "",
            light_level: "",
          });
        }

        await loadRecords();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [reset]);

  const onSubmit = async (data: EnvironmentFormValues) => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${API_URL}/environment/records`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section_id: data.section_id,
          date: data.date,
          temperature: Number(data.temperature),
          humidity: Number(data.humidity),
          light_level: Number(data.light_level),
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail || "Failed to save environment record"
        );
      }

      await loadRecords();

      reset({
        section_id: data.section_id,
        date: new Date().toISOString().split("T")[0],
        temperature: "",
        humidity: "",
        light_level: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save environment record"
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        const matchSection =
          selectedSection === "all" ||
          record.section_id === selectedSection;

        const searchValue = search.toLowerCase();

        const matchSearch =
          record.section_id.toLowerCase().includes(searchValue) ||
          record.section_name.toLowerCase().includes(searchValue) ||
          record.env_id.toLowerCase().includes(searchValue) ||
          record.date.includes(searchValue);

        return matchSection && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "date_desc") {
          return (
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
          );
        }

        if (sortBy === "date_asc") {
          return (
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
          );
        }

        if (sortBy === "temp_desc") {
          return b.temperature - a.temperature;
        }

        if (sortBy === "temp_asc") {
          return a.temperature - b.temperature;
        }

        if (sortBy === "humidity_desc") {
          return b.humidity - a.humidity;
        }

        if (sortBy === "light_desc") {
          return b.light_level - a.light_level;
        }

        return 0;
      });
  }, [records, selectedSection, search, sortBy]);

  const metrics = useMemo(() => {
    if (records.length === 0) {
      return {
        temperature: 0,
        humidity: 0,
        light: 0,
      };
    }

    const temperature =
      records.reduce((sum, record) => sum + record.temperature, 0) /
      records.length;

    const humidity =
      records.reduce((sum, record) => sum + record.humidity, 0) /
      records.length;

    const light =
      records.reduce((sum, record) => sum + record.light_level, 0) /
      records.length;

    return {
      temperature,
      humidity,
      light,
    };
  }, [records]);

  const temperatureSpark = useMemo(
    () =>
      records
        .slice()
        .reverse()
        .slice(-10)
        .map((record) => ({ v: record.temperature })),
    [records]
  );

  const humiditySpark = useMemo(
    () =>
      records
        .slice()
        .reverse()
        .slice(-10)
        .map((record) => ({ v: record.humidity })),
    [records]
  );

  const lightSpark = useMemo(
    () =>
      records
        .slice()
        .reverse()
        .slice(-10)
        .map((record) => ({ v: record.light_level })),
    [records]
  );

  return (
    <DashboardLayout>
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-900">
          Environment Monitoring
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Track and log environmental conditions across your greenhouse
          sections.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading environment data...
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Avg Temperature
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {metrics.temperature.toFixed(1)}°C
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-orange-500" />
                </div>
              </div>

              <Sparkline
                data={temperatureSpark}
                color="#f97316"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Avg Humidity
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {metrics.humidity.toFixed(1)}%
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
              </div>

              <Sparkline
                data={humiditySpark}
                color="#3b82f6"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Avg Light Level
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {metrics.light.toFixed(0)} lux
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-yellow-500" />
                </div>
              </div>

              <Sparkline
                data={lightSpark}
                color="#eab308"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-green-600" />
                Record Environment
              </h2>

              {sections.length === 0 ? (
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    No sections available
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Create a section before recording environmental data.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Section
                    </label>

                    <select
                      {...register("section_id")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    >
                      <option value="">
                        Select a section
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

                    {errors.section_id && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.section_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Date
                    </label>

                    <input
                      type="date"
                      {...register("date")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    />

                    {errors.date && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        Temp (°C)
                      </label>

                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 26.5"
                        {...register("temperature")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                      />

                      {errors.temperature && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.temperature.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        Humidity (%)
                      </label>

                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 78.2"
                        {...register("humidity")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                      />

                      {errors.humidity && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.humidity.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Light Level (lux)
                    </label>

                    <input
                      type="number"
                      step="1"
                      placeholder="e.g. 920"
                      {...register("light_level")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                    />

                    {errors.light_level && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.light_level.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-[#1B3B2C] hover:bg-[#14532d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                  >
                    {saving && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {saving ? "Saving..." : "Save Record"}
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-gray-800">
                      Historical Records
                    </h2>

                    <p className="text-xs text-gray-400">
                      Showing {filteredRecords.length} environmental
                      entries
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[150px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />

                    <input
                      type="text"
                      placeholder="Search records..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-gray-400" />

                    <select
                      value={selectedSection}
                      onChange={(e) =>
                        setSelectedSection(e.target.value)
                      }
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                    >
                      <option value="all">
                        All Sections
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

                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />

                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as typeof sortBy
                        )
                      }
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                    >
                      <option value="date_desc">
                        Date: Newest
                      </option>
                      <option value="date_asc">
                        Date: Oldest
                      </option>
                      <option value="temp_desc">
                        Temp: High
                      </option>
                      <option value="temp_asc">
                        Temp: Low
                      </option>
                      <option value="humidity_desc">
                        Humidity: High
                      </option>
                      <option value="light_desc">
                        Light: High
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                {filteredRecords.length === 0 ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Thermometer className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">
                        No records found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {[
                          "Env ID",
                          "Section",
                          "Date",
                          "Temp",
                          "Humidity",
                          "Light",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredRecords.map((record) => (
                        <tr
                          key={record.env_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs font-mono font-medium text-gray-500">
                            {record.env_id}
                          </td>

                          <td className="px-4 py-3">
                            <div>
                              <p className="text-xs font-mono text-gray-700 font-semibold">
                                {record.section_id}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {record.section_name}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                            {record.date}
                          </td>

                          <td className="px-4 py-3 text-xs font-semibold text-gray-900">
                            {record.temperature}°C
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {record.humidity}%
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {record.light_level} lux
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
