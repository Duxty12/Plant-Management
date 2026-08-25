"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Leaf, Dna, Building2, Heart,
  Thermometer, Droplets, Sun, TrendingUp, TrendingDown, Minus,
  ChevronRight,
} from "lucide-react";
import { mockRecentActivity, mockEnvironmentRecords, mockPlants, mockSpecies, mockSections } from "@/data/mockData";

const statCards = [
  { label: "Total Plants", value: mockPlants.length, icon: Leaf, color: "text-green-600", bg: "bg-green-50" },
  { label: "Total Species", value: mockSpecies.length, icon: Dna, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Total Sections", value: mockSections.length, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
];

const statusClass: Record<string, string> = {
  "Completed": "status-completed",
  "Clear": "status-clear",
  "Action Required": "status-action",
};

export default function DashboardPage() {
  // Compute average of last five environment records
  const lastFiveEnv = mockEnvironmentRecords.slice(-5);
  const avgTemp = (lastFiveEnv.reduce((acc, r) => acc + r.temperature, 0) / (lastFiveEnv.length || 1)).toFixed(1);
  const avgHumidity = (lastFiveEnv.reduce((acc, r) => acc + r.humidity, 0) / (lastFiveEnv.length || 1)).toFixed(1);
  const avgLight = Math.round(lastFiveEnv.reduce((acc, r) => acc + r.light_level, 0) / (lastFiveEnv.length || 1));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">Real-time metrics and environmental status for all active sections.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color} mt-1`}>{card.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Environmental Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-green-600" />
              <div>
                <h2 className="text-base font-semibold text-gray-800">Environmental Overview</h2>
                <p className="text-xs text-gray-400">Average of last 5 environment records</p>
              </div>
            </div>
            <a href="/environment" className="text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1">
              View Details <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-4">
            {[
              { label: "Avg Temperature (Last 5)", value: `${avgTemp}°C`, icon: Thermometer, trend: "up", color: "text-orange-500" },
              { label: "Avg Humidity (Last 5)", value: `${avgHumidity}%`, icon: Droplets, trend: "stable", color: "text-blue-500" },
              { label: "Avg Light Level (Last 5)", value: `${avgLight} lux`, icon: Sun, trend: "down", color: "text-yellow-500" },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">{metric.label}</p>
                  <p className="text-lg font-bold text-gray-800">{metric.value}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${metric.trend === "up" ? "text-red-500" : metric.trend === "down" ? "text-blue-500" : "text-gray-400"}`}>
                  {metric.trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : metric.trend === "down" ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                  {metric.trend === "up" ? "+1.2" : metric.trend === "down" ? "-12" : "Stable"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-800">Health Overview</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Healthy", pct: 83, color: "bg-emerald-500", text: "text-emerald-700" },
              { label: "Under Treatment", pct: 9, color: "bg-amber-400", text: "text-amber-700" },
              { label: "Diseased", pct: 8, color: "bg-red-500", text: "text-red-700" },
            ].map((h) => (
              <div key={h.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{h.label}</span>
                  <span className={`text-sm font-bold ${h.text}`}>{h.pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${h.color} rounded-full transition-all duration-700`} style={{ width: `${h.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> <span className="text-gray-600">39 plants healthy</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> <span className="text-gray-600">4 need attention</span></div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Recent Plant Activities</h2>
          <a href="/activity" className="text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1">
            View All Logs <ChevronRight className="w-3 h-3" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="bg-gray-50">
                {["Date", "Plant / Species", "Action / Event", "Section"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockRecentActivity.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap font-medium">{row.time}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-800">{row.plant_name}</p>
                    <p className="text-xs text-gray-500 italic">{row.species} · <span className="not-italic font-mono text-gray-400">{row.plant_id}</span></p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{row.action}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-gray-600">{row.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}