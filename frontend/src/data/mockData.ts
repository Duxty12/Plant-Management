// ============================================================
// Mock Data — Exotica Management System
// All IDs follow patterns: PT-XXXX, SPC-XXXX, SEC-XXX, ENV-XXXX,
// WAT-XXXX, GRW-YYYY-XXXX, DIS-XXX, ML-XXXX, SUP-XXX
// ============================================================

// -------------------- SPECIES --------------------
export const mockSpecies = [
  { species_id: "SPC-0001", common_name: "Variegated Monstera Albo", scientific_name: "Monstera deliciosa var. borsigiana", origin_country: "Mexico", plant_count: 6, is_user_owned: true },
  { species_id: "SPC-0002", common_name: "Philodendron Pink Princess", scientific_name: "Philodendron erubescens", origin_country: "Colombia", plant_count: 4, is_user_owned: true },
  { species_id: "SPC-0003", common_name: "Ghost Orchid", scientific_name: "Dendrophylax lindenii", origin_country: "Cuba", plant_count: 2, is_user_owned: true },
  { species_id: "SPC-0004", common_name: "Anthurium Warocqueanum", scientific_name: "Anthurium warocqueanum", origin_country: "Colombia", plant_count: 5, is_user_owned: true },
  { species_id: "SPC-0005", common_name: "Calathea Orbifolia", scientific_name: "Goeppertia orbifolia", origin_country: "Bolivia", plant_count: 8, is_user_owned: true },
  { species_id: "SPC-0006", common_name: "Hoya Kerrii", scientific_name: "Hoya kerrii Craib", origin_country: "Thailand", plant_count: 3, is_user_owned: true },
  { species_id: "SPC-0007", common_name: "Alocasia Dragon Scale", scientific_name: "Alocasia baginda", origin_country: "Indonesia", plant_count: 7, is_user_owned: true },
  { species_id: "SPC-0008", common_name: "Corpse Flower", scientific_name: "Amorphophallus titanum", origin_country: "Indonesia", plant_count: 1, is_user_owned: true },
  { species_id: "SPC-0009", common_name: "Black Bat Flower", scientific_name: "Tacca chantrieri", origin_country: "China", plant_count: 3, is_user_owned: true },
  { species_id: "SPC-0010", common_name: "Pitcher Plant", scientific_name: "Nepenthes rajah", origin_country: "Malaysia", plant_count: 4, is_user_owned: true },
  { species_id: "SPC-0011", common_name: "Voodoo Lily", scientific_name: "Amorphophallus konjac", origin_country: "Japan", plant_count: 2, is_user_owned: true },
  { species_id: "SPC-0012", common_name: "Jewel Orchid", scientific_name: "Ludisia discolor", origin_country: "Myanmar", plant_count: 2, is_user_owned: true },
  { species_id: "SPC-0013", common_name: "Queen Anthurium", scientific_name: "Anthurium regale", origin_country: "Peru", plant_count: 0, is_user_owned: false },
  { species_id: "SPC-0014", common_name: "Silver Sword Philodendron", scientific_name: "Philodendron hastatum", origin_country: "Brazil", plant_count: 0, is_user_owned: false },
  { species_id: "SPC-0015", common_name: "Staghorn Fern", scientific_name: "Platycerium grande", origin_country: "Philippines", plant_count: 0, is_user_owned: false },
  { species_id: "SPC-0016", common_name: "Velvet Cardboard Anthurium", scientific_name: "Anthurium clarinervium", origin_country: "Mexico", plant_count: 0, is_user_owned: false },
];

