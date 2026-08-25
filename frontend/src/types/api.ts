// ==========================================
// 1. Auth & User Types
// ==========================================

export interface User {
  user_id: string;
  username: string;
  email: string;
}

export interface UserRegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface UserRegisterResponse {
  user_id: string;
  username: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

// ==========================================
// 2. Species Types
// ==========================================

export interface Species {
  species_id: string;
  common_name: string;
  scientific_name: string | null;
  origin_country: string | null;
}

export interface SpeciesInput {
  common_name: string;
  scientific_name?: string | null;
  origin_country?: string | null;
}

export interface SpeciesCreatedResponse {
  species_id: string;
}

// ==========================================
// 3. Supplier Types
// ==========================================

export interface Supplier {
  supplier_id: string;
  company: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface SupplierInput {
  company: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface SupplierCreatedResponse {
  supplier_id: string;
}

// ==========================================
// 4. Section & Environment Types
// ==========================================

export interface Section {
  section_id: string;
  section_name: string;
  env_id: string | null;
  temperature: number | null;
  humidity: number | null;
  light_level: number | null;
  date: string | null; // ISO Date YYYY-MM-DD
}

export interface SectionInput {
  section_name: string;
  env_id?: string | null;
}

export interface SectionCreatedResponse {
  section_id: string;
  section_name: string;
}

export interface EnvironmentRecord {
  env_id: string;
  date: string; // YYYY-MM-DD
  temperature: number; // e.g. 24.50
  humidity: number; // e.g. 65.00
  light_level: number; // e.g. 850.00
}

export interface EnvironmentRecordInput {
  date: string; // YYYY-MM-DD
  temperature: number;
  humidity: number;
  light_level: number;
}

export interface EnvironmentRecordCreatedResponse {
  env_id: string;
}

// ==========================================
// 5. Plant Types
// ==========================================

export type PlantHealthStatus = "healthy" | "sick" | "recovering" | "critical" | string;

export interface Plant {
  plant_id: string;
  species_id: string;
  supplier_id: string | null;
  acquire_date: string; // YYYY-MM-DD
  health_status: PlantHealthStatus;
  owner_id: string;
  section_id: string | null;
  common_name: string;
  scientific_name: string | null;
}

export interface PlantInput {
  species_id: string;
  supplier_id?: string | null;
  acquire_date: string; // YYYY-MM-DD
  health_status: string;
  section_id?: string | null;
}

export interface PlantCreatedResponse {
  plant_id: string;
}

export interface PlantSearchParams {
  q?: string; // searches common_name or scientific_name
  section_id?: string;
  health_status?: string;
}

// ==========================================
// 6. Care Types (Watering & Fertilizer)
// ==========================================

export interface Watering {
  water_id: string;
  plant_id: string;
  date: string; // YYYY-MM-DD
  amount: number; // in ml or liters (DECIMAL 6,2)
}

export interface WateringInput {
  plant_id: string;
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface WateringCreatedResponse {
  water_id: string;
}

export interface Fertilizer {
  fertilizer_id: string;
  plant_id: string;
  name: string;
  date: string; // YYYY-MM-DD
  amount: number; // DECIMAL 6,2
}

export interface FertilizerInput {
  plant_id: string;
  name: string;
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface FertilizerCreatedResponse {
  fertilizer_id: string;
}

// ==========================================
// 7. Maintenance Types
// ==========================================

export interface MaintenanceLog {
  log_id: string;
  activity_type: string; // e.g., "Pruning", "Repotting", "Cleaning", "Pest Check"
  date: string; // YYYY-MM-DD
  note: string | null;
  plant_id: string;
}

export interface MaintenanceLogInput {
  plant_id: string;
  activity_type: string;
  date: string; // YYYY-MM-DD
  note?: string | null;
}

export interface MaintenanceLogCreatedResponse {
  log_id: string;
}

// ==========================================
// 8. Growth Types
// ==========================================

export interface GrowthRecord {
  growth_id: string;
  plant_id: string;
  date: string; // YYYY-MM-DD
  height: number; // DECIMAL 6,2 (cm or inches)
  growth_stage: string; // e.g. "Seedling", "Vegetative", "Budding", "Mature"
  leaf_count: number;
}

export interface GrowthRecordInput {
  plant_id: string;
  date: string; // YYYY-MM-DD
  height: number;
  growth_stage: string;
  leaf_count: number;
}

export interface GrowthRecordCreatedResponse {
  growth_id: string;
}

export interface GrowthReportItem {
  date: string; // YYYY-MM-DD
  height: number;
  growth_stage: string;
  leaf_count: number;
}

// ==========================================
// 9. Disease & Treatment Types
// ==========================================

export type DiseaseRecoveryStatus = "ongoing" | "treating" | "recovered" | string;

export interface Disease {
  disease_id: string;
  detect_date: string; // YYYY-MM-DD
  recovery_status: DiseaseRecoveryStatus;
  heal_date: string | null; // YYYY-MM-DD
}

export interface DiseaseInput {
  detect_date: string; // YYYY-MM-DD
  recovery_status?: string; // defaults to "ongoing"
  heal_date?: string | null; // YYYY-MM-DD
}

export interface DiseaseCreatedResponse {
  disease_id: string;
}

export interface AssignDiseaseInput {
  plant_id: string;
  disease_id: string;
}

export interface Treatment {
  treat_id: string;
  disease_id: string;
  medicine: string;
  treat_date: string; // YYYY-MM-DD
}

export interface TreatmentInput {
  disease_id: string;
  medicine: string;
  treat_date: string; // YYYY-MM-DD
}

export interface TreatmentCreatedResponse {
  treat_id: string;
}

// ==========================================
// 10. Dashboard Types
// ==========================================

export interface DashboardOverview {
  total_plants: number;
  sick_plants: number;
  pending_requests: number;
  recent_waterings: Watering[];
}

// ==========================================
// 11. Generic API Responses & Errors
// ==========================================

export interface DetailResponse {
  detail: string;
}

export interface ApiError {
  detail: string | { loc: (string | number)[]; msg: string; type: string }[];
}
