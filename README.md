# Exotic greenhouse monitoring system


## Database Table Creation:
```sql
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE suppliers (
    supplier_id VARCHAR(36) PRIMARY KEY,
    company VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255)
);

CREATE TABLE species (
    species_id VARCHAR(36) PRIMARY KEY,
    common_name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    origin_country VARCHAR(100)
);

CREATE TABLE environment_records (
    env_id VARCHAR(36) PRIMARY KEY,
    date DATE NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    light_level DECIMAL(5,2)
);

CREATE TABLE sections (
    section_id VARCHAR(36) PRIMARY KEY,
    section_name VARCHAR(100) UNIQUE NOT NULL,
    env_id VARCHAR(36),
    FOREIGN KEY (env_id) REFERENCES environment_records(env_id)
);

CREATE TABLE plants (
    plant_id VARCHAR(36) PRIMARY KEY,
    species_id VARCHAR(36) NOT NULL,
    supplier_id VARCHAR(36),
    acquire_date DATE,
    health_status VARCHAR(50),
    owner_id VARCHAR(36),
    section_id VARCHAR(36),
    FOREIGN KEY (species_id) REFERENCES species(species_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (owner_id) REFERENCES users(user_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id)
);

CREATE TABLE waterings (
    water_id VARCHAR(36) PRIMARY KEY,
    plant_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(6,2),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);

CREATE TABLE fertilizer (
    fertilizer_id VARCHAR(36) PRIMARY KEY,
    plant_id VARCHAR(36) NOT NULL,
    name VARCHAR(100),
    date DATE,
    amount DECIMAL(6,2),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);

CREATE TABLE maintenance_logs (
    log_id VARCHAR(36) PRIMARY KEY,
    activity_type VARCHAR(100),
    date DATE,
    note TEXT,
    plant_id VARCHAR(36),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);

CREATE TABLE growth_records (
    growth_id VARCHAR(36) PRIMARY KEY,
    date DATE,
    height DECIMAL(6,2),
    growth_stage VARCHAR(50),
    leaf_count INT,
    plant_id VARCHAR(36),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);

CREATE TABLE diseases (
    disease_id VARCHAR(36) PRIMARY KEY,
    detect_date DATE,
    recovery_status VARCHAR(50),
    heal_date DATE
);

CREATE TABLE suffering_from (
    plant_id VARCHAR(36),
    disease_id VARCHAR(36),
    PRIMARY KEY (plant_id, disease_id),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    FOREIGN KEY (disease_id) REFERENCES diseases(disease_id)
);

CREATE TABLE treatments (
    treat_id VARCHAR(36) PRIMARY KEY,
    disease_id VARCHAR(36),
    medicine VARCHAR(150),
    treat_date DATE,
    FOREIGN KEY (disease_id) REFERENCES diseases(disease_id)
);
```