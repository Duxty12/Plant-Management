from typing import Optional
from fastapi import APIRouter, Depends, Query
from backend.database import get_db, run_query
from backend.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


def _activity_union_query(where_extra: str = "") -> str:
    return f"""
        SELECT 'watering' AS activity_type, w.water_id AS activity_id, w.plant_id,
               sp.common_name AS plant_name, w.date AS date,
               CONCAT('Watered with ', w.amount, 'ml') AS description
        FROM waterings w
        JOIN plants p ON w.plant_id = p.plant_id
        JOIN species sp ON p.species_id = sp.species_id
        WHERE p.owner_id = %s

        UNION ALL

        SELECT 'fertilizer' AS activity_type, f.fertilizer_id AS activity_id, f.plant_id,
               sp.common_name AS plant_name, f.date AS date,
               CONCAT('Applied ', f.name, ' (', f.amount, 'g)') AS description
        FROM fertilizer f
        JOIN plants p ON f.plant_id = p.plant_id
        JOIN species sp ON p.species_id = sp.species_id
        WHERE p.owner_id = %s

        UNION ALL

        SELECT 'maintenance' AS activity_type, m.log_id AS activity_id, m.plant_id,
               sp.common_name AS plant_name, m.date AS date,
               CONCAT(m.activity_type, COALESCE(CONCAT(' — ', m.note), '')) AS description
        FROM maintenance_logs m
        JOIN plants p ON m.plant_id = p.plant_id
        JOIN species sp ON p.species_id = sp.species_id
        WHERE p.owner_id = %s

        UNION ALL

        SELECT 'growth' AS activity_type, g.growth_id AS activity_id, g.plant_id,
               sp.common_name AS plant_name, g.date AS date,
               CONCAT('Growth logged: ', g.height, 'cm, ', g.leaf_count, ' leaves (', g.growth_stage, ')') AS description
        FROM growth_records g
        JOIN plants p ON g.plant_id = p.plant_id
        JOIN species sp ON p.species_id = sp.species_id
        WHERE p.owner_id = %s

        UNION ALL

        SELECT 'disease' AS activity_type, d.disease_id AS activity_id, sf.plant_id,
               sp.common_name AS plant_name, d.detect_date AS date,
               CONCAT(d.disease_name, ' detected (', d.recovery_status, ')') AS description
        FROM diseases d
        JOIN suffering_from sf ON sf.disease_id = d.disease_id
        JOIN plants p ON p.plant_id = sf.plant_id
        JOIN species sp ON p.species_id = sp.species_id
        WHERE p.owner_id = %s
    """


@router.get("/overview")
def overview(conn=Depends(get_db), user=Depends(get_current_user)):
    total_plants = run_query(
        conn,
        "SELECT COUNT(*) AS count FROM plants WHERE owner_id=%s",
        (user["user_id"],), fetch_one=True
    )["count"]

    sick_plants = run_query(
        conn,
        """SELECT COUNT(DISTINCT sf.plant_id) AS count
           FROM suffering_from sf
           JOIN plants p ON p.plant_id = sf.plant_id
           JOIN diseases d ON d.disease_id = sf.disease_id
           WHERE p.owner_id=%s AND d.recovery_status != 'recovered'""",
        (user["user_id"],), fetch_one=True
    )["count"]

    recent_waterings = run_query(
        conn,
        """SELECT w.* FROM waterings w
           JOIN plants p ON p.plant_id = w.plant_id
           WHERE p.owner_id=%s ORDER BY w.date DESC LIMIT 5""",
        (user["user_id"],), fetch_all=True
    )

    activity_query = _activity_union_query() + " ORDER BY date DESC LIMIT 5"
    recent_activity = run_query(
        conn, activity_query,
        (user["user_id"],) * 5,
        fetch_all=True
    )

    return {
        "total_plants": total_plants,
        "sick_plants": sick_plants,
        "recent_waterings": recent_waterings,
        "recent_activity": recent_activity,
    }


@router.get("/activities")
def list_activities(
    activity_type: Optional[str] = Query(None, description="Filter by type: watering, fertilizer, maintenance, growth, disease"),
    plant_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    query = _activity_union_query()
    params = [user["user_id"]] * 5

    wrapped = f"SELECT * FROM ({query}) AS activities WHERE 1=1"

    if activity_type:
        wrapped += " AND activity_type = %s"
        params.append(activity_type)

    if plant_id:
        wrapped += " AND plant_id = %s"
        params.append(plant_id)

    wrapped += " ORDER BY date DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    return run_query(conn, wrapped, tuple(params), fetch_all=True)