import uuid
from fastapi import APIRouter, Depends
from backend.database import get_db, run_query
from backend.schemas import WateringIn, FertilizerIn
from backend.dependencies import get_current_user

router = APIRouter(prefix="/care", tags=["care"])

@router.post("/waterings", status_code=201)
def add_watering(w: WateringIn, conn=Depends(get_db), user=Depends(get_current_user)):
    water_id = str(uuid.uuid4())
    run_query(
        conn, "INSERT INTO waterings (water_id, plant_id, date, amount) VALUES (%s,%s,%s,%s)",
        (water_id, w.plant_id, w.date, w.amount), commit=True
    )
    return {"water_id": water_id}

@router.get("/waterings/{plant_id}")
def get_waterings(plant_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    return run_query(conn, "SELECT * FROM waterings WHERE plant_id=%s ORDER BY date DESC",
                      (plant_id,), fetch_all=True)

@router.post("/fertilizer", status_code=201)
def add_fertilizer(f: FertilizerIn, conn=Depends(get_db), user=Depends(get_current_user)):
    fertilizer_id = str(uuid.uuid4())
    run_query(
        conn,
        "INSERT INTO fertilizer (fertilizer_id, plant_id, name, date, amount) VALUES (%s,%s,%s,%s,%s)",
        (fertilizer_id, f.plant_id, f.name, f.date, f.amount), commit=True
    )
    return {"fertilizer_id": fertilizer_id}

@router.get("/fertilizer/{plant_id}")
def get_fertilizer(plant_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    return run_query(conn, "SELECT * FROM fertilizer WHERE plant_id=%s ORDER BY date DESC",
                      (plant_id,), fetch_all=True)