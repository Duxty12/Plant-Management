import uuid
from fastapi import APIRouter, Depends
from backend.database import get_db, run_query
from backend.schemas import MaintenanceLogIn
from backend.dependencies import get_current_user

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.post("", status_code=201)
def add_log(log: MaintenanceLogIn, conn=Depends(get_db), user=Depends(get_current_user)):
    log_id = str(uuid.uuid4())
    run_query(
        conn,
        "INSERT INTO maintenance_logs (log_id, activity_type, date, note, plant_id) VALUES (%s,%s,%s,%s,%s)",
        (log_id, log.activity_type, log.date, log.note, log.plant_id), commit=True
    )
    return {"log_id": log_id}

@router.get("/{plant_id}")
def get_logs(plant_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    return run_query(conn, "SELECT * FROM maintenance_logs WHERE plant_id=%s ORDER BY date DESC",
                      (plant_id,), fetch_all=True)