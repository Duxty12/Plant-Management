from fastapi import APIRouter, Depends
from backend.database import get_db, run_query
from backend.schemas import MaintenanceLogIn
from backend.dependencies import get_current_user
from backend.id_generator import generate_id


router = APIRouter(
    prefix="/maintenance",
    tags=["maintenance"],
    dependencies=[Depends(get_current_user)]
)


@router.get("")
def list_maintenance(conn=Depends(get_db)):
    return run_query(
        conn,
        """
        SELECT
            m.*,
            sp.common_name AS plant_name
        FROM maintenance_logs m
        JOIN plants p
            ON m.plant_id = p.plant_id
        JOIN species sp
            ON p.species_id = sp.species_id
        ORDER BY m.date DESC
        """,
        fetch_all=True
    )


@router.post("", status_code=201)
def add_log(log: MaintenanceLogIn, conn=Depends(get_db)):
    log_id = generate_id(conn, "maintenance_logs", "log_id", "ML-", pad=4)

    run_query(
        conn,
        """
        INSERT INTO maintenance_logs
            (log_id, plant_id, activity_type, date, note)
        VALUES
            (%s, %s, %s, %s, %s)
        """,
        (
            log_id,
            log.plant_id,
            log.activity_type,
            log.date,
            log.note,
        ),
        commit=True
    )

    return {
        "log_id": log_id,
        **log.dict()
    }


@router.delete("/{log_id}")
def delete_log(log_id: str, conn=Depends(get_db)):
    run_query(
        conn,
        "DELETE FROM maintenance_logs WHERE log_id=%s",
        (log_id,),
        commit=True
    )

    return {"detail": "deleted"}