"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

import {
  Truck,
  Plus,
  Filter,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  X,
  Search,
} from "lucide-react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


const API_URL = "http://localhost:8000/api";


interface SupplierItem {
  supplier_id: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  plants_supplied: number;
  is_user_owned?: boolean;
}


const avatarColors = [
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-green-400 to-green-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
];


const supplierSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Company name is too long"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .or(z.literal(""))
    .optional(),

  phone: z
    .string()
    .max(50, "Phone number is too long")
    .optional(),

  address: z
    .string()
    .max(500, "Address is too long")
    .optional(),
});


type SupplierFormValues = z.infer<typeof supplierSchema>;


export default function SuppliersPage() {

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [supplyFilter, setSupplyFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState<SupplierItem | null>(null);


  const addForm = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),

    defaultValues: {
      company: "",
      email: "",
      phone: "",
      address: "",
    },
  });



  const editForm = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),

    defaultValues: {
      company: "",
      email: "",
      phone: "",
      address: "",
    },
  });


  async function fetchSuppliers() {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/suppliers`,
        {
          method: "GET",
          credentials: "include",
        }
      );


      if (response.status === 401) {

        setError(
          "Your session has expired. Please log in again."
        );

        return;
      }


      if (!response.ok) {
        throw new Error("Failed to load suppliers");
      }


      const data = await response.json();

      setSuppliers(data);

    } catch (err) {

      console.error(
        "Error fetching suppliers:",
        err
      );

      setError(
        "Unable to load suppliers. Please try again."
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {
    fetchSuppliers();
  }, []);


  async function handleAddSupplier(
    values: SupplierFormValues
  ) {

    try {

      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/suppliers`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            company: values.company,
            email: values.email || null,
            phone: values.phone || null,
            address: values.address || null,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail || "Failed to create supplier"
        );
      }


      // Reset form
      addForm.reset();

      // Close modal
      setShowModal(false);

      // Reload from database
      await fetchSuppliers();

    } catch (err) {

      console.error(
        "Error creating supplier:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create supplier"
      );

    } finally {

      setSubmitting(false);
    }
  }

  function handleOpenEdit(
    supplier: SupplierItem
  ) {

    if (!supplier.is_user_owned) {
      return;
    }


    setEditingSupplier(supplier);


    editForm.reset({
      company: supplier.company,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });


    setError("");
  }


  async function handleSaveEdit(
    values: SupplierFormValues
  ) {

    if (!editingSupplier) {
      return;
    }


    if (!editingSupplier.is_user_owned) {
      setError(
        "You cannot edit this supplier."
      );

      return;
    }


    try {

      setSubmitting(true);
      setError("");


      const response = await fetch(
        `${API_URL}/suppliers/${editingSupplier.supplier_id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            company: values.company,
            email: values.email || null,
            phone: values.phone || null,
            address: values.address || null,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail || "Failed to update supplier"
        );
      }


      editForm.reset();

      setEditingSupplier(null);

      await fetchSuppliers();

    } catch (err) {

      console.error(
        "Error updating supplier:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update supplier"
      );

    } finally {

      setSubmitting(false);
    }
  }


  async function handleDeleteSupplier(
    supplier: SupplierItem
  ) {

    if (!supplier.is_user_owned) {
      setError(
        "You cannot delete this supplier."
      );

      return;
    }


    const confirmed = window.confirm(
      "Are you sure you want to remove this supplier?"
    );


    if (!confirmed) {
      return;
    }


    try {

      setError("");


      const response = await fetch(
        `${API_URL}/suppliers/${supplier.supplier_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail || "Failed to delete supplier"
        );
      }


      setSuppliers((current) =>
        current.filter(
          (item) =>
            item.supplier_id !==
            supplier.supplier_id
        )
      );

    } catch (err) {

      console.error(
        "Error deleting supplier:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete supplier"
      );
    }
  }



  const filteredSuppliers =
    suppliers.filter((supplier) => {

      const searchValue =
        search.toLowerCase();


      const matchesSearch =
        supplier.company
          .toLowerCase()
          .includes(searchValue) ||

        supplier.supplier_id
          .toLowerCase()
          .includes(searchValue) ||

        (supplier.email ?? "")
          .toLowerCase()
          .includes(searchValue) ||

        (supplier.address ?? "")
          .toLowerCase()
          .includes(searchValue);


      let matchesSupply = true;


      if (supplyFilter === "high") {

        matchesSupply =
          supplier.plants_supplied >= 10;
      }


      if (supplyFilter === "medium") {

        matchesSupply =
          supplier.plants_supplied >= 5 &&
          supplier.plants_supplied < 10;
      }


      if (supplyFilter === "low") {

        matchesSupply =
          supplier.plants_supplied < 5;
      }


      return (
        matchesSearch &&
        matchesSupply
      );
    });



  return (
    <DashboardLayout>


      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Suppliers
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Manage plant suppliers, contact details,
            and supply relationships.
          </p>

        </div>


        <button
          onClick={() => {
            addForm.reset();
            setError("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />

          Add Supplier
        </button>

      </div>


      {error && (

        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>

      )}



      <div className="mb-6 max-w-xs">

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">

          <div>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Suppliers
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-1">
              {suppliers.length}
            </p>

          </div>


          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">

            <Truck className="w-6 h-6 text-green-700" />

          </div>

        </div>

      </div>



      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex items-center justify-between flex-wrap gap-3">

        <div className="relative flex-1 min-w-[220px]">

          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search suppliers by company, email, or address…"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50/50"
          />

        </div>


        <div className="flex items-center gap-2">

          <Filter className="w-3.5 h-3.5 text-gray-400" />

          <select
            value={supplyFilter}
            onChange={(e) =>
              setSupplyFilter(e.target.value)
            }
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
          >

            <option value="all">
              All Supply Volumes
            </option>

            <option value="high">
              High Volume (&gt;=10 plants)
            </option>

            <option value="medium">
              Medium (5–9 plants)
            </option>

            <option value="low">
              Low (&lt;5 plants)
            </option>

          </select>

        </div>

      </div>



      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">

          <p className="text-xs text-gray-500 font-medium">

            Showing{" "}
            {filteredSuppliers.length}{" "}
            of{" "}
            {suppliers.length}{" "}
            botanical suppliers

          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-gray-50 border-b border-gray-100">

                {[
                  "Supplier ID",
                  "Company Name",
                  "Contact Details",
                  "Facility Location",
                  "Plants Supplied",
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
                    Loading suppliers...
                  </td>

                </tr>

              )}


              {/* Empty */}

              {!loading &&
                filteredSuppliers.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      No suppliers found.
                    </td>

                  </tr>

                )}


              {/* Data */}

              {!loading &&
                filteredSuppliers.map(
                  (supplier, index) => (

                    <tr
                      key={
                        supplier.supplier_id
                      }
                      className="hover:bg-gray-50 transition-colors"
                    >

                      {/* Supplier ID */}

                      <td className="px-5 py-4 text-xs font-mono font-medium text-gray-500">
                        {supplier.supplier_id}
                      </td>


                      {/* Company */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                              avatarColors[
                                index %
                                  avatarColors.length
                              ]
                            } flex items-center justify-center flex-shrink-0 shadow-xs`}
                          >

                            <span className="text-white text-xs font-bold">

                              {supplier.company
                                .charAt(0)
                                .toUpperCase()}

                            </span>

                          </div>


                          <div>

                            <span className="text-sm font-semibold text-gray-800">

                              {supplier.company}

                            </span>


                            {!supplier.is_user_owned && (

                              <div>

                                <span className="text-[10px] uppercase font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">

                                  Catalog

                                </span>

                              </div>

                            )}

                          </div>

                        </div>

                      </td>


                      {/* Contact */}

                      <td className="px-5 py-4">

                        <div className="space-y-1">

                          {supplier.email && (

                            <div className="flex items-center gap-1.5 text-xs text-gray-600">

                              <Mail className="w-3.5 h-3.5 text-gray-400" />

                              {supplier.email}

                            </div>

                          )}


                          {supplier.phone && (

                            <div className="flex items-center gap-1.5 text-xs text-gray-600">

                              <Phone className="w-3.5 h-3.5 text-gray-400" />

                              {supplier.phone}

                            </div>

                          )}

                          {!supplier.email &&
                            !supplier.phone && (

                              <span className="text-xs text-gray-400">
                                —
                              </span>

                            )}

                        </div>

                      </td>


                      {/* Address */}

                      <td className="px-5 py-4 text-xs text-gray-600 max-w-[200px]">

                        <div className="flex items-start gap-1">

                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />

                          <span>
                            {supplier.address ||
                              "—"}
                          </span>

                        </div>

                      </td>


                      {/* Plants */}

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">

                          {supplier.plants_supplied}{" "}
                          plants

                        </span>

                      </td>


                      {/* Actions */}

                      <td className="px-5 py-4">

                        {supplier.is_user_owned ? (

                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                handleOpenEdit(
                                  supplier
                                )
                              }
                              title="Edit Supplier"
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                            >

                              <Pencil className="w-3.5 h-3.5" />

                            </button>


                            <button
                              onClick={() =>
                                handleDeleteSupplier(
                                  supplier
                                )
                              }
                              title="Delete Supplier"
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

                  )
                )}

            </tbody>

          </table>

        </div>

      </div>



      {showModal && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">


            {/* Header */}

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Add New Supplier
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                  Register botanical vendor details
                </p>

              </div>


              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
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
                handleAddSupplier
              )}
              className="p-6 space-y-4"
            >

              {/* Company */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Company Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Amazonian Rare Botanicals"
                  {...addForm.register("company")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    addForm.formState.errors.company
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {addForm.formState.errors.company && (

                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      addForm.formState
                        .errors.company.message
                    }
                  </p>

                )}

              </div>


              {/* Email */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="e.g. contact@amazonianbotanicals.com"
                  {...addForm.register("email")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    addForm.formState.errors.email
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {addForm.formState.errors.email && (

                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      addForm.formState
                        .errors.email.message
                    }
                  </p>

                )}

              </div>


              {/* Phone */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Phone
                </label>

                <input
                  type="text"
                  placeholder="e.g. +1-555-0842"
                  {...addForm.register("phone")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />

              </div>


              {/* Address */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Address
                </label>

                <input
                  type="text"
                  placeholder="e.g. 12 Rainforest Ave, San Diego, CA"
                  {...addForm.register("address")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />

              </div>


              {/* Buttons */}

              <div className="pt-2 border-t border-gray-100 flex gap-3">

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowModal(false);
                    addForm.reset();
                  }}
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
                    ? "Adding..."
                    : "Add Supplier"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {editingSupplier && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">


            {/* Header */}

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Edit Supplier
                </h2>

                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  ID:{" "}
                  {editingSupplier.supplier_id}
                </p>

              </div>


              <button
                type="button"
                onClick={() => {
                  setEditingSupplier(null);
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

              {/* Company */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Company Name
                </label>

                <input
                  type="text"
                  {...editForm.register("company")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    editForm.formState.errors.company
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {editForm.formState.errors.company && (

                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      editForm.formState
                        .errors.company.message
                    }
                  </p>

                )}

              </div>


              {/* Email */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Email
                </label>

                <input
                  type="email"
                  {...editForm.register("email")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    editForm.formState.errors.email
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-green-200"
                  }`}
                />

                {editForm.formState.errors.email && (

                  <p className="mt-1.5 text-xs text-red-600">
                    {
                      editForm.formState
                        .errors.email.message
                    }
                  </p>

                )}

              </div>


              {/* Phone */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Phone
                </label>

                <input
                  type="text"
                  {...editForm.register("phone")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />

              </div>


              {/* Address */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Address
                </label>

                <input
                  type="text"
                  {...editForm.register("address")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
                />

              </div>


              {/* Buttons */}

              <div className="pt-2 border-t border-gray-100 flex gap-3">

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setEditingSupplier(null);
                    editForm.reset();
                  }}
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
