"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockSpecies, mockPlants, mockSuppliers } from "@/data/mockData";
import { PackagePlus, Search, ChevronDown, Leaf, Truck, Mail, Phone, MapPin, Building2, Package } from "lucide-react";

const avatarColors = [
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-green-400 to-green-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
];

export default function RequestPlantPage() {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>("");
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSpecies = mockSpecies.filter(
    (s) =>
      s.common_name.toLowerCase().includes(speciesSearch.toLowerCase()) ||
      s.scientific_name.toLowerCase().includes(speciesSearch.toLowerCase())
  );

  const selectedSpecies = mockSpecies.find((s) => s.species_id === selectedSpeciesId);

  // Find all plants of the selected species, then get unique supplier IDs
  const { supplierIds, plantCount } = useMemo(() => {
    if (!selectedSpeciesId) return { supplierIds: [], plantCount: 0 };
    const plantsOfSpecies = mockPlants.filter((p) => p.species_id === selectedSpeciesId);
    const ids = [...new Set(plantsOfSpecies.map((p) => p.supplier_id))];
    return { supplierIds: ids, plantCount: plantsOfSpecies.length };
  }, [selectedSpeciesId]);

  // Get full supplier records
  const suppliers = useMemo(
    () => supplierIds.map((id) => mockSuppliers.find((s) => s.supplier_id === id)).filter(Boolean) as typeof mockSuppliers,
    [supplierIds]
  );

  const handleSelectSpecies = (speciesId: string, name: string) => {
    setSelectedSpeciesId(speciesId);
    setSpeciesSearch(name);
    setShowDropdown(false);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#1B3B2C] flex items-center justify-center">
            <PackagePlus className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request a Plant</h1>
            <p className="text-gray-500 text-sm">Select a species to discover which suppliers carry it.</p>
          </div>
        </div>
      </div>

      {/* Species Selector Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-600" />
          Select a Species
        </h2>

        {/* Custom searchable dropdown */}
        <div className="relative max-w-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search species by common or scientific name…"
              value={speciesSearch}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSpeciesSearch(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) setSelectedSpeciesId("");
              }}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 bg-gray-50 transition"
            />
            <ChevronDown
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
            />
          </div>

          {showDropdown && (
            <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {filteredSpecies.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">No species found</div>
                ) : (
                  filteredSpecies.map((s) => {
                    const plantsCount = mockPlants.filter((p) => p.species_id === s.species_id).length;
                    return (
                      <button
                        key={s.species_id}
                        onClick={() => handleSelectSpecies(s.species_id, s.common_name)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-green-50 transition text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{s.common_name}</p>
                          <p className="text-xs text-gray-400 italic">{s.scientific_name}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          <span className="text-xs font-mono text-gray-400">{s.species_id}</span>
                          {plantsCount > 0 ? (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {plantsCount} in stock
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              Not in stock
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              <button
                className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 border-t border-gray-100 bg-gray-50 transition"
                onClick={() => setShowDropdown(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Close dropdown overlay */}
        {showDropdown && (
          <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
        )}
      </div>

      {/* Results */}
      {selectedSpecies && (
        <>
          {/* Selected species info */}
          <div className="bg-gradient-to-r from-[#1B3B2C] to-[#2d5c45] rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-7 h-7 text-green-300" />
                </div>
                <div>
                  <p className="text-xs text-green-300/70 font-semibold uppercase tracking-widest mb-0.5">{selectedSpecies.species_id}</p>
                  <h2 className="text-2xl font-black">{selectedSpecies.common_name}</h2>
                  <p className="text-green-200/70 italic text-sm">{selectedSpecies.scientific_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-black">{plantCount}</p>
                  <p className="text-green-300/60 text-xs uppercase tracking-wider">Plants in Stock</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black">{suppliers.length}</p>
                  <p className="text-green-300/60 text-xs uppercase tracking-wider">
                    {suppliers.length === 1 ? "Supplier" : "Suppliers"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold">{selectedSpecies.origin_country}</p>
                  <p className="text-green-300/60 text-xs uppercase tracking-wider">Origin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Cards */}
          {suppliers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-400 mb-1">No Suppliers Found</h3>
              <p className="text-gray-400 text-sm">No supplier currently carries plants of this species in the system.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-green-600" />
                <h3 className="text-base font-semibold text-gray-800">
                  Suppliers carrying <span className="text-green-700">{selectedSpecies.common_name}</span>
                </h3>
                <span className="ml-auto text-xs font-medium text-gray-400">{suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""} found</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {suppliers.map((sup, i) => {
                  const supPlants = mockPlants.filter((p) => p.supplier_id === sup.supplier_id && p.species_id === selectedSpeciesId);
                  return (
                    <div
                      key={sup.supplier_id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Card header */}
                      <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <span className="text-white text-sm font-bold">{sup.company[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{sup.company}</p>
                          <p className="text-xs font-mono text-gray-400">{sup.supplier_id}</p>
                        </div>
                        <div className="ml-auto flex-shrink-0">
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                            {supPlants.length} plant{supPlants.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Contact info */}
                      <div className="px-5 py-4 space-y-3">
                        {sup.email && (
                          <a
                            href={`mailto:${sup.email}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition">
                              <Mail className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                              <p className="text-sm text-blue-600 group-hover:underline truncate">{sup.email}</p>
                            </div>
                          </a>
                        )}

                        {sup.phone && (
                          <a
                            href={`tel:${sup.phone}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition">
                              <Phone className="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Phone</p>
                              <p className="text-sm text-gray-800">{sup.phone}</p>
                            </div>
                          </a>
                        )}

                        {sup.address && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Address</p>
                              <p className="text-sm text-gray-800">{sup.address}</p>
                            </div>
                          </div>
                        )}

                        {/* Plant specimens from this supplier */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-purple-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Specimen IDs</p>
                            <div className="flex flex-wrap gap-1">
                              {supPlants.map((p) => (
                                <span key={p.plant_id} className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {p.plant_id}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="px-5 pb-4">
                        <a
                          href={`mailto:${sup.email}?subject=Plant Request: ${selectedSpecies.common_name} (${selectedSpecies.species_id})&body=Hello ${sup.company},%0A%0AI would like to enquire about sourcing ${selectedSpecies.common_name} (${selectedSpecies.scientific_name}) from your collection.%0A%0APlease let me know availability and pricing.%0A%0AKind regards`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1B3B2C] hover:bg-[#14532d] text-white text-sm font-semibold rounded-xl transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Contact Supplier
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Empty state — no selection */}
      {!selectedSpeciesId && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <Leaf className="w-10 h-10 text-green-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">Select a Species</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Use the search box above to find a species. We'll show you every supplier that carries plants of that species along with their full contact details.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
