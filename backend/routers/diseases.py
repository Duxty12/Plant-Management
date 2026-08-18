import uuid
from fastapi import APIRouter, Depends
from backend.database import get_db, run_query
from backend.schemas import DiseaseIn, SufferingFromIn, TreatmentIn
from backend.dependencies import get_current_user

router = APIRouter(prefix="/diseases", tags=["diseases"])

@router.post("", status_code=201)
def create_disease(d: DiseaseIn, conn=Depends(get_db), user=Depends(get_current_user)):
    disease_id = str(uuid.uuid4())
    run_query(
        conn,
        "INSERT INTO diseases (disease_id, detect_date, recovery_status, heal_date) VALUES (%s,%s,%s,%s)",
        (disease_id, d.detect_date, d.recovery_status, d.heal_date), commit=True
    )
    return {"disease_id": disease_id}

@router.post("/assign", status_code=201)
def assign_disease(s: SufferingFromIn, conn=Depends(get_db), user=Depends(get_current_user)):
    run_query(
        conn, "INSERT INTO suffering_from (plant_id, disease_id) VALUES (%s,%s)",
        (s.plant_id, s.disease_id), commit=True
    )
    return {"detail": "assigned"}

@router.get("/plant/{plant_id}")
def get_plant_diseases(plant_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    return run_query(
        conn,
        """SELECT d.* FROM diseases d
           JOIN suffering_from sf ON sf.disease_id = d.disease_id
           WHERE sf.plant_id = %s""",
        (plant_id,), fetch_all=True
    )

@router.post("/treatments", status_code=201)
def add_treatment(t: TreatmentIn, conn=Depends(get_db), user=Depends(get_current_user)):
    treat_id = str(uuid.uuid4())
    run_query(
        conn,
        "INSERT INTO treatments (treat_id, disease_id, medicine, treat_date) VALUES (%s,%s,%s,%s)",
        (treat_id, t.disease_id, t.medicine, t.treat_date), commit=True
    )
    return {"treat_id": treat_id}

@router.get("/{disease_id}/treatments")
def get_treatments(disease_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    return run_query(conn, "SELECT * FROM treatments WHERE disease_id=%s", (disease_id,), fetch_all=True)