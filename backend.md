# 🌿 Exotic Greenhouse Monitoring System — Backend API Specification & Frontend Integration Guide

> **Single Source of Truth for Frontend Development**  
> This document contains everything needed to build, type, and connect any Frontend application (Next.js, React, Vue, Svelte, Mobile, etc.) to the Exotic Greenhouse Monitoring System FastAPI backend.

---

## 📌 Table of Contents
1. [Architecture & Server Overview](#1-architecture--server-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Complete TypeScript Type Definitions](#3-complete-typescript-type-definitions)
4. [Database Schema Reference](#4-database-schema-reference)
5. [Complete API Endpoints Reference](#5-complete-api-endpoints-reference)
   - [5.1 Health Check](#51-health-check)
   - [5.2 Authentication (`/auth`)](#52-authentication-auth)
   - [5.3 Dashboard (`/dashboard`)](#53-dashboard-dashboard)
   - [5.4 Plants (`/plants`)](#54-plants-plants)
   - [5.5 Species (`/species`)](#55-species-species)
   - [5.6 Sections (`/sections`)](#56-sections-sections)
   - [5.7 Environment Records (`/environment`)](#57-environment-records-environment)
   - [5.8 Plant Care — Waterings & Fertilizer (`/care`)](#58-plant-care--waterings--fertilizer-care)
   - [5.9 Maintenance Logs (`/maintenance`)](#59-maintenance-logs-maintenance)
   - [5.10 Growth Tracking (`/growth`)](#510-growth-tracking-growth)
   - [5.11 Diseases & Treatments (`/diseases`)](#511-diseases--treatments-diseases)
   - [5.12 Suppliers (`/suppliers`)](#512-suppliers-suppliers)
6. [Error Handling & Status Codes](#6-error-handling--status-codes)
7. [Frontend Integration Blueprint (Axios / Fetch Setup)](#7-frontend-integration-blueprint-axios--fetch-setup)
8. [Backend Local Running Instructions](#8-backend-local-running-instructions)

---

## 1. Architecture & Server Overview

- **Backend Framework**: FastAPI (Python 3.11+)
- **Database**: MySQL 8.x (Connection Pool via `mysql-connector-python`)
- **Default Base URL**: `http://localhost:8000` (or `http://127.0.0.1:8000`)
- **CORS Allowed Origins**: `http://localhost:3000` (credentials enabled)
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **OpenAPI JSON Schema**: `http://localhost:8000/openapi.json`

---

## 2. Authentication & Authorization

### 2.1 Security Scheme
- **Protocol**: OAuth2 Bearer Token with JSON Web Tokens (**JWT**).
- **Algorithm**: `HS256`.
- **Token Lifespan**: 24 Hours (`1440 minutes`).
- **Token Storage Recommendation**: Store in `localStorage`, `sessionStorage`, or secure HttpOnly cookies.

### 2.2 Auth Header Format
For all protected routes, include the JWT token in the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

### 2.3 Critical Note on Login Request Format
> ⚠️ **IMPORTANT**:
> - `/auth/register` expects **JSON** (`Content-Type: application/json`).
> - `/auth/login` uses FastAPI's `OAuth2PasswordRequestForm` and expects **URL-encoded form data** (`Content-Type: application/x-www-form-urlencoded` or `FormData` object with `username` and `password` keys).

---

## 3. Complete TypeScript Type Definitions

Copy-paste these types directly into your frontend code (e.g., `src/types/api.ts`):

```typescript
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
```

---

## 4. Database Schema Reference

For context when structuring frontend forms, relations, foreign keys, and validation limits:

```mermaid
erDiagram
    users ||--o{ plants : owns
    species ||--o{ plants : categorizes
    suppliers ||--o{ plants : supplies
    sections ||--o{ plants : locates
    environment_records ||--o{ sections : monitors
    plants ||--o{ waterings : receives
    plants ||--o{ fertilizer : receives
    plants ||--o{ maintenance_logs : has
    plants ||--o{ growth_records : tracks
    plants ||--o{ suffering_from : has
    diseases ||--o{ suffering_from : affects
    diseases ||--o{ treatments : receives

    users {
        string user_id PK
        string username UNIQUE
        string email UNIQUE
        string password
    }
    species {
        string species_id PK
        string common_name
        string scientific_name
        string origin_country
    }
    suppliers {
        string supplier_id PK
        string company
        string email
        string phone
        string address
    }
    environment_records {
        string env_id PK
        date date
        decimal temperature
        decimal humidity
        decimal light_level
    }
    sections {
        string section_id PK
        string section_name UNIQUE
        string env_id FK
    }
    plants {
        string plant_id PK
        string species_id FK
        string supplier_id FK
        date acquire_date
        string health_status
        string owner_id FK
        string section_id FK
    }
    waterings {
        string water_id PK
        string plant_id FK
        date date
        decimal amount
    }
    fertilizer {
        string fertilizer_id PK
        string plant_id FK
        string name
        date date
        decimal amount
    }
    maintenance_logs {
        string log_id PK
        string activity_type
        date date
        text note
        string plant_id FK
    }
    growth_records {
        string growth_id PK
        date date
        decimal height
        string growth_stage
        int leaf_count
        string plant_id FK
    }
    diseases {
        string disease_id PK
        date detect_date
        string recovery_status
        date heal_date
    }
    suffering_from {
        string plant_id PK_FK
        string disease_id PK_FK
    }
    treatments {
        string treat_id PK
        string disease_id FK
        string medicine
        date treat_date
    }
```

---

## 5. Complete API Endpoints Reference

### 5.1 Health Check

#### `GET /`
- **Description**: Verify backend server status.
- **Auth Required**: No.
- **Response `200 OK`**:
```json
{
  "status": "ok"
}
```

---

### 5.2 Authentication (`/auth`)

#### `POST /auth/register`
- **Description**: Registers a new user account.
- **Auth Required**: No.
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "gardener_john",
  "email": "john@greenhouse.com",
  "password": "SecurePassword123!"
}
```
- **Response `201 Created`**:
```json
{
  "user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "username": "gardener_john"
}
```
- **Possible Errors**:
  - `400 Bad Request`: `{"detail": "Username or email already registered"}`

---

#### `POST /auth/login`
- **Description**: Authenticates user and returns JWT bearer token.
- **Auth Required**: No.
- **Headers**: `Content-Type: application/x-www-form-urlencoded`
- **Request Body** (Form-Data URL-encoded):
```text
username=gardener_john&password=SecurePassword123!
```
- **Response `200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```
- **Possible Errors**:
  - `401 Unauthorized`: `{"detail": "Incorrect username or password"}`

---

### 5.3 Dashboard (`/dashboard`)

#### `GET /dashboard/overview`
- **Description**: Retrieves high-level greenhouse statistics and recent activity for the authenticated user.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
{
  "total_plants": 18,
  "sick_plants": 2,
  "pending_requests": 0,
  "recent_waterings": [
    {
      "water_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "date": "2026-08-25",
      "amount": 350.0
    }
  ]
}
```

---

### 5.4 Plants (`/plants`)

#### `GET /plants`
- **Description**: Lists all plants owned by the authenticated user, joined with species common & scientific names.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "species_id": "e4b26090-4822-49d6-8484-7a1a0d8e8b91",
    "supplier_id": "29b8c0a7-6f81-4b13-bb11-c917282b0e9d",
    "acquire_date": "2026-01-15",
    "health_status": "healthy",
    "owner_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "section_id": "8b9e6679-7425-40de-944b-e07fc1f90ae9",
    "common_name": "Monstera Deliciosa",
    "scientific_name": "Monstera deliciosa Liebm."
  }
]
```

---

#### `GET /plants/search`
- **Description**: Search and filter current user's plants.
- **Auth Required**: Yes.
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `q` | `string` | Optional | Partial search matching `common_name` or `scientific_name` |
  | `section_id` | `string` | Optional | Filter by greenhouse section ID |
  | `health_status` | `string` | Optional | Filter by exact health status (e.g. `healthy`, `sick`) |
- **Example URL**: `/plants/search?q=Monstera&health_status=healthy`
- **Response `200 OK`**: Array of Plant objects (same schema as `GET /plants`).

---

#### `GET /plants/{plant_id}`
- **Description**: Fetch full details for a single plant owned by the user.
- **Auth Required**: Yes.
- **Response `200 OK`**: Single Plant object.
- **Possible Errors**:
  - `404 Not Found`: `{"detail": "Plant not found"}`

---

#### `POST /plants`
- **Description**: Registers a new plant under the logged-in user.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "species_id": "e4b26090-4822-49d6-8484-7a1a0d8e8b91",
  "supplier_id": "29b8c0a7-6f81-4b13-bb11-c917282b0e9d",
  "acquire_date": "2026-08-25",
  "health_status": "healthy",
  "section_id": "8b9e6679-7425-40de-944b-e07fc1f90ae9"
}
```
- **Response `201 Created`**:
```json
{
  "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

---

#### `PUT /plants/{plant_id}`
- **Description**: Updates an existing plant's information.
- **Auth Required**: Yes.
- **Request Body**: Same as `POST /plants` (all fields required).
- **Response `200 OK`**:
```json
{
  "detail": "updated"
}
```

---

#### `DELETE /plants/{plant_id}`
- **Description**: Deletes a plant owned by the user.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
{
  "detail": "deleted"
}
```

---

### 5.5 Species (`/species`)

#### `GET /species`
- **Description**: Returns all registered botanical species.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "species_id": "e4b26090-4822-49d6-8484-7a1a0d8e8b91",
    "common_name": "Variegated Monstera Albo",
    "scientific_name": "Monstera deliciosa var. borsigiana",
    "origin_country": "Mexico"
  }
]
```

---

#### `POST /species`
- **Description**: Creates a new plant species.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "common_name": "Philodendron Pink Princess",
  "scientific_name": "Philodendron erubescens",
  "origin_country": "Colombia"
}
```
- **Response `201 Created`**:
```json
{
  "species_id": "f51276a1-9b12-4211-9a74-b5828d8442a8"
}
```

---

### 5.6 Sections (`/sections`)

#### `GET /sections`
- **Description**: Returns all greenhouse sections along with their current linked environmental readings.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "section_id": "8b9e6679-7425-40de-944b-e07fc1f90ae9",
    "section_name": "Tropical Zone A",
    "env_id": "a119f1ee-6c54-4b01-90e6-d701748f0811",
    "temperature": 26.50,
    "humidity": 78.20,
    "light_level": 920.00,
    "date": "2026-08-25"
  }
]
```

---

#### `GET /sections/{section_id}`
- **Description**: Gets a specific section with its environment telemetry.
- **Auth Required**: Yes.
- **Response `200 OK`**: Single section object.
- **Possible Errors**:
  - `404 Not Found`: `{"detail": "Section not found"}`

---

#### `POST /sections`
- **Description**: Adds a new section to the greenhouse.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "section_name": "Highland Orchids Section",
  "env_id": "a119f1ee-6c54-4b01-90e6-d701748f0811"
}
```
- **Response `201 Created`**:
```json
{
  "section_id": "9c123456-1111-2222-3333-444455556666",
  "section_name": "Highland Orchids Section"
}
```
- **Possible Errors**:
  - `400 Bad Request`: `{"detail": "Section already exists"}`

---

#### `PUT /sections/{section_id}`
- **Description**: Updates section name and/or linked environment ID.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "section_name": "Highland Orchids Section B",
  "env_id": "a119f1ee-6c54-4b01-90e6-d701748f0811"
}
```
- **Response `200 OK`**:
```json
{
  "detail": "updated"
}
```

---

#### `DELETE /sections/{section_id}`
- **Description**: Deletes a section.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
{
  "detail": "deleted"
}
```

---

### 5.7 Environment Records (`/environment`)

#### `GET /environment/records`
- **Description**: Fetches all environmental telemetry readings, sorted descending by date (`ORDER BY date DESC`).
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "env_id": "a119f1ee-6c54-4b01-90e6-d701748f0811",
    "date": "2026-08-25",
    "temperature": 25.80,
    "humidity": 72.50,
    "light_level": 880.00
  }
]
```

---

#### `GET /environment/records/{env_id}`
- **Description**: Gets a specific environment record by ID.
- **Auth Required**: Yes.
- **Response `200 OK`**: Single environment record.

---

#### `GET /environment/records/section/{section_id}`
- **Description**: Returns all historical environment logs linked to a section via `s.env_id = er.env_id`.
- **Auth Required**: Yes.
- **Response `200 OK`**: Array of environment records sorted by date DESC.

---

#### `POST /environment/records`
- **Description**: Logs a new environmental sensor reading.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "date": "2026-08-25",
  "temperature": 27.2,
  "humidity": 68.5,
  "light_level": 940.0
}
```
- **Response `201 Created`**:
```json
{
  "env_id": "b334f1ee-6c54-4b01-90e6-d701748f0822"
}
```

---

### 5.8 Plant Care — Waterings & Fertilizer (`/care`)

#### `POST /care/waterings`
- **Description**: Log a watering event for a plant.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "date": "2026-08-25",
  "amount": 250.0
}
```
- **Response `201 Created`**:
```json
{
  "water_id": "99bb1234-abcd-ef01-2345-6789abcdef01"
}
```

---

#### `GET /care/waterings/{plant_id}`
- **Description**: Returns full watering history for a plant ordered by date descending.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "water_id": "99bb1234-abcd-ef01-2345-6789abcdef01",
    "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "date": "2026-08-25",
    "amount": 250.00
  }
]
```

---

#### `POST /care/fertilizer`
- **Description**: Log fertilizer application for a plant.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "name": "Organic NPK 10-10-10",
  "date": "2026-08-25",
  "amount": 15.5
}
```
- **Response `201 Created`**:
```json
{
  "fertilizer_id": "88aa1234-abcd-ef01-2345-6789abcdef02"
}
```

---

#### `GET /care/fertilizer/{plant_id}`
- **Description**: Returns all fertilizer logs for a specific plant ordered by date descending.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "fertilizer_id": "88aa1234-abcd-ef01-2345-6789abcdef02",
    "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "Organic NPK 10-10-10",
    "date": "2026-08-25",
    "amount": 15.50
  }
]
```

---

### 5.9 Maintenance Logs (`/maintenance`)

#### `POST /maintenance`
- **Description**: Adds a maintenance record (e.g. repotting, pest inspection, pruning).
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "activity_type": "Pruning & Repotting",
  "date": "2026-08-25",
  "note": "Trimmed yellowing bottom leaves and repotted to 10-inch terracotta."
}
```
- **Response `201 Created`**:
```json
{
  "log_id": "77ff1234-abcd-ef01-2345-6789abcdef03"
}
```

---

#### `GET /maintenance/{plant_id}`
- **Description**: Fetches all maintenance logs for a specific plant ordered by date descending.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "log_id": "77ff1234-abcd-ef01-2345-6789abcdef03",
    "activity_type": "Pruning & Repotting",
    "date": "2026-08-25",
    "note": "Trimmed yellowing bottom leaves and repotted to 10-inch terracotta.",
    "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  }
]
```

---

### 5.10 Growth Tracking (`/growth`)

#### `POST /growth`
- **Description**: Records a plant growth measurement.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "date": "2026-08-25",
  "height": 45.2,
  "growth_stage": "Vegetative",
  "leaf_count": 8
}
```
- **Response `201 Created`**:
```json
{
  "growth_id": "66ee1234-abcd-ef01-2345-6789abcdef04"
}
```

---

#### `GET /growth/{plant_id}/report`
- **Description**: Returns chronological time-series growth measurements (`ORDER BY date ASC`) ideal for charting growth curves (e.g. Chart.js, Recharts).
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "date": "2026-06-01",
    "height": 20.00,
    "growth_stage": "Seedling",
    "leaf_count": 3
  },
  {
    "date": "2026-07-15",
    "height": 32.50,
    "growth_stage": "Vegetative",
    "leaf_count": 5
  },
  {
    "date": "2026-08-25",
    "height": 45.20,
    "growth_stage": "Vegetative",
    "leaf_count": 8
  }
]
```

---

### 5.11 Diseases & Treatments (`/diseases`)

#### `POST /diseases`
- **Description**: Creates a disease record.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "detect_date": "2026-08-20",
  "recovery_status": "ongoing",
  "heal_date": null
}
```
- **Response `201 Created`**:
```json
{
  "disease_id": "55dd1234-abcd-ef01-2345-6789abcdef05"
}
```

---

#### `POST /diseases/assign`
- **Description**: Associates a disease record with a specific plant.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "plant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "disease_id": "55dd1234-abcd-ef01-2345-6789abcdef05"
}
```
- **Response `201 Created`**:
```json
{
  "detail": "assigned"
}
```

---

#### `GET /diseases/plant/{plant_id}`
- **Description**: Retrieves all diseases associated with a plant.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "disease_id": "55dd1234-abcd-ef01-2345-6789abcdef05",
    "detect_date": "2026-08-20",
    "recovery_status": "ongoing",
    "heal_date": null
  }
]
```

---

#### `POST /diseases/treatments`
- **Description**: Adds a treatment/medication log for a disease.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "disease_id": "55dd1234-abcd-ef01-2345-6789abcdef05",
  "medicine": "Neem Oil Spray & Copper Fungicide",
  "treat_date": "2026-08-21"
}
```
- **Response `201 Created`**:
```json
{
  "treat_id": "44cc1234-abcd-ef01-2345-6789abcdef06"
}
```

---

#### `GET /diseases/{disease_id}/treatments`
- **Description**: Returns all treatment entries for a given disease.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "treat_id": "44cc1234-abcd-ef01-2345-6789abcdef06",
    "disease_id": "55dd1234-abcd-ef01-2345-6789abcdef05",
    "medicine": "Neem Oil Spray & Copper Fungicide",
    "treat_date": "2026-08-21"
  }
]
```

---

### 5.12 Suppliers (`/suppliers`)

#### `GET /suppliers`
- **Description**: Lists all registered plant & equipment suppliers.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
[
  {
    "supplier_id": "29b8c0a7-6f81-4b13-bb11-c917282b0e9d",
    "company": "Exotic Flora Imports Co.",
    "email": "sales@exoticflora.com",
    "phone": "+1-555-0199",
    "address": "452 Botanical Way, Miami, FL"
  }
]
```

