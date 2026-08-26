// ============================================================
// API Endpoint Stubs — Exotica Management System
// TODO: Replace API_BASE_URL with real FastAPI server URL once backend is live
// ============================================================

export const API_BASE_URL = "http://localhost:8000"; // TODO: replace with real FastAPI URL

export const ENDPOINTS = {
  // Auth
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,

  // Dashboard
  dashboardOverview: `${API_BASE_URL}/dashboard/overview`,

  // Plants
  plants: `${API_BASE_URL}/plants`,
  plantsSearch: `${API_BASE_URL}/plants/search`,
  plantById: (id: string) => `${API_BASE_URL}/plants/${id}`,

  // Species
  species: `${API_BASE_URL}/species`,

  // Sections
  sections: `${API_BASE_URL}/sections`,
  sectionById: (id: string) => `${API_BASE_URL}/sections/${id}`,

  // Environment
  environmentRecords: `${API_BASE_URL}/environment/records`,
  environmentRecordById: (id: string) => `${API_BASE_URL}/environment/records/${id}`,
  environmentRecordsBySection: (sectionId: string) =>
    `${API_BASE_URL}/environment/records/section/${sectionId}`,

  // Care — Watering & Fertilizer
  waterings: `${API_BASE_URL}/care/waterings`,
  wateringsByPlant: (plantId: string) => `${API_BASE_URL}/care/waterings/${plantId}`,
  fertilizer: `${API_BASE_URL}/care/fertilizer`,
  fertilizerByPlant: (plantId: string) => `${API_BASE_URL}/care/fertilizer/${plantId}`,

  // Maintenance
  maintenance: `${API_BASE_URL}/maintenance`,
  maintenanceByPlant: (plantId: string) => `${API_BASE_URL}/maintenance/${plantId}`,

  // Growth
  growth: `${API_BASE_URL}/growth`,
  growthReport: (plantId: string) => `${API_BASE_URL}/growth/${plantId}/report`,

  // Diseases & Treatments
  diseases: `${API_BASE_URL}/diseases`,
  diseasesAssign: `${API_BASE_URL}/diseases/assign`,
  diseasesByPlant: (plantId: string) => `${API_BASE_URL}/diseases/plant/${plantId}`,
  treatments: `${API_BASE_URL}/diseases/treatments`,
  treatmentsByDisease: (diseaseId: string) => `${API_BASE_URL}/diseases/${diseaseId}/treatments`,

  // Suppliers
  suppliers: `${API_BASE_URL}/suppliers`,
  supplierById: (id: string) => `${API_BASE_URL}/suppliers/${id}`,

  // Requests
  requests: `${API_BASE_URL}/requests`,
  requestStatus: (requestId: string) => `${API_BASE_URL}/requests/${requestId}/status`,
};

// ============================================================
// AUTH STUBS
// ============================================================

// POST /auth/login
// Request:  FormData { username: "gardener_john", password: "SecurePassword123!" }
// Response: { "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "token_type": "bearer" }
export async function login(username: string, password: string) {
  // TODO: replace mock with real API call once backend is live
  // const formData = new URLSearchParams();
  // formData.append("username", username);
  // formData.append("password", password);
  // const res = await fetch(ENDPOINTS.login, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //   body: formData,
  // });
  // return res.json();
  return {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token",
    token_type: "bearer",
  };
}

// POST /auth/register
// Request:  { "username": "gardener_john", "email": "john@greenhouse.com", "password": "SecurePassword123!" }
// Response: { "user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851", "username": "gardener_john" }
export async function register(payload: { username: string; email: string; password: string }) {
  // TODO: replace mock with real API call once backend is live
  // const res = await fetch(ENDPOINTS.register, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
  // return res.json();
  void payload;
  return { user_id: "d290f1ee-6c54-4b01-90e6-d701748f0851", username: payload.username };
}

// ============================================================
// DASHBOARD STUBS
// ============================================================

// GET /dashboard/overview
// Response: { "total_plants": 18, "sick_plants": 2, "pending_requests": 0, "recent_waterings": [...] }
export async function fetchDashboardOverview() {
  // TODO: replace mock with real API call once backend is live
  // const res = await fetch(ENDPOINTS.dashboardOverview, {
  //   headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
  // });
  // return res.json();
  return {
    total_plants: 47,
    sick_plants: 4,
    pending_requests: 3,
    recent_waterings: [
      { water_id: "WAT-0001", plant_id: "PT-1001", date: "2026-08-25", amount: 350.0 },
      { water_id: "WAT-0002", plant_id: "PT-1002", date: "2026-08-24", amount: 250.0 },
    ],
  };
}

