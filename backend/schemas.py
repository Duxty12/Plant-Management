from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SpeciesIn(BaseModel):
    common_name: str
    scientific_name: Optional[str] = None
    origin_country: Optional[str] = None

class SupplierIn(BaseModel):
    company: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class SectionIn(BaseModel):
    section_name: str
    env_id: Optional[str] = None

class EnvironmentRecordIn(BaseModel):
    date: date
    temperature: float
    humidity: float
    light_level: float

class PlantIn(BaseModel):
    species_id: str
    supplier_id: Optional[str] = None
    acquire_date: date
    health_status: str
    section_id: Optional[str] = None

class WateringIn(BaseModel):
    plant_id: str
    date: date
    amount: float

class FertilizerIn(BaseModel):
    plant_id: str
    name: str
    date: date
    amount: float

class MaintenanceLogIn(BaseModel):
    plant_id: str
    activity_type: str
    date: date
    note: Optional[str] = None

class GrowthRecordIn(BaseModel):
    plant_id: str
    date: date
    height: float
    growth_stage: str
    leaf_count: int

class DiseaseIn(BaseModel):
    detect_date: date
    recovery_status: str = "ongoing"
    heal_date: Optional[date] = None

class SufferingFromIn(BaseModel):
    plant_id: str
    disease_id: str

class TreatmentIn(BaseModel):
    disease_id: str
    medicine: str
    treat_date: date
