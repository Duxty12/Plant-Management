"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockSuppliers } from "@/data/mockData";
import { Truck, Plus, Filter, ArrowUpDown, Pencil, Trash2, Mail, Phone, MapPin, X, Search } from "lucide-react";

const avatarColors = [
  "from-blue-400 to-blue-600", "from-purple-400 to-purple-600",
  "from-green-400 to-green-600", "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
];

interface SupplierItem {
  supplier_id: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  plants_supplied: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(mockSuppliers);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  const [form, setForm] = useState({ company: "", email: "", phone: "", address: "" });
  const [editForm, setEditForm] = useState({ company: "", email: "", phone: "", address: "" });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newSup = {
      supplier_id: `SUP-${String(suppliers.length + 1).padStart(3, "0")}`,
      company: form.company,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      plants_supplied: 0,
    };
    setSuppliers([newSup, ...suppliers]);
    setForm({ company: "", email: "", phone: "", address: "" });
    setShowModal(false);
  };

  const handleOpenEdit = (sup: SupplierItem) => {
    setEditingSupplier(sup);
    setEditForm({
      company: sup.company,
      email: sup.email || "",
      phone: sup.phone || "",
      address: sup.address || "",
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setSuppliers(suppliers.map((s) => {
      if (s.supplier_id === editingSupplier.supplier_id) {
        return {
          ...s,
          company: editForm.company,
          email: editForm.email || null,
          phone: editForm.phone || null,
          address: editForm.address || null,
        };
      }
      return s;
    }));
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm("Are you sure you want to remove this supplier?")) {
      setSuppliers(suppliers.filter((s) => s.supplier_id !== id));
    }
  };

  const [search, setSearch] = useState("");
  const [supplyFilter, setSupplyFilter] = useState("all");

  const filteredSuppliers = suppliers.filter((sup) => {
    const matchesSearch =
      sup.company.toLowerCase().includes(search.toLowerCase()) ||
      sup.supplier_id.toLowerCase().includes(search.toLowerCase()) ||
      (sup.email && sup.email.toLowerCase().includes(search.toLowerCase())) ||
      (sup.address && sup.address.toLowerCase().includes(search.toLowerCase()));
    let matchesSupply = true;
    if (supplyFilter === "high") matchesSupply = sup.plants_supplied >= 10;
    if (supplyFilter === "medium") matchesSupply = sup.plants_supplied >= 5 && sup.plants_supplied < 10;
    if (supplyFilter === "low") matchesSupply = sup.plants_supplied < 5;
    return matchesSearch && matchesSupply;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage plant suppliers, contact details, and supply relationships.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Stat Card (Pending reviews removed) */}
      <div className="mb-6 max-w-xs">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Suppliers</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{suppliers.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Truck className="w-6 h-6 text-green-700" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by company, email, or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={supplyFilter}
            onChange={(e) => setSupplyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="all">All Supply Volumes</option>
            <option value="high">High Volume (&gt;=10 plants)</option>
            <option value="medium">Medium (5–9 plants)</option>
            <option value="low">Low (&lt;5 plants)</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-2">
          <p className="text-xs text-gray-500 font-medium">
            Showing {filteredSuppliers.length} of {suppliers.length} botanical suppliers
          </p>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Supplier ID", "Company Name", "Contact Details", "Facility Location", "Plants Supplied", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSuppliers.map((sup, i) => (
                <tr key={sup.supplier_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono font-medium text-gray-500">{sup.supplier_id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                        <span className="text-white text-xs font-bold">{sup.company[0]}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{sup.company}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      {sup.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />{sup.email}
                        </div>
                      )}
                      {sup.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />{sup.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600 max-w-[200px]">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{sup.address || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                      {sup.plants_supplied} plants
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(sup)}
                        title="Edit Supplier"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(sup.supplier_id)}
                        title="Delete Supplier"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add New Supplier</h2>
                <p className="text-xs text-gray-500 mt-0.5">Register botanical vendor details</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amazonian Rare Botanicals"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="e.g. contact@amazonianbotanicals.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +1-555-0842"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Address</label>
                <input
                  type="text"
                  placeholder="e.g. 12 Rainforest Ave, San Diego, CA"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm">Add Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Supplier</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {editingSupplier.supplier_id}</p>
              </div>
              <button onClick={() => setEditingSupplier(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />
              </div>
              <div className="pt-2 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setEditingSupplier(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white rounded-xl text-sm font-semibold transition shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
