from fastapi import APIRouter, Depends
from backend.database import get_db, run_query
from backend.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])

@router.get("/overview")
def overview(conn=Depends(get_db), user=Depends(get_current_user)):
    total_plants = run_query(conn, "SELECT COUNT(*) AS count FROM plants WHERE owner_id=%s",
                              (user["user_id"],), fetch_one=True)["count"]

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

    return {
        "total_plants": total_plants,
        "sick_plants": sick_plants,
        "recent_waterings": recent_waterings,
    }