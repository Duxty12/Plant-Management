# 📦 Exotica Plant Management System — Data Import & Export Formats

This guide provides example JSON files for importing and exporting data, strictly structured according to the database relational schema and Chen notation ERD.

---

## 🗄️ Database Entity Schema Reference

| Table Name | Primary Key | Foreign Keys | Attributes & Types |
|---|---|---|---|
| **`users`** | `user_id` (string) | — | `username` (string), `email` (string), `password` (string) |
| **`species`** | `species_id` (string) | `user_id` ➔ `users.user_id` | `common_name` (string), `scientific_name` (string), `origin_country` (string) |
| **`sections`** | `section_id` (string) | `user_id` ➔ `users.user_id` | `section_name` (string) |
| **`suppliers`** | `supplier_id` (string) | `user_id` ➔ `users.user_id` | `company` (string), `email` (string), `phone` (integer), `address` (string) |
| **`plants`** | `plant_id` (string) | `species_id` ➔ `species.species_id`<br>`section_id` ➔ `sections.section_id`<br>`supplier_id` ➔ `suppliers.supplier_id`<br>`owner_id` ➔ `users.user_id` | `acquire_date` (date), `health_status` (string: `healthy` \| `recovering` \| `sick`) |
| **`waterings`** | `water_id` (string) | `plant_id` ➔ `plants.plant_id` | `date` (date), `amount` (decimal) |
| **`fertilizer`** | `fertilizer_id` (string) | `plant_id` ➔ `plants.plant_id` | `name` (string), `date` (date), `amount` (decimal) |
| **`maintenance_logs`** | `log_id` (string) | `plant_id` ➔ `plants.plant_id` | `activity_type` (string), `date` (date), `note` (string) |
| **`growth_records`** | `growth_id` (string) | `plant_id` ➔ `plants.plant_id` | `date` (date), `height` (decimal), `growth_stage` (string), `leaf_count` (integer) |
| **`environment_records`** | `env_id` (string) | `section_id` ➔ `sections.section_id` | `date` (date), `temperature` (decimal), `humidity` (decimal), `light_level` (decimal) |
| **`diseases`** | `disease_id` (string) | — | `disease_name` (string), `detect_date` (date), `recovery_status` (string), `heal_date` (date \| null) |
| **`treatments`** | `treat_id` (string) | `disease_id` ➔ `diseases.disease_id` | `medicine` (string), `treat_date` (date) |
| **`suffering_from`** | `(plant_id, disease_id)` | `plant_id` ➔ `plants.plant_id`<br>`disease_id` ➔ `diseases.disease_id` | *(Junction table for plant-pathogen association)* |

---

## 1. Full Database Relational Export JSON (`exotica_relational_export.json`)

Complete database backup format directly representing all relational tables:

