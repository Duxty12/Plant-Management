# 🌿 Exotica Plant Management System — API Specification

This document details all RESTful API endpoints required by the Exotica Frontend, aligned with the **Database ERD & Schema** specification.

---

## 🗄️ Relational Database Schema Alignment

The API operates over the following 11 database entities and 1 junction table:

```
[users] (user_id PK, username, email, password)
  ├── 1:N ──> [species] (species_id PK, common_name, scientific_name, origin_country, user_id FK)
  ├── 1:N ──> [sections] (section_id PK, section_name, user_id FK)
  ├── 1:N ──> [suppliers] (supplier_id PK, company, email, phone, address, user_id FK)
  └── 1:N ──> [plants] (plant_id PK, species_id FK, section_id FK, supplier_id FK, owner_id FK, acquire_date, health_status)
                ├── 1:N ──> [waterings] (water_id PK, plant_id FK, date, amount)
                ├── 1:N ──> [fertilizer] (fertilizer_id PK, plant_id FK, name, date, amount)
                ├── 1:N ──> [maintenance_logs] (log_id PK, plant_id FK, activity_type, date, note)
                ├── 1:N ──> [growth_records] (growth_id PK, plant_id FK, date, height, growth_stage, leaf_count)
                └── M:N ──> [suffering_from] (plant_id PK/FK, disease_id PK/FK)
                              └── [diseases] (disease_id PK, disease_name, detect_date, recovery_status, heal_date)
                                    └── 1:N ──> [treatments] (treat_id PK, disease_id FK, medicine, treat_date)

[sections] ── 1:N ──> [environment_records] (env_id PK, section_id FK, date, temperature, humidity, light_level)
```

---

## ⚙️ Base Configuration

- **Default Base URL**: `http://localhost:8000`
- **Config File**: `src/api/endpoints.ts`
- **Authentication**: JWT Bearer Token in HTTP Header:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Content-Type**: `application/json`

---

## 📑 Endpoints Overview Table

| Category | Method | Path | Target Table(s) | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/auth/register` | `users` | Register a new user |
| **Auth** | `POST` | `/auth/login` | `users` | Authenticate and return JWT token |
| **Auth** | `GET` | `/auth/me` | `users` | Get authenticated user info |
| **Dashboard** | `GET` | `/dashboard/overview` | *Aggregated* | Real-time counts, averages, recent logs |
| **Plants** | `GET` | `/plants` | `plants`, `species`, `sections`, `suppliers`, `users` | List all plants with joined names |
| **Plants** | `POST` | `/plants` | `plants` | Insert a new plant specimen |
| **Plants** | `GET` | `/plants/{plant_id}` | `plants` + care, growth, pathology joins | Get complete profile & history of a plant |
| **Plants** | `PUT` | `/plants/{plant_id}` | `plants` | Update specimen section, health, etc. |
| **Plants** | `DELETE` | `/plants/{plant_id}` | `plants` | Delete a plant record |
| **Species** | `GET` | `/species` | `species` | List botanical species |
| **Species** | `POST` | `/species` | `species` | Add a new botanical species |
| **Species** | `PUT` | `/species/{species_id}` | `species` | Update species details |
| **Species** | `DELETE` | `/species/{species_id}` | `species` | Delete a species |
| **Sections** | `GET` | `/sections` | `sections`, `environment_records` | List sections with current telemetry |
| **Sections** | `POST` | `/sections` | `sections` | Create a new greenhouse section |
| **Sections** | `DELETE` | `/sections/{section_id}` | `sections` | Delete a greenhouse section |
| **Environment** | `GET` | `/environment/records` | `environment_records`, `sections` | Query historical sensor logs |
| **Environment** | `POST` | `/environment/records` | `environment_records` | Log new environmental readings |
| **Watering** | `GET` | `/care/waterings` | `waterings`, `plants` | List all watering events |
| **Watering** | `POST` | `/care/waterings` | `waterings` | Log watering event |
| **Watering** | `DELETE` | `/care/waterings/{water_id}` | `waterings` | Delete watering log |
| **Fertilizer** | `GET` | `/care/fertilizer` | `fertilizer`, `plants` | List all fertilizer logs |
| **Fertilizer** | `POST` | `/care/fertilizer` | `fertilizer` | Log fertilizer application |
| **Fertilizer** | `DELETE` | `/care/fertilizer/{fertilizer_id}` | `fertilizer` | Delete fertilizer log |
| **Growth** | `GET` | `/growth` | `growth_records`, `plants` | List growth tracker records |
| **Growth** | `POST` | `/growth` | `growth_records` | Add growth measurement |
| **Growth** | `GET` | `/growth/{plant_id}/report` | `growth_records` | Get progression report for a plant |
| **Diseases** | `GET` | `/diseases` | `diseases`, `suffering_from`, `plants`, `treatments` | List pathology records with plant & treatments |
| **Diseases** | `POST` | `/diseases` | `diseases`, `suffering_from` | Register disease & link to plant |
| **Diseases** | `PUT` | `/diseases/{disease_id}` | `diseases` | Update status (`ongoing`, `treating`, `recovered`), `heal_date` |
| **Diseases** | `DELETE` | `/diseases/{disease_id}` | `diseases`, `suffering_from`, `treatments` | Delete disease record |
| **Treatments** | `POST` | `/diseases/{disease_id}/treatments` | `treatments` | Log treatment for a disease |
| **Maintenance** | `GET` | `/maintenance` | `maintenance_logs`, `plants` | List maintenance activity logs |
| **Maintenance** | `POST` | `/maintenance` | `maintenance_logs` | Log maintenance activity |
| **Maintenance** | `DELETE` | `/maintenance/{log_id}` | `maintenance_logs` | Delete maintenance activity log |
| **Suppliers** | `GET` | `/suppliers` | `suppliers` | List botanical suppliers |
| **Suppliers** | `POST` | `/suppliers` | `suppliers` | Register a supplier company |
| **Suppliers** | `PUT` | `/suppliers/{supplier_id}` | `suppliers` | Update supplier details |
| **Suppliers** | `DELETE` | `/suppliers/{supplier_id}` | `suppliers` | Delete supplier |
| **Requests** | `GET` | `/requests/suppliers-by-species/{species_id}` | `suppliers`, `plants`, `species` | Find suppliers carrying plants of a species |

---

## 🔍 Detailed Endpoint Contracts & Schema Mappings

### 1. Authentication (`users` Table)

#### `POST /auth/register`
- **Target Table**: `users` (`user_id`, `username`, `email`, `password`)
```json
// Request Body
{
  "username": "dr_thorne",
  "email": "thorne@botanical.org",
  "password": "SecurePassword123!"
}