---

#### `POST /suppliers`
- **Description**: Registers a new supplier.
- **Auth Required**: Yes.
- **Request Body**:
```json
{
  "company": "Amazonian Rare Botanicals",
  "email": "contact@amazonianbotanicals.com",
  "phone": "+1-555-0842",
  "address": "12 Rainforest Ave, San Diego, CA"
}
```
- **Response `201 Created`**:
```json
{
  "supplier_id": "33bb1234-abcd-ef01-2345-6789abcdef07"
}
```

---

#### `PUT /suppliers/{supplier_id}`
- **Description**: Updates supplier contact information.
- **Auth Required**: Yes.
- **Request Body**: Same as `POST /suppliers`.
- **Response `200 OK`**:
```json
{
  "detail": "updated"
}
```

---

#### `DELETE /suppliers/{supplier_id}`
- **Description**: Removes a supplier.
- **Auth Required**: Yes.
- **Response `200 OK`**:
```json
{
  "detail": "deleted"
}
```

---

## 6. Error Handling & Status Codes

| Status Code | Meaning | Example Frontend Trigger | Standard Error Body |
|---|---|---|---|
| `200 OK` | Request succeeded | Fetching lists, updating entities | `{ ... }` or `[ ... ]` |
| `201 Created` | Resource created | Adding plant, watering, registration | `{"<id_key>": "uuid"}` |
| `400 Bad Request` | Validation or business logic error | Duplicate username, email, or section | `{"detail": "Username or email already registered"}` |
| `401 Unauthorized` | Missing / invalid token or wrong credentials | Bad login password, expired JWT token | `{"detail": "Could not validate credentials"}` |
| `404 Not Found` | Entity not found | Querying invalid `plant_id` or `section_id` | `{"detail": "Plant not found"}` |
| `422 Unprocessable Entity` | Pydantic type validation failure | Missing required fields, invalid date format | `{"detail": [{"loc": ["body", "date"], "msg": "invalid date format"}]}` |
| `500 Internal Error` | Database connection error / unhandled exception | MySQL service offline | Standard server error detail |

