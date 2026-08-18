import uuid
from fastapi import APIRouter, Depends
from backend.database import get_db, run_query
from backend.schemas import SpeciesIn
from backend.dependencies import get_current_user

router = APIRouter(prefix="/species", tags=["species"])

@router.post("", status_code=201)
def create_species(species: SpeciesIn, conn=Depends(get_db), user=Depends(get_current_user)):
    species_id = str(uuid.uuid4())
    run_query(
        conn,
        "INSERT INTO species (species_id, common_name, scientific_name, origin_country) VALUES (%s,%s,%s,%s)",
        (species_id, species.common_name, species.scientific_name, species.origin_country),
        commit=True
    )
    return {"species_id": species_id}

@router.get("")
def list_species(conn=Depends(get_db), user=Depends(get_current_user)):
    return run_query(conn, "SELECT * FROM species", fetch_all=True)