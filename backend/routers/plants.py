import uuid
import requests
from typing import Optional
from fastapi import APIRouter, Request , Depends, HTTPException, Query
from backend.database import get_db, run_query
from backend.schemas import PlantIn
from backend.dependencies import get_current_user

router = APIRouter(prefix="/plants", tags=["plants"], dependencies=[Depends(get_current_user)])

@router.post("", status_code=201)
def create_plant(plant: PlantIn, conn=Depends(get_db), user=Depends(get_current_user)):
    plant_id = str(uuid.uuid4())
    run_query(
        conn,
        """INSERT INTO plants (plant_id, species_id, supplier_id, acquire_date,
           health_status, owner_id, section_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        (plant_id, plant.species_id, plant.supplier_id, plant.acquire_date,
         plant.health_status, user["user_id"], plant.section_id),
        commit=True
    )
    return {"plant_id": plant_id}

@router.get("")
def list_plants(conn=Depends(get_db), user=Depends(get_current_user)):
    return run_query(
        conn,
        """SELECT p.*, s.common_name, s.scientific_name
           FROM plants p JOIN species s ON p.species_id = s.species_id
           WHERE p.owner_id = %s""",
        (user["user_id"],), fetch_all=True
    )

@router.get("/search")
def search_plants(
    q: Optional[str] = Query(None, description="search by species name or health status"),
    section_id: Optional[str] = None,
    health_status: Optional[str] = None,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    query = """
        SELECT p.*, s.common_name, s.scientific_name
        FROM plants p
        JOIN species s ON p.species_id = s.species_id
        WHERE p.owner_id = %s
    """
    params = [user["user_id"]]

    if q:
        query += " AND (s.common_name LIKE %s OR s.scientific_name LIKE %s)"
        params += [f"%{q}%", f"%{q}%"]
    if section_id:
        query += " AND p.section_id = %s"
        params.append(section_id)
    if health_status:
        query += " AND p.health_status = %s"
        params.append(health_status)

    return run_query(conn, query, tuple(params), fetch_all=True)

@router.get("/{plant_id}")
def get_plant(plant_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    plant = run_query(
        conn,
        """SELECT p.*, s.common_name, s.scientific_name
           FROM plants p JOIN species s ON p.species_id = s.species_id
           WHERE p.plant_id=%s AND p.owner_id=%s""",
        (plant_id, user["user_id"]), fetch_one=True
    )
    if not plant:
        raise HTTPException(404, "Plant not found")
    return plant

@router.put("/{plant_id}")
def update_plant(plant_id: str, plant: PlantIn, conn=Depends(get_db), user=Depends(get_current_user)):
    run_query(
        conn,
        """UPDATE plants SET species_id=%s, supplier_id=%s, acquire_date=%s,
           health_status=%s, section_id=%s
           WHERE plant_id=%s AND owner_id=%s""",
        (plant.species_id, plant.supplier_id, plant.acquire_date,
         plant.health_status, plant.section_id, plant_id, user["user_id"]),
        commit=True
    )
    return {"detail": "updated"}

@router.delete("/{plant_id}")
def delete_plant(plant_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    run_query(conn, "DELETE FROM plants WHERE plant_id=%s AND owner_id=%s",
              (plant_id, user["user_id"]), commit=True)
    return {"detail": "deleted"}