// ============================================================
// PLANTS STUBS
// ============================================================

// GET /plants
// Response: Array of Plant objects with common_name and scientific_name joined
export async function fetchPlants() {
  // TODO: replace mock with real API call once backend is live
  // const res = await fetch(ENDPOINTS.plants, {
  //   headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
  // });
  // return res.json();
  return [];
}

// POST /plants
// Request:  { "species_id": "SPC-001", "supplier_id": "SUP-001", "acquire_date": "2026-08-25", "health_status": "healthy", "section_id": "SEC-A01" }
// Response: { "plant_id": "PT-1001" }
export async function createPlant(payload: {
  species_id: string;
  supplier_id?: string;
  acquire_date: string;
  health_status: string;
  section_id?: string;
}) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { plant_id: `PT-${Math.floor(1000 + Math.random() * 9000)}` };
}

// PUT /plants/{plant_id}
// Request: same as POST /plants
// Response: { "detail": "updated" }
export async function updatePlant(id: string, payload: object) {
  // TODO: replace mock with real API call once backend is live
  void id; void payload;
  return { detail: "updated" };
}

// DELETE /plants/{plant_id}
// Response: { "detail": "deleted" }
export async function deletePlant(id: string) {
  // TODO: replace mock with real API call once backend is live
  void id;
  return { detail: "deleted" };
}

// ============================================================
// SPECIES STUBS
// ============================================================

// GET /species
// Response: [{ "species_id": "SPC-001", "common_name": "Variegated Monstera Albo", "scientific_name": "Monstera deliciosa var. borsigiana", "origin_country": "Mexico" }]
export async function fetchSpecies() {
  // TODO: replace mock with real API call once backend is live
  return [];
}

// POST /species
// Request:  { "common_name": "Philodendron Pink Princess", "scientific_name": "Philodendron erubescens", "origin_country": "Colombia" }
// Response: { "species_id": "SPC-002" }
export async function createSpecies(payload: { common_name: string; scientific_name?: string; origin_country?: string }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { species_id: `SPC-${Math.floor(100 + Math.random() * 900)}` };
}

// ============================================================
// SECTIONS STUBS
// ============================================================

// GET /sections
// Response: [{ "section_id": "SEC-A01", "section_name": "Tropical Zone A", "env_id": "ENV-001", "temperature": 26.50, "humidity": 78.20, "light_level": 920.00, "date": "2026-08-25" }]
export async function fetchSections() {
  // TODO: replace mock with real API call once backend is live
  return [];
}

// POST /sections
// Request:  { "section_name": "Highland Orchids Section", "env_id": "ENV-001" }
// Response: { "section_id": "SEC-B01", "section_name": "Highland Orchids Section" }
export async function createSection(payload: { section_name: string; env_id?: string }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { section_id: `SEC-X${Math.floor(10 + Math.random() * 90)}`, section_name: payload.section_name };
}

// DELETE /sections/{section_id}
// Response: { "detail": "deleted" }
export async function deleteSection(id: string) {
  // TODO: replace mock with real API call once backend is live
  void id;
  return { detail: "deleted" };
}

// ============================================================
// ENVIRONMENT STUBS
// ============================================================

// GET /environment/records
// Response: [{ "env_id": "ENV-001", "date": "2026-08-25", "temperature": 25.80, "humidity": 72.50, "light_level": 880.00 }]
export async function fetchEnvironmentRecords() {
  // TODO: replace mock with real API call once backend is live
  return [];
}

// POST /environment/records
// Request:  { "date": "2026-08-25", "temperature": 27.2, "humidity": 68.5, "light_level": 940.0 }
// Response: { "env_id": "ENV-002" }
export async function createEnvironmentRecord(payload: { date: string; temperature: number; humidity: number; light_level: number }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { env_id: `ENV-${Math.floor(1000 + Math.random() * 9000)}` };
}

// ============================================================
// CARE STUBS (Watering & Fertilizer)
// ============================================================

// POST /care/waterings
// Request:  { "plant_id": "PT-1001", "date": "2026-08-25", "amount": 250.0 }
// Response: { "water_id": "WAT-0001" }
export async function logWatering(payload: { plant_id: string; date: string; amount: number }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { water_id: `WAT-${Math.floor(1000 + Math.random() * 9000)}` };
}