```json
{
  "system_version": "2.4.0",
  "export_timestamp": "2026-08-26T00:00:00Z",
  "users": [
    {
      "user_id": "USR-001",
      "username": "dr_thorne",
      "email": "thorne@botanical.org",
      "password": "$2b$12$e8YQz.hashed_password_string..."
    },
    {
      "user_id": "USR-002",
      "username": "prof_vines",
      "email": "vines@botanical.org",
      "password": "$2b$12$e8YQz.hashed_password_string..."
    }
  ],
  "species": [
    {
      "species_id": "SPC-0001",
      "common_name": "Variegated Monstera Albo",
      "scientific_name": "Monstera deliciosa var. borsigiana",
      "origin_country": "Mexico",
      "user_id": "USR-001"
    },
    {
      "species_id": "SPC-0002",
      "common_name": "Philodendron Pink Princess",
      "scientific_name": "Philodendron erubescens",
      "origin_country": "Colombia",
      "user_id": "USR-001"
    },
    {
      "species_id": "SPC-0003",
      "common_name": "Ghost Orchid",
      "scientific_name": "Dendrophylax lindenii",
      "origin_country": "Cuba",
      "user_id": "USR-002"
    }
  ],
  "sections": [
    {
      "section_id": "SEC-A01",
      "section_name": "Tropical Rainforest Zone",
      "user_id": "USR-001"
    },
    {
      "section_id": "SEC-B02",
      "section_name": "Highland Orchid House",
      "user_id": "USR-001"
    },
    {
      "section_id": "SEC-E05",
      "section_name": "Carnivorous Plant Zone",
      "user_id": "USR-002"
    }
  ],
  "suppliers": [
    {
      "supplier_id": "SUP-001",
      "company": "Exotic Flora Imports Co.",
      "email": "sales@exoticflora.com",
      "phone": 15550199,
      "address": "452 Botanical Way, Miami, FL",
      "user_id": "USR-001"
    },
    {
      "supplier_id": "SUP-002",
      "company": "Amazonian Rare Botanicals",
      "email": "contact@amazonianbotanicals.com",
      "phone": 15550842,
      "address": "12 Rainforest Ave, San Diego, CA",
      "user_id": "USR-001"
    }
  ],
  "plants": [
    {
      "plant_id": "PT-1001",
      "species_id": "SPC-0001",
      "section_id": "SEC-A01",
      "supplier_id": "SUP-001",
      "owner_id": "USR-001",
      "acquire_date": "2026-01-15",
      "health_status": "healthy"
    },
    {
      "plant_id": "PT-1002",
      "species_id": "SPC-0002",
      "section_id": "SEC-A01",
      "supplier_id": "SUP-002",
      "owner_id": "USR-001",
      "acquire_date": "2026-02-20",
      "health_status": "healthy"
    },
    {
      "plant_id": "PT-1003",
      "species_id": "SPC-0003",
      "section_id": "SEC-B02",
      "supplier_id": "SUP-001",
      "owner_id": "USR-002",
      "acquire_date": "2025-11-05",
      "health_status": "sick"
    }
  ],
  "waterings": [
    {
      "water_id": "WAT-0001",
      "plant_id": "PT-1001",
      "date": "2026-08-25",
      "amount": 350.0
    },
    {
      "water_id": "WAT-0002",
      "plant_id": "PT-1002",
      "date": "2026-08-24",
      "amount": 250.0
    }
  ],
  "fertilizer": [
    {
      "fertilizer_id": "FRT-0001",
      "plant_id": "PT-1001",
      "name": "Organic NPK 10-10-10",
      "date": "2026-08-15",
      "amount": 15.5
    },
    {
      "fertilizer_id": "FRT-0002",
      "plant_id": "PT-1002",
      "name": "Liquid Seaweed Extract",
      "date": "2026-08-05",
      "amount": 20.0
    }
  ],
  "maintenance_logs": [
    {
      "log_id": "ML-0001",
      "plant_id": "PT-1001",
      "activity_type": "Pruning",
      "date": "2026-08-24",
      "note": "Trimmed dead leaves from lower canopy"
    },
    {
      "log_id": "ML-0002",
      "plant_id": "PT-1002",
      "activity_type": "Pest Check",
      "date": "2026-08-20",
      "note": "Inspected undersides of leaves — clear"
    }
  ],
  "growth_records": [
    {
      "growth_id": "GRW-2026-0001",
      "plant_id": "PT-1001",
      "date": "2026-06-01",
      "height": 22.0,
      "growth_stage": "Seedling",
      "leaf_count": 3
    },
    {
      "growth_id": "GRW-2026-0002",
      "plant_id": "PT-1001",
      "date": "2026-06-20",
      "height": 28.5,
      "growth_stage": "Vegetative",
      "leaf_count": 5
    }
  ],
  "environment_records": [
    {
      "env_id": "ENV-1001",
      "section_id": "SEC-A01",
      "date": "2026-08-25",
      "temperature": 26.5,
      "humidity": 82.0,
      "light_level": 920.0
    },
    {
      "env_id": "ENV-1002",
      "section_id": "SEC-B02",
      "date": "2026-08-25",
      "temperature": 19.2,
      "humidity": 70.5,
      "light_level": 650.0
    }
  ],
  "diseases": [
    {
      "disease_id": "DIS-001",
      "disease_name": "Root Rot (Pythium)",
      "detect_date": "2026-08-10",
      "recovery_status": "treating",
      "heal_date": null
    },
    {
      "disease_id": "DIS-002",
      "disease_name": "Spider Mite Infestation",
      "detect_date": "2026-06-15",
      "recovery_status": "recovered",
      "heal_date": "2026-07-10"
    }
  ],
  "suffering_from": [
    {
      "plant_id": "PT-1003",
      "disease_id": "DIS-001"
    },
    {
      "plant_id": "PT-1002",
      "disease_id": "DIS-002"
    }
  ],
  "treatments": [
    {
      "treat_id": "TRT-001",
      "disease_id": "DIS-001",
      "medicine": "Hydrogen Peroxide (3%) flush",
      "treat_date": "2026-08-11"
    },
    {
      "treat_id": "TRT-002",
      "disease_id": "DIS-001",
      "medicine": "Mefenoxam Systemic Fungicide",
      "treat_date": "2026-08-18"
    },
    {
      "treat_id": "TRT-003",
      "disease_id": "DIS-002",
      "medicine": "Organic Cold-Pressed Neem Oil",
      "treat_date": "2026-06-16"
    }
  ]
}
```

