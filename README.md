# Exotic greenhouse monitoring system


## Database Table Creation:
```sql
CREATE TABLE users (
    user_id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE species (
    species_id VARCHAR(20) PRIMARY KEY,
    common_name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    origin_country VARCHAR(100),
    user_id VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE sections (
    section_id VARCHAR(20) PRIMARY KEY,
    section_name VARCHAR(100) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE suppliers (
    supplier_id VARCHAR(20) PRIMARY KEY,
    company VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    user_id VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE plants (
    plant_id VARCHAR(20) PRIMARY KEY,
    species_id VARCHAR(20) NOT NULL,
    section_id VARCHAR(20),
    supplier_id VARCHAR(20),
    owner_id VARCHAR(20) NOT NULL,
    acquire_date DATE,
    health_status VARCHAR(50),
    FOREIGN KEY (species_id) REFERENCES species(species_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE waterings (
    water_id VARCHAR(20) PRIMARY KEY,
    plant_id VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(6,2),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE CASCADE
);

CREATE TABLE fertilizer (
    fertilizer_id VARCHAR(20) PRIMARY KEY,
    plant_id VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    date DATE,
    amount DECIMAL(6,2),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE CASCADE
);

CREATE TABLE maintenance_logs (
    log_id VARCHAR(20) PRIMARY KEY,
    plant_id VARCHAR(20) NOT NULL,
    activity_type VARCHAR(100),
    date DATE,
    note TEXT,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE CASCADE
);

CREATE TABLE growth_records (
    growth_id VARCHAR(20) PRIMARY KEY,
    plant_id VARCHAR(20) NOT NULL,
    date DATE,
    height DECIMAL(6,2),
    growth_stage VARCHAR(50),
    leaf_count INT,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE CASCADE
);

CREATE TABLE environment_records (
    env_id VARCHAR(20) PRIMARY KEY,
    section_id VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    light_level DECIMAL(6,2),
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE
);

CREATE TABLE diseases (
    disease_id VARCHAR(20) PRIMARY KEY,
    disease_name VARCHAR(150) NOT NULL,
    detect_date DATE,
    recovery_status VARCHAR(50) DEFAULT 'ongoing',
    heal_date DATE
);

CREATE TABLE suffering_from (
    plant_id VARCHAR(20),
    disease_id VARCHAR(20),
    PRIMARY KEY (plant_id, disease_id),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE CASCADE,
    FOREIGN KEY (disease_id) REFERENCES diseases(disease_id) ON DELETE CASCADE
);

CREATE TABLE treatments (
    treat_id VARCHAR(20) PRIMARY KEY,
    disease_id VARCHAR(20),
    medicine VARCHAR(150),
    treat_date DATE,
    FOREIGN KEY (disease_id) REFERENCES diseases(disease_id) ON DELETE CASCADE
);
```