// GET /care/waterings/{plant_id}
// Response: [{ "water_id": "WAT-0001", "plant_id": "PT-1001", "date": "2026-08-25", "amount": 250.00 }]
export async function fetchWaterings(plantId: string) {
  // TODO: replace mock with real API call once backend is live
  void plantId;
  return [];
}

// POST /care/fertilizer
// Request:  { "plant_id": "PT-1001", "name": "Organic NPK 10-10-10", "date": "2026-08-25", "amount": 15.5 }
// Response: { "fertilizer_id": "FRT-0001" }
export async function logFertilizer(payload: { plant_id: string; name: string; date: string; amount: number }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { fertilizer_id: `FRT-${Math.floor(1000 + Math.random() * 9000)}` };
}

// ============================================================
// MAINTENANCE STUBS
// ============================================================

// POST /maintenance
// Request:  { "plant_id": "PT-1001", "activity_type": "Pruning & Repotting", "date": "2026-08-25", "note": "Trimmed yellowing bottom leaves" }
// Response: { "log_id": "ML-0001" }
export async function addMaintenanceLog(payload: { plant_id: string; activity_type: string; date: string; note?: string }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { log_id: `ML-${Math.floor(1000 + Math.random() * 9000)}` };
}

// ============================================================
// GROWTH STUBS
// ============================================================

// POST /growth
// Request:  { "plant_id": "PT-1001", "date": "2026-08-25", "height": 45.2, "growth_stage": "Vegetative", "leaf_count": 8 }
// Response: { "growth_id": "GRW-2026-0001" }
export async function addGrowthRecord(payload: { plant_id: string; date: string; height: number; growth_stage: string; leaf_count: number }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { growth_id: `GRW-2026-${Math.floor(1000 + Math.random() * 9000)}` };
}

// GET /growth/{plant_id}/report
// Response: [{ "date": "2026-06-01", "height": 20.00, "growth_stage": "Seedling", "leaf_count": 3 }, ...]
export async function fetchGrowthReport(plantId: string) {
  // TODO: replace mock with real API call once backend is live
  void plantId;
  return [];
}

// ============================================================
// DISEASE & TREATMENT STUBS
// ============================================================

// POST /diseases
// Request:  { "detect_date": "2026-08-20", "recovery_status": "ongoing", "heal_date": null }
// Response: { "disease_id": "DIS-001" }
export async function createDisease(payload: { detect_date: string; recovery_status?: string; heal_date?: string | null }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { disease_id: `DIS-${Math.floor(100 + Math.random() * 900)}` };
}

// POST /diseases/assign
// Request:  { "plant_id": "PT-1001", "disease_id": "DIS-001" }
// Response: { "detail": "assigned" }
export async function assignDisease(payload: { plant_id: string; disease_id: string }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { detail: "assigned" };
}

// POST /diseases/treatments
// Request:  { "disease_id": "DIS-001", "medicine": "Neem Oil Spray & Copper Fungicide", "treat_date": "2026-08-21" }
// Response: { "treat_id": "TRT-001" }
export async function addTreatment(payload: { disease_id: string; medicine: string; treat_date: string }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { treat_id: `TRT-${Math.floor(100 + Math.random() * 900)}` };
}

// ============================================================
// SUPPLIER STUBS
// ============================================================

// POST /suppliers
// Request:  { "company": "Amazonian Rare Botanicals", "email": "contact@amazonianbotanicals.com", "phone": "+1-555-0842", "address": "12 Rainforest Ave, San Diego, CA" }
// Response: { "supplier_id": "SUP-001" }
export async function createSupplier(payload: { company: string; email?: string; phone?: string; address?: string }) {
  // TODO: replace mock with real API call once backend is live
  void payload;
  return { supplier_id: `SUP-${Math.floor(100 + Math.random() * 900)}` };
}

// PUT /suppliers/{supplier_id}
// Request: same as POST /suppliers
// Response: { "detail": "updated" }
export async function updateSupplier(id: string, payload: object) {
  // TODO: replace mock with real API call once backend is live
  void id; void payload;
  return { detail: "updated" };
}

// DELETE /suppliers/{supplier_id}
// Response: { "detail": "deleted" }
export async function deleteSupplier(id: string) {
  // TODO: replace mock with real API call once backend is live
  void id;
  return { detail: "deleted" };
}