---

## 7. Frontend Integration Blueprint (Axios / Fetch Setup)

Below is a production-ready Axios client template with automatic JWT token attachment and redirect-on-401 handling:

```typescript
// src/services/apiClient.ts
import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer Token to outgoing requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global response interceptor for token expiry handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear token and redirect to login if session expires
      localStorage.removeItem("access_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

### Complete Auth Service Example:

```typescript
// src/services/authService.ts
import { apiClient } from "./apiClient";
import { UserRegisterPayload, UserRegisterResponse, TokenResponse } from "@/types/api";

export const authService = {
  async register(data: UserRegisterPayload): Promise<UserRegisterResponse> {
    const res = await apiClient.post<UserRegisterResponse>("/auth/register", data);
    return res.data;
  },

  async login(username: string, password: string): Promise<TokenResponse> {
    // Note: login endpoint requires x-www-form-urlencoded format
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await apiClient.post<TokenResponse>("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (res.data.access_token) {
      localStorage.setItem("access_token", res.data.access_token);
    }
    return res.data;
  },

  logout(): void {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token");
  },
};
```

### API Service Module Collection:

```typescript
// src/services/greenhouseService.ts
import { apiClient } from "./apiClient";
import {
  Plant, PlantInput, PlantSearchParams,
  DashboardOverview,
  Section, SectionInput,
  EnvironmentRecord, EnvironmentRecordInput,
  Watering, WateringInput,
  Fertilizer, FertilizerInput,
  MaintenanceLog, MaintenanceLogInput,
  GrowthRecord, GrowthRecordInput, GrowthReportItem,
  Disease, DiseaseInput, Treatment, TreatmentInput,
  Species, SpeciesInput,
  Supplier, SupplierInput,
  DetailResponse
} from "@/types/api";