// -------------------- SUPPLIERS --------------------
export const mockSuppliers = [
  { supplier_id: "SUP-001", company: "Exotic Flora Imports Co.", email: "sales@exoticflora.com", phone: "+1-555-0199", address: "452 Botanical Way, Miami, FL", plants_supplied: 18 },
  { supplier_id: "SUP-002", company: "Amazonian Rare Botanicals", email: "contact@amazonianbotanicals.com", phone: "+1-555-0842", address: "12 Rainforest Ave, San Diego, CA", plants_supplied: 12 },
  { supplier_id: "SUP-003", company: "Pacific Orchid Exchange", email: "info@pacificorchid.com", phone: "+1-555-0374", address: "789 Bloom Blvd, Honolulu, HI", plants_supplied: 9 },
  { supplier_id: "SUP-004", company: "Southeast Asia Greenworks", email: "import@sagreens.sg", phone: "+65-6234-5678", address: "21 Jurong Industrial Rd, Singapore", plants_supplied: 6 },
  { supplier_id: "SUP-005", company: "Botanical Treasures Ltd.", email: "orders@bottreasures.co.uk", phone: "+44-20-7946-0958", address: "15 Kew Garden Rd, London, UK", plants_supplied: 2 },
];

// -------------------- SECTIONS --------------------
export const mockSections = [
  { section_id: "SEC-A01", section_name: "Tropical Rainforest Zone", env_id: "ENV-1001", temperature: 26.5, humidity: 82.0, light_level: 920, date: "2026-08-25", plant_count: 14 },
  { section_id: "SEC-B02", section_name: "Highland Orchid House", env_id: "ENV-1002", temperature: 19.2, humidity: 70.5, light_level: 650, date: "2026-08-25", plant_count: 8 },
  { section_id: "SEC-C03", section_name: "Arid & Succulent Wing", env_id: "ENV-1003", temperature: 33.1, humidity: 22.0, light_level: 1400, date: "2026-08-25", plant_count: 6 },
  { section_id: "SEC-D04", section_name: "Aquatic & Bog Garden", env_id: "ENV-1004", temperature: 24.0, humidity: 95.0, light_level: 500, date: "2026-08-25", plant_count: 5 },
  { section_id: "SEC-E05", section_name: "Carnivorous Plant Zone", env_id: "ENV-1005", temperature: 21.5, humidity: 88.0, light_level: 760, date: "2026-08-25", plant_count: 7 },
  { section_id: "SEC-F06", section_name: "Philodendron Gallery", env_id: "ENV-1006", temperature: 25.0, humidity: 72.0, light_level: 840, date: "2026-08-25", plant_count: 7 },
];