---

## 2. Table-by-Table Import JSON Files

### 2.1 Plants Import (`plants_import.json`)
```json
[
  {
    "plant_id": "PT-1004",
    "species_id": "SPC-0001",
    "section_id": "SEC-A01",
    "supplier_id": "SUP-001",
    "owner_id": "USR-001",
    "acquire_date": "2026-08-26",
    "health_status": "healthy"
  },
  {
    "plant_id": "PT-1005",
    "species_id": "SPC-0002",
    "section_id": "SEC-B02",
    "supplier_id": "SUP-002",
    "owner_id": "USR-001",
    "acquire_date": "2026-08-26",
    "health_status": "recovering"
  }
]
```

### 2.2 Species Import (`species_import.json`)
```json
[
  {
    "species_id": "SPC-0013",
    "common_name": "Queen Anthurium",
    "scientific_name": "Anthurium regale",
    "origin_country": "Peru",
    "user_id": "USR-001"
  },
  {
    "species_id": "SPC-0014",
    "common_name": "Silver Sword Philodendron",
    "scientific_name": "Philodendron hastatum",
    "origin_country": "Brazil",
    "user_id": "USR-001"
  }
]
```

### 2.3 Sections Import (`sections_import.json`)
```json
[
  {
    "section_id": "SEC-G07",
    "section_name": "Fern & Moss Microclimate",
    "user_id": "USR-001"
  },
  {
    "section_id": "SEC-H08",
    "section_name": "Alpine Rock Garden",
    "user_id": "USR-002"
  }
]
```

### 2.4 Suppliers Import (`suppliers_import.json`)
```json
[
  {
    "supplier_id": "SUP-004",
    "company": "Southeast Asia Greenworks",
    "email": "import@sagreens.sg",
    "phone": 6562345678,
    "address": "21 Jurong Industrial Rd, Singapore",
    "user_id": "USR-001"
  }
]
```

### 2.5 Environment Records Import (`environment_records_import.json`)
```json
[
  {
    "env_id": "ENV-1008",
    "section_id": "SEC-A01",
    "date": "2026-08-26",
    "temperature": 26.8,
    "humidity": 81.5,
    "light_level": 940.0
  },
  {
    "env_id": "ENV-1009",
    "section_id": "SEC-B02",
    "date": "2026-08-26",
    "temperature": 19.4,
    "humidity": 70.8,
    "light_level": 660.0
  }
]
```

### 2.6 Care: Waterings & Fertilizer Import (`care_import.json`)
```json
{
  "waterings": [
    {
      "water_id": "WAT-0007",
      "plant_id": "PT-1001",
      "date": "2026-08-26",
      "amount": 350.0
    }
  ],
  "fertilizer": [
    {
      "fertilizer_id": "FRT-0005",
      "plant_id": "PT-1001",
      "name": "Organic NPK 10-10-10",
      "date": "2026-08-26",
      "amount": 15.5
    }
  ]
}
```

### 2.7 Growth Records Import (`growth_records_import.json`)
```json
[
  {
    "growth_id": "GRW-2026-0011",
    "plant_id": "PT-1001",
    "date": "2026-08-26",
    "height": 48.0,
    "growth_stage": "Vegetative",
    "leaf_count": 9
  }
]
```

### 2.8 Pathology: Diseases, Suffering From & Treatments Import (`diseases_import.json`)
```json
{
  "diseases": [
    {
      "disease_id": "DIS-006",
      "disease_name": "Bacterial Blight",
      "detect_date": "2026-08-26",
      "recovery_status": "treating",
      "heal_date": null
    }
  ],
  "suffering_from": [
    {
      "plant_id": "PT-1001",
      "disease_id": "DIS-006"
    }
  ],
  "treatments": [
    {
      "treat_id": "TRT-008",
      "disease_id": "DIS-006",
      "medicine": "Streptomycin Sulfate Solution",
      "treat_date": "2026-08-26"
    }
  ]
}
```

### 2.9 Maintenance Logs Import (`maintenance_logs_import.json`)
```json
[
  {
    "log_id": "ML-0007",
    "plant_id": "PT-1001",
    "activity_type": "Repotting",
    "date": "2026-08-26",
    "note": "Repotted to a 14-inch terracotta pot with perlite and orchid bark"
  }
]
```