export const greenhouseService = {
  // Dashboard
  getDashboardOverview: () => apiClient.get<DashboardOverview>("/dashboard/overview").then(r => r.data),

  // Plants
  getPlants: () => apiClient.get<Plant[]>("/plants").then(r => r.data),
  searchPlants: (params: PlantSearchParams) => apiClient.get<Plant[]>("/plants/search", { params }).then(r => r.data),
  getPlant: (id: string) => apiClient.get<Plant>(`/plants/${id}`).then(r => r.data),
  createPlant: (data: PlantInput) => apiClient.post<{ plant_id: string }>("/plants", data).then(r => r.data),
  updatePlant: (id: string, data: PlantInput) => apiClient.put<DetailResponse>(`/plants/${id}`, data).then(r => r.data),
  deletePlant: (id: string) => apiClient.delete<DetailResponse>(`/plants/${id}`).then(r => r.data),

  // Species
  getSpecies: () => apiClient.get<Species[]>("/species").then(r => r.data),
  createSpecies: (data: SpeciesInput) => apiClient.post<{ species_id: string }>("/species", data).then(r => r.data),

  // Sections & Environment
  getSections: () => apiClient.get<Section[]>("/sections").then(r => r.data),
  getSection: (id: string) => apiClient.get<Section>(`/sections/${id}`).then(r => r.data),
  createSection: (data: SectionInput) => apiClient.post<{ section_id: string; section_name: string }>("/sections", data).then(r => r.data),
  updateSection: (id: string, data: SectionInput) => apiClient.put<DetailResponse>(`/sections/${id}`, data).then(r => r.data),
  deleteSection: (id: string) => apiClient.delete<DetailResponse>(`/sections/${id}`).then(r => r.data),

  getEnvironmentRecords: () => apiClient.get<EnvironmentRecord[]>("/environment/records").then(r => r.data),
  getSectionEnvironmentRecords: (sectionId: string) => apiClient.get<EnvironmentRecord[]>(`/environment/records/section/${sectionId}`).then(r => r.data),
  createEnvironmentRecord: (data: EnvironmentRecordInput) => apiClient.post<{ env_id: string }>("/environment/records", data).then(r => r.data),

  // Care
  getWaterings: (plantId: string) => apiClient.get<Watering[]>(`/care/waterings/${plantId}`).then(r => r.data),
  logWatering: (data: WateringInput) => apiClient.post<{ water_id: string }>("/care/waterings", data).then(r => r.data),
  getFertilizerLogs: (plantId: string) => apiClient.get<Fertilizer[]>(`/care/fertilizer/${plantId}`).then(r => r.data),
  logFertilizer: (data: FertilizerInput) => apiClient.post<{ fertilizer_id: string }>("/care/fertilizer", data).then(r => r.data),

  // Maintenance
  getMaintenanceLogs: (plantId: string) => apiClient.get<MaintenanceLog[]>(`/maintenance/${plantId}`).then(r => r.data),
  addMaintenanceLog: (data: MaintenanceLogInput) => apiClient.post<{ log_id: string }>("/maintenance", data).then(r => r.data),

  // Growth
  getGrowthReport: (plantId: string) => apiClient.get<GrowthReportItem[]>(`/growth/${plantId}/report`).then(r => r.data),
  addGrowthRecord: (data: GrowthRecordInput) => apiClient.post<{ growth_id: string }>("/growth", data).then(r => r.data),

  // Diseases & Treatments
  getPlantDiseases: (plantId: string) => apiClient.get<Disease[]>(`/diseases/plant/${plantId}`).then(r => r.data),
  createDisease: (data: DiseaseInput) => apiClient.post<{ disease_id: string }>("/diseases", data).then(r => r.data),
  assignDisease: (plantId: string, diseaseId: string) => apiClient.post<DetailResponse>("/diseases/assign", { plant_id: plantId, disease_id: diseaseId }).then(r => r.data),
  getTreatments: (diseaseId: string) => apiClient.get<Treatment[]>(`/diseases/${diseaseId}/treatments`).then(r => r.data),
  addTreatment: (data: TreatmentInput) => apiClient.post<{ treat_id: string }>("/diseases/treatments", data).then(r => r.data),

  // Suppliers
  getSuppliers: () => apiClient.get<Supplier[]>("/suppliers").then(r => r.data),
  createSupplier: (data: SupplierInput) => apiClient.post<{ supplier_id: string }>("/suppliers", data).then(r => r.data),
  updateSupplier: (id: string, data: SupplierInput) => apiClient.put<DetailResponse>(`/suppliers/${id}`, data).then(r => r.data),
  deleteSupplier: (id: string) => apiClient.delete<DetailResponse>(`/suppliers/${id}`).then(r => r.data),
};
```

---

## 8. Backend Local Running Instructions

### Prerequisites
1. MySQL Server running on `localhost:3306` with database `greenhouse` created and tables imported using [README.md](file:///a:/Codes/NextJs/Project/Exotic%20Plant%20Management/Plant-Management/README.md).
2. Python virtual environment or system Python with dependencies installed (`pip install -r backend/requirements.txt`).

### Environment Variables (`backend/.env` or system environment):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=greenhouse
SECRET_KEY=your_super_secret_jwt_key
```

### Starting the Server
Run from the project root directory:
```bash
# Option 1: Using uvicorn directly
python -m uvicorn backend.main:app --reload --port 8000

# Option 2: Using fastapi cli
python -m fastapi dev backend/main.py
```
