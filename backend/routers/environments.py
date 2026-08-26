from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db, run_query
from backend.schemas import EnvironmentRecordIn
from backend.dependencies import get_current_user
from backend.id_generator import generate_id

router = APIRouter(
    prefix="/environment",
    tags=["environment"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/records")
def list_records(
    section_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "date",
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    allowed_sort = {
        "date": "er.date",
        "temperature": "er.temperature",
        "humidity": "er.humidity",
        "light_level": "er.light_level"
    }

    sort_col = allowed_sort.get(sort_by, "er.date")

    query = """
        SELECT
            er.env_id,
            er.section_id,
            s.section_name,
            er.date,
            er.temperature,
            er.humidity,
            er.light_level
        FROM environment_records er
        JOIN sections s ON er.section_id = s.section_id
        WHERE s.user_id = %s
    """

    params = [user["user_id"]]

    if section_id:
        query += " AND er.section_id = %s"
        params.append(section_id)

    if search:
        query += """
            AND (
                s.section_name LIKE %s
                OR er.env_id LIKE %s
                OR CAST(er.date AS CHAR) LIKE %s
            )
        """
        search_value = f"%{search}%"
        params.extend([
            search_value,
            search_value,
            search_value
        ])

    query += f" ORDER BY {sort_col} DESC"

    return run_query(
        conn,
        query,
        tuple(params),
        fetch_all=True
    )


@router.post("/records", status_code=201)
def add_record(
    rec: EnvironmentRecordIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    owned_section = run_query(
        conn,
        """
        SELECT section_id
        FROM sections
        WHERE section_id = %s AND user_id = %s
        """,
        (rec.section_id, user["user_id"]),
        fetch_one=True
    )

    if not owned_section:
        raise HTTPException(
            status_code=404,
            detail="Section not found or not owned by you"
        )

    env_id = generate_id(conn, "environment_records", "env_id", "ENV-", pad=4)

    run_query(
        conn,
        """
        INSERT INTO environment_records
        (env_id, section_id, date, temperature, humidity, light_level)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            env_id,
            rec.section_id,
            rec.date,
            rec.temperature,
            rec.humidity,
            rec.light_level
        ),
        commit=True
    )

    return {
        "env_id": env_id,
        "section_id": rec.section_id,
        "date": rec.date,
        "temperature": rec.temperature,
        "humidity": rec.humidity,
        "light_level": rec.light_level
    }