// Response (201 Created)
{
  "user_id": "USR-001",
  "username": "dr_thorne",
  "email": "thorne@botanical.org"
}
```

#### `POST /auth/login`
```json
// Request Body
{
  "username": "thorne@botanical.org",
  "password": "SecurePassword123!"
}

// Response (200 OK)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": "USR-001",
    "username": "dr_thorne",
    "email": "thorne@botanical.org"
  }
}
```

---

### 2. Plants (`plants` Table)

- **Schema**: `plant_id` (PK), `species_id` (FK), `section_id` (FK), `supplier_id` (FK), `owner_id` (FK -> `users.user_id`), `acquire_date`, `health_status` (`healthy` | `recovering` | `sick`)

#### `GET /plants`
Returns plant records with joined species, section, supplier, and owner metadata.
```json
// Response (200 OK)
[
  {
    "plant_id": "PT-1001",
    "species_id": "SPC-0001",
    "common_name": "Monstera Deliciosa Albo",
    "scientific_name": "Monstera deliciosa var. borsigiana",
    "family": "Araceae",
    "section_id": "SEC-A01",
    "section_name": "Tropical Rainforest Zone",
    "supplier_id": "SUP-001",
    "supplier_name": "Exotic Flora Imports Co.",
    "acquire_date": "2026-01-15",
    "health_status": "healthy",
    "owner_id": "USR-001",
    "owner_name": "Dr. E. Thorne"
  }
]
```

#### `POST /plants`
```json
// Request Body
{
  "species_id": "SPC-0001",
  "section_id": "SEC-A01",
  "supplier_id": "SUP-001",
  "acquire_date": "2026-08-26",
  "health_status": "healthy",
  "owner_id": "USR-001"
}
```

#### `GET /plants/{plant_id}`
Returns the plant joined with its related child tables:
- `waterings` (`water_id`, `date`, `amount`)
- `fertilizer` (`fertilizer_id`, `name`, `date`, `amount`)
- `maintenance_logs` (`log_id`, `activity_type`, `date`, `note`)
- `growth_records` (`growth_id`, `date`, `height`, `growth_stage`, `leaf_count`)
- `suffering_from` ➔ `diseases` ➔ `treatments`

---

### 3. Species (`species` Table)

- **Schema**: `species_id` (PK), `common_name`, `scientific_name`, `origin_country`, `user_id` (FK -> `users.user_id`)

#### `GET /species`
```json
// Response (200 OK)
[
  {
    "species_id": "SPC-0001",
    "common_name": "Variegated Monstera Albo",
    "scientific_name": "Monstera deliciosa var. borsigiana",
    "origin_country": "Mexico",
    "user_id": "USR-001",
    "plant_count": 6,
    "is_user_owned": true
  }
]
```

#### `POST /species`
```json
// Request Body
{
  "common_name": "Queen Anthurium",
  "scientific_name": "Anthurium regale",
  "origin_country": "Peru",
  "user_id": "USR-001"
}
```

---

### 4. Sections (`sections` Table)

- **Schema**: `section_id` (PK), `section_name`, `user_id` (FK -> `users.user_id`)

#### `GET /sections`
```json
// Response (200 OK)
[
  {
    "section_id": "SEC-A01",
    "section_name": "Tropical Rainforest Zone",
    "user_id": "USR-001",
    "temperature": 26.5,
    "humidity": 82.0,
    "light_level": 920,
    "plant_count": 14
  }
]
```

#### `POST /sections`
```json
// Request Body
{
  "section_name": "Highland Orchid House",
  "user_id": "USR-001"
}
```

---

### 5. Environment Monitoring (`environment_records` Table)

- **Schema**: `env_id` (PK), `section_id` (FK -> `sections.section_id`), `date`, `temperature` (decimal), `humidity` (decimal), `light_level` (decimal)

#### `GET /environment/records`
Query parameters: `section_id`, `search`, `sort_by`.
```json
// Response (200 OK)
[
  {
    "env_id": "ENV-1001",
    "section_id": "SEC-A01",
    "section_name": "Tropical Rainforest Zone",
    "date": "2026-08-25",
    "temperature": 26.5,
    "humidity": 82.0,
    "light_level": 920.0
  }
]
```

#### `POST /environment/records`
```json
// Request Body
{
  "section_id": "SEC-A01",
  "date": "2026-08-26",
  "temperature": 26.8,
  "humidity": 81.5,
  "light_level": 940.0
}
```

---

### 6. Care: Waterings & Fertilizer (`waterings` & `fertilizer` Tables)

- **`waterings` Schema**: `water_id` (PK), `plant_id` (FK -> `plants.plant_id`), `date`, `amount` (decimal)
- **`fertilizer` Schema**: `fertilizer_id` (PK), `plant_id` (FK -> `plants.plant_id`), `name`, `date`, `amount` (decimal)

#### `POST /care/waterings`
```json
// Request Body
{
  "plant_id": "PT-1001",
  "date": "2026-08-26",
  "amount": 350.0
}
```

#### `POST /care/fertilizer`
```json
// Request Body
{
  "plant_id": "PT-1001",
  "name": "Organic NPK 10-10-10",
  "date": "2026-08-26",
  "amount": 15.5
}
```

---

### 7. Growth Records (`growth_records` Table)

- **Schema**: `growth_id` (PK), `plant_id` (FK -> `plants.plant_id`), `date`, `height` (decimal), `growth_stage` (string), `leaf_count` (integer)

#### `POST /growth`
```json
// Request Body
{
  "plant_id": "PT-1001",
  "date": "2026-08-26",
  "height": 48.0,
  "growth_stage": "Vegetative",
  "leaf_count": 9
}
```

---

### 8. Pathology: Diseases, Suffering From & Treatments

- **`diseases` Schema**: `disease_id` (PK), `disease_name`, `detect_date`, `recovery_status` (`ongoing` | `treating` | `recovered`), `heal_date` (date/null)
- **`suffering_from` Schema**: `plant_id` (PK, FK -> `plants.plant_id`), `disease_id` (PK, FK -> `diseases.disease_id`)
- **`treatments` Schema**: `treat_id` (PK), `disease_id` (FK -> `diseases.disease_id`), `medicine`, `treat_date`

#### `GET /diseases`
Returns diseases joined with the associated plant (via `suffering_from`) and clinical treatment history:
```json
// Response (200 OK)
[
  {
    "disease_id": "DIS-001",
    "disease_name": "Root Rot (Pythium)",
    "plant_id": "PT-1003",
    "plant_name": "Ghost Orchid",
    "detect_date": "2026-08-10",
    "recovery_status": "treating",
    "heal_date": null,
    "treatments": [
      {
        "treat_id": "TRT-001",
        "disease_id": "DIS-001",
        "medicine": "Hydrogen Peroxide (3%) flush",
        "treat_date": "2026-08-11"
      }
    ]
  }
]
```

#### `POST /diseases`
Creates a `diseases` record and creates the `suffering_from` link to `plant_id`.
```json
// Request Body
{
  "disease_name": "Spider Mite Infestation",
  "plant_id": "PT-1005",
  "detect_date": "2026-08-26",
  "recovery_status": "ongoing"
}
```

#### `POST /diseases/{disease_id}/treatments`
Inserts a record into `treatments`.
```json
// Request Body
{
  "medicine": "Organic Cold-Pressed Neem Oil",
  "treat_date": "2026-08-26"
}
```

---

### 9. Maintenance Logs (`maintenance_logs` Table)

- **Schema**: `log_id` (PK), `plant_id` (FK -> `plants.plant_id`), `activity_type`, `date`, `note`

#### `POST /maintenance`
```json
// Request Body
{
  "plant_id": "PT-1001",
  "activity_type": "Pruning",
  "date": "2026-08-26",
  "note": "Trimmed 4 yellowing lower leaves."
}
```

---

### 10. Suppliers (`suppliers` Table)

- **Schema**: `supplier_id` (PK), `company`, `email`, `phone`, `address`, `user_id` (FK -> `users.user_id`)

#### `GET /suppliers`
```json
// Response (200 OK)
[
  {
    "supplier_id": "SUP-001",
    "company": "Exotic Flora Imports Co.",
    "email": "sales@exoticflora.com",
    "phone": 15550199,
    "address": "452 Botanical Way, Miami, FL",
    "user_id": "USR-001",
    "plants_supplied": 18
  }
]
```

#### `GET /requests/suppliers-by-species/{species_id}`
Returns all supplier profiles who supply plant specimens belonging to `species_id` (query: `plants.species_id = :species_id JOIN suppliers ON plants.supplier_id = suppliers.supplier_id`).
