import uuid
from fastapi import APIRouter, Depends
from backend.database import get_db, run_query
from backend.schemas import EnvironmentRecordIn
from backend.dependencies import get_current_user

router = APIRouter(prefix="/environment", tags=["environment"], dependencies=[Depends(get_current_user)])

@router.post("/records", status_code=201)
def add_record(rec: EnvironmentRecordIn, conn=Depends(get_db)):
    env_id = str(uuid.uuid4())
    run_query(
        conn,
        "INSERT INTO environment_records (env_id, date, temperature, humidity, light_level) VALUES (%s,%s,%s,%s,%s)",
        (env_id, rec.date, rec.temperature, rec.humidity, rec.light_level),
        commit=True
    )
    return {"env_id": env_id}

@router.get("/records")
def list_records(conn=Depends(get_db)):
    return run_query(conn, "SELECT * FROM environment_records ORDER BY date DESC", fetch_all=True)

@router.get("/records/{env_id}")
def get_record(env_id: str, conn=Depends(get_db)):
    return run_query(conn, "SELECT * FROM environment_records WHERE env_id=%s", (env_id,), fetch_one=True)

@router.get("/records/section/{section_id}")
def get_section_records(section_id: str, conn=Depends(get_db)):
    return run_query(
        conn,
        """SELECT er.* FROM environment_records er
           JOIN sections s ON s.env_id = er.env_id
           WHERE s.section_id = %s
           ORDER BY er.date DESC""",
        (section_id,), fetch_all=True
    )