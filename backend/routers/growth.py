import uuid
from fastapi import APIRouter, Depends
from backend.database import get_db, run_query
from backend.schemas import GrowthRecordIn
from backend.dependencies import get_current_user

router = APIRouter(prefix="/growth", tags=["growth"])

@router.post("", status_code=201)
def add_growth(g: GrowthRecordIn, conn=Depends(get_db), user=Depends(get_current_user)):
    growth_id = str(uuid.uuid4())
    run_query(
        conn,
        """INSERT INTO growth_records (growth_id, date, height, growth_stage, leaf_count, plant_id)
           VALUES (%s,%s,%s,%s,%s,%s)""",
        (growth_id, g.date, g.height, g.growth_stage, g.leaf_count, g.plant_id), commit=True
    )
    return {"growth_id": growth_id}

@router.get("/{plant_id}/report")
def growth_report(plant_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    """Returns time-series data for charting plant growth."""
    return run_query(
        conn,
        "SELECT date, height, growth_stage, leaf_count FROM growth_records WHERE plant_id=%s ORDER BY date ASC",
        (plant_id,), fetch_all=True
    )