// -------------------- PLANTS --------------------
export const mockPlants = [
  { plant_id: "PT-1001", species_id: "SPC-0001", common_name: "Monstera Deliciosa Albo", scientific_name: "Monstera deliciosa var. borsigiana", family: "Araceae", section_id: "SEC-A01", section_name: "Tropical Rainforest Zone", supplier_id: "SUP-001", supplier_name: "Exotic Flora Imports Co.", acquire_date: "2026-01-15", health_status: "healthy", owner_id: "USR-001", owner_name: "Dr. E. Thorne" },
  { plant_id: "PT-1002", species_id: "SPC-0002", common_name: "Philodendron Pink Princess", scientific_name: "Philodendron erubescens", family: "Araceae", section_id: "SEC-F06", section_name: "Philodendron Gallery", supplier_id: "SUP-002", supplier_name: "Amazonian Rare Botanicals", acquire_date: "2026-02-20", health_status: "healthy", owner_id: "USR-001", owner_name: "Dr. E. Thorne" },
  { plant_id: "PT-1003", species_id: "SPC-0003", common_name: "Ghost Orchid", scientific_name: "Dendrophylax lindenii", family: "Orchidaceae", section_id: "SEC-B02", section_name: "Highland Orchid House", supplier_id: "SUP-003", supplier_name: "Pacific Orchid Exchange", acquire_date: "2025-11-05", health_status: "sick", owner_id: "USR-002", owner_name: "Prof. R. Vines" },
  { plant_id: "PT-1004", species_id: "SPC-0004", common_name: "Anthurium Warocqueanum", scientific_name: "Anthurium warocqueanum", family: "Araceae", section_id: "SEC-A01", section_name: "Tropical Rainforest Zone", supplier_id: "SUP-002", supplier_name: "Amazonian Rare Botanicals", acquire_date: "2026-03-10", health_status: "healthy", owner_id: "USR-001", owner_name: "Dr. E. Thorne" },
  { plant_id: "PT-1005", species_id: "SPC-0005", common_name: "Calathea Orbifolia", scientific_name: "Goeppertia orbifolia", family: "Marantaceae", section_id: "SEC-A01", section_name: "Tropical Rainforest Zone", supplier_id: "SUP-001", supplier_name: "Exotic Flora Imports Co.", acquire_date: "2025-09-22", health_status: "recovering", owner_id: "USR-003", owner_name: "G. Hartley" },
  { plant_id: "PT-1006", species_id: "SPC-0007", common_name: "Alocasia Dragon Scale", scientific_name: "Alocasia baginda", family: "Araceae", section_id: "SEC-A01", section_name: "Tropical Rainforest Zone", supplier_id: "SUP-004", supplier_name: "Southeast Asia Greenworks", acquire_date: "2026-04-18", health_status: "healthy", owner_id: "USR-002", owner_name: "Prof. R. Vines" },
  { plant_id: "PT-1007", species_id: "SPC-0008", common_name: "Corpse Flower", scientific_name: "Amorphophallus titanum", family: "Araceae", section_id: "SEC-A01", section_name: "Tropical Rainforest Zone", supplier_id: "SUP-004", supplier_name: "Southeast Asia Greenworks", acquire_date: "2025-06-01", health_status: "sick", owner_id: "USR-001", owner_name: "Dr. E. Thorne" },
  { plant_id: "PT-1008", species_id: "SPC-0009", common_name: "Black Bat Flower", scientific_name: "Tacca chantrieri", family: "Dioscoreaceae", section_id: "SEC-D04", section_name: "Aquatic & Bog Garden", supplier_id: "SUP-004", supplier_name: "Southeast Asia Greenworks", acquire_date: "2026-05-30", health_status: "healthy", owner_id: "USR-003", owner_name: "G. Hartley" },
  { plant_id: "PT-1009", species_id: "SPC-0010", common_name: "Pitcher Plant Rajah", scientific_name: "Nepenthes rajah", family: "Nepenthaceae", section_id: "SEC-E05", section_name: "Carnivorous Plant Zone", supplier_id: "SUP-003", supplier_name: "Pacific Orchid Exchange", acquire_date: "2026-07-12", health_status: "healthy", owner_id: "USR-002", owner_name: "Prof. R. Vines" },
  { plant_id: "PT-1010", species_id: "SPC-0011", common_name: "Voodoo Lily", scientific_name: "Amorphophallus konjac", family: "Araceae", section_id: "SEC-D04", section_name: "Aquatic & Bog Garden", supplier_id: "SUP-005", supplier_name: "Botanical Treasures Ltd.", acquire_date: "2025-12-15", health_status: "sick", owner_id: "USR-001", owner_name: "Dr. E. Thorne" },
];

// -------------------- ENVIRONMENT RECORDS --------------------
export const mockEnvironmentRecords = [
  { env_id: "ENV-1001", section_id: "SEC-A01", section_name: "Tropical Rainforest Zone", date: "2026-08-25", temperature: 26.5, humidity: 82.0, light_level: 920, status: "optimal" },
  { env_id: "ENV-1002", section_id: "SEC-B02", section_name: "Highland Orchid House", date: "2026-08-25", temperature: 19.2, humidity: 70.5, light_level: 650, status: "optimal" },
  { env_id: "ENV-1003", section_id: "SEC-C03", section_name: "Arid & Succulent Wing", date: "2026-08-25", temperature: 33.1, humidity: 22.0, light_level: 1400, status: "warning" },
  { env_id: "ENV-1004", section_id: "SEC-D04", section_name: "Aquatic & Bog Garden", date: "2026-08-24", temperature: 24.0, humidity: 95.0, light_level: 500, status: "optimal" },
  { env_id: "ENV-1005", section_id: "SEC-E05", section_name: "Carnivorous Plant Zone", date: "2026-08-24", temperature: 21.5, humidity: 88.0, light_level: 760, status: "optimal" },
  { env_id: "ENV-1006", section_id: "SEC-F06", section_name: "Philodendron Gallery", date: "2026-08-23", temperature: 11.2, humidity: 72.0, light_level: 840, status: "critical" },
  { env_id: "ENV-1007", section_id: "SEC-A01", section_name: "Tropical Rainforest Zone", date: "2026-08-23", temperature: 25.8, humidity: 80.5, light_level: 890, status: "optimal" },
];

// Sparkline data for Environment Monitoring page
export const tempSparkData = [
  { v: 24.2 }, { v: 25.1 }, { v: 26.0 }, { v: 25.5 }, { v: 27.1 }, { v: 26.5 }, { v: 26.8 },
];
export const humiditySparkData = [
  { v: 76 }, { v: 78 }, { v: 80 }, { v: 77 }, { v: 82 }, { v: 81 }, { v: 82 },
];
export const lightSparkData = [
  { v: 870 }, { v: 900 }, { v: 885 }, { v: 920 }, { v: 910 }, { v: 930 }, { v: 918 },
];

// -------------------- WATERING RECORDS --------------------
export const mockWateringRecords = [
  { water_id: "WAT-0001", plant_id: "PT-1001", plant_name: "Monstera Deliciosa Albo", date: "2026-08-25", amount: 350 },
  { water_id: "WAT-0002", plant_id: "PT-1002", plant_name: "Philodendron Pink Princess", date: "2026-08-24", amount: 250 },
  { water_id: "WAT-0003", plant_id: "PT-1004", plant_name: "Anthurium Warocqueanum", date: "2026-08-23", amount: 300 },
  { water_id: "WAT-0004", plant_id: "PT-1005", plant_name: "Calathea Orbifolia", date: "2026-08-22", amount: 200 },
  { water_id: "WAT-0005", plant_id: "PT-1006", plant_name: "Alocasia Dragon Scale", date: "2026-08-21", amount: 400 },
  { water_id: "WAT-0006", plant_id: "PT-1009", plant_name: "Pitcher Plant Rajah", date: "2026-08-20", amount: 500 },
];

// -------------------- FERTILIZER RECORDS --------------------
export const mockFertilizerRecords = [
  { fertilizer_id: "FRT-0001", plant_id: "PT-1001", plant_name: "Monstera Deliciosa Albo", name: "Organic NPK 10-10-10", date: "2026-08-15", amount: 15.5 },
  { fertilizer_id: "FRT-0002", plant_id: "PT-1004", plant_name: "Anthurium Warocqueanum", name: "Orchid Bloom Booster 5-15-5", date: "2026-08-10", amount: 10.0 },
  { fertilizer_id: "FRT-0003", plant_id: "PT-1002", plant_name: "Philodendron Pink Princess", name: "Liquid Seaweed Extract", date: "2026-08-05", amount: 20.0 },
  { fertilizer_id: "FRT-0004", plant_id: "PT-1006", plant_name: "Alocasia Dragon Scale", name: "Slow Release Granules 14-14-14", date: "2026-07-28", amount: 30.0 },
];

// -------------------- GROWTH RECORDS --------------------
export const mockGrowthHistory = [
  { growth_id: "GRW-2026-0001", plant_id: "PT-1001", date: "2026-06-01", height: 22.0, growth_stage: "Seedling", leaf_count: 3 },
  { growth_id: "GRW-2026-0002", plant_id: "PT-1001", date: "2026-06-20", height: 28.5, growth_stage: "Vegetative", leaf_count: 5 },
  { growth_id: "GRW-2026-0003", plant_id: "PT-1001", date: "2026-07-10", height: 34.2, growth_stage: "Vegetative", leaf_count: 6 },
  { growth_id: "GRW-2026-0004", plant_id: "PT-1001", date: "2026-07-30", height: 40.8, growth_stage: "Vegetative", leaf_count: 7 },
  { growth_id: "GRW-2026-0005", plant_id: "PT-1001", date: "2026-08-20", height: 45.2, growth_stage: "Vegetative", leaf_count: 8 },
  { growth_id: "GRW-2026-0006", plant_id: "PT-1002", date: "2026-06-15", height: 18.0, growth_stage: "Seedling", leaf_count: 4 },
  { growth_id: "GRW-2026-0007", plant_id: "PT-1002", date: "2026-07-05", height: 24.5, growth_stage: "Vegetative", leaf_count: 6 },
  { growth_id: "GRW-2026-0008", plant_id: "PT-1002", date: "2026-08-10", height: 31.0, growth_stage: "Vegetative", leaf_count: 8 },
  { growth_id: "GRW-2026-0009", plant_id: "PT-1004", date: "2026-07-01", height: 30.0, growth_stage: "Vegetative", leaf_count: 5 },
  { growth_id: "GRW-2026-0010", plant_id: "PT-1004", date: "2026-08-15", height: 38.5, growth_stage: "Vegetative", leaf_count: 7 },
];

export interface TreatmentItem {
  treat_id: string;
  date: string;
  medicine: string;
}

export interface DiseaseRecord {
  disease_id: string;
  disease_name: string;
  plant_id: string;
  plant_name: string;
  detect_date: string;
  recovery_status: "ongoing" | "treating" | "recovered";
  heal_date: string | null;
  treatments: TreatmentItem[];
}

// -------------------- DISEASE RECORDS --------------------
export const mockDiseases: DiseaseRecord[] = [
  {
    disease_id: "DIS-001",
    disease_name: "Root Rot (Pythium)",
    plant_id: "PT-1003",
    plant_name: "Ghost Orchid",
    detect_date: "2026-08-10",
    recovery_status: "treating",
    heal_date: null,
    treatments: [
      { treat_id: "TRT-001", date: "2026-08-11", medicine: "Hydrogen Peroxide (3%) flush" },
      { treat_id: "TRT-002", date: "2026-08-18", medicine: "Mefenoxam Systemic Fungicide" },
    ],
  },
  {
    disease_id: "DIS-002",
    disease_name: "Anthracnose Leaf Blight",
    plant_id: "PT-1007",
    plant_name: "Corpse Flower",
    detect_date: "2026-07-22",
    recovery_status: "treating",
    heal_date: null,
    treatments: [
      { treat_id: "TRT-003", date: "2026-07-23", medicine: "Copper Octanoate Liquid Spray" },
      { treat_id: "TRT-004", date: "2026-08-05", medicine: "Chlorothalonil broad-spectrum" },
    ],
  },
  {
    disease_id: "DIS-003",
    disease_name: "Spider Mite Infestation",
    plant_id: "PT-1005",
    plant_name: "Calathea Orbifolia",
    detect_date: "2026-06-15",
    recovery_status: "recovered",
    heal_date: "2026-07-10",
    treatments: [
      { treat_id: "TRT-005", date: "2026-06-16", medicine: "Organic Cold-Pressed Neem Oil" },
      { treat_id: "TRT-006", date: "2026-06-25", medicine: "Potassium Salts Insecticidal Soap" },
    ],
  },
  {
    disease_id: "DIS-004",
    disease_name: "Powdery Mildew",
    plant_id: "PT-1010",
    plant_name: "Voodoo Lily",
    detect_date: "2026-08-15",
    recovery_status: "ongoing",
    heal_date: null,
    treatments: [],
  },
  {
    disease_id: "DIS-005",
    disease_name: "Bacterial Leaf Spot",
    plant_id: "PT-1002",
    plant_name: "Philodendron Pink Princess",
    detect_date: "2026-05-10",
    recovery_status: "recovered",
    heal_date: "2026-05-28",
    treatments: [
      { treat_id: "TRT-007", date: "2026-05-12", medicine: "Streptomycin Sulfate Solution" },
    ],
  },
];


// -------------------- MAINTENANCE RECORDS --------------------
export const mockMaintenanceLogs = [
  { log_id: "ML-0001", activity_type: "Pruning", date: "2026-08-24", note: "Trimmed dead leaves from lower canopy", plant_id: "PT-1001", plant_name: "Monstera Deliciosa Albo" },
  { log_id: "ML-0002", activity_type: "Repotting", date: "2026-08-22", note: "Moved to 12-inch terracotta pot with perlite mix", plant_id: "PT-1004", plant_name: "Anthurium Warocqueanum" },
  { log_id: "ML-0003", activity_type: "Pest Check", date: "2026-08-20", note: "Inspected undersides of leaves — clear", plant_id: "PT-1002", plant_name: "Philodendron Pink Princess" },
  { log_id: "ML-0004", activity_type: "Cleaning", date: "2026-08-18", note: "Wiped foliage with neem oil solution", plant_id: "PT-1006", plant_name: "Alocasia Dragon Scale" },
  { log_id: "ML-0005", activity_type: "Soil Treatment", date: "2026-08-15", note: "Applied hydrogen peroxide flush for fungus gnats", plant_id: "PT-1003", plant_name: "Ghost Orchid" },
  { log_id: "ML-0006", activity_type: "Staking", date: "2026-08-10", note: "Added bamboo support stake", plant_id: "PT-1001", plant_name: "Monstera Deliciosa Albo" },
];

export const mockScheduledTasks = [
  { id: "TASK-001", title: "Quarterly Deep-Clean: Grow Lights", description: "Degrease reflector panels and replace ageing T5 bulbs in SEC-A01.", priority: "high", dueDate: "2026-08-20", assignee: "G. Hartley", overdue: true },
  { id: "TASK-002", title: "Biannual HVAC Filter Replacement", description: "Replace HEPA filters in climate control units across all zones.", priority: "medium", dueDate: "2026-09-01", assignee: "Facilities Team", overdue: false },
  { id: "TASK-003", title: "Monthly Drainage System Flush", description: "Clear bio-accumulation from hydroponic drain lines in SEC-D04.", priority: "routine", dueDate: "2026-08-30", assignee: "Prof. R. Vines", overdue: false },
  { id: "TASK-004", title: "Repot Nepenthes Specimens", description: "Scheduled biennial repotting for Pitcher Plants to fresh sphagnum mix.", priority: "routine", dueDate: "2026-09-10", assignee: "Dr. E. Thorne", overdue: false },
];

// -------------------- ACTIVITY TIMELINE --------------------
export const mockActivityTimeline = [
  { id: "ACT-001", type: "watering", date: "2026-08-25", time: "08:14 AM", title: "Watering Logged", description: "350 ml of filtered water administered via drip system.", status: "Completed", plant_id: "PT-1001" },
  { id: "ACT-002", type: "growth", date: "2026-08-20", time: "10:30 AM", title: "Growth Record Added", description: "Height progression measured and logged to growth tracker.", status: "Logged", plant_id: "PT-1001", heightDelta: "+5.4 cm", leafDelta: "+1", notes: "New fenestrated leaf emerging on petiole #7" },
  { id: "ACT-003", type: "disease", date: "2026-08-10", time: "02:45 PM", title: "Disease Detected — Root Rot (Pythium)", description: "Visual inspection identified early-stage root rot. Roots appear brown and mushy.", status: "Action Required", plant_id: "PT-1001", treatment: { title: "Treatment Applied", description: "Hydrogen peroxide flush (3%) administered. Repotted to fresh sterile media." } },
  { id: "ACT-004", type: "fertilization", date: "2026-08-15", time: "09:00 AM", title: "Fertilization Logged", description: "Organic NPK 10-10-10, 15.5 ml applied via foliar spray.", status: "Completed", plant_id: "PT-1001" },
  { id: "ACT-005", type: "maintenance", date: "2026-08-24", time: "03:00 PM", title: "Pruning Completed", description: "Trimmed 4 yellowing lower leaves. Cleaned cuts with 70% isopropyl alcohol.", status: "Completed", plant_id: "PT-1001" },
];

// -------------------- HEALTH ALERTS --------------------
export const mockHealthAlerts = [
  { alert_id: "ALT-001", severity: "critical", plant_id: "PT-1007", plant_name: "Corpse Flower", scientific_name: "Amorphophallus titanum", issue: "Severe Anthracnose Blight", description: "Fungal lesions spreading rapidly across leaf surface, stem showing signs of necrosis.", time_detected: "2026-08-25 06:22 AM" },
  { alert_id: "ALT-002", severity: "critical", plant_id: "PT-1003", plant_name: "Ghost Orchid", scientific_name: "Dendrophylax lindenii", issue: "Root Rot — Critical Stage", description: "Over 60% of root system has collapsed. Immediate intervention required.", time_detected: "2026-08-24 11:05 PM" },
  { alert_id: "ALT-003", severity: "warning", plant_id: "PT-1010", plant_name: "Voodoo Lily", scientific_name: "Amorphophallus konjac", issue: "Low Soil Moisture", description: "Soil moisture below 20% for 48+ hours. Plant showing early signs of wilt stress.", time_detected: "2026-08-25 02:18 AM" },
  { alert_id: "ALT-004", severity: "warning", plant_id: "PT-1005", plant_name: "Calathea Orbifolia", scientific_name: "Goeppertia orbifolia", issue: "Environmental Stress — High Temp", description: "Section SEC-C03 temperature exceeded 33°C, outside species tolerance range.", time_detected: "2026-08-24 03:40 PM" },
  { alert_id: "ALT-005", severity: "warning", plant_id: "PT-1009", plant_name: "Pitcher Plant Rajah", scientific_name: "Nepenthes rajah", issue: "Pitcher Fluid pH Imbalance", description: "Digestive fluid pH measured at 6.2 — normal range is 2.5–4.0. Fluid may need replacement.", time_detected: "2026-08-23 09:00 AM" },
];

// -------------------- DASHBOARD ACTIVITY --------------------
export const mockRecentActivity = [
  { time: "08:14 AM", plant_name: "Monstera Deliciosa Albo", plant_id: "PT-1001", species: "M. deliciosa var. borsigiana", action: "Watering Logged", section: "SEC-A01", status: "Completed" },
  { time: "07:45 AM", plant_name: "Ghost Orchid", plant_id: "PT-1003", species: "Dendrophylax lindenii", action: "Disease Alert Triggered", section: "SEC-B02", status: "Action Required" },
  { time: "Yesterday", plant_name: "Philodendron Pink Princess", plant_id: "PT-1002", species: "Philodendron erubescens", action: "Growth Record Added", section: "SEC-F06", status: "Clear" },
  { time: "Yesterday", plant_name: "Alocasia Dragon Scale", plant_id: "PT-1006", species: "Alocasia baginda", action: "Fertilization Logged", section: "SEC-A01", status: "Completed" },
  { time: "Aug 23", plant_name: "Calathea Orbifolia", plant_id: "PT-1005", species: "Goeppertia orbifolia", action: "Pest Inspection Cleared", section: "SEC-A01", status: "Clear" },
];
