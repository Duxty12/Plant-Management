from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db, run_query
from backend.schemas import SectionIn
from backend.dependencies import get_current_user
from backend.id_generator import generate_id

router = APIRouter(
    prefix="/sections",
    tags=["sections"],
    dependencies=[Depends(get_current_user)]
)


@router.get("")
def list_sections(
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    return run_query(
        conn,
        """
        SELECT
            s.*,
            (
                SELECT er.temperature
                FROM environment_records er
                WHERE er.section_id = s.section_id
                ORDER BY er.date DESC
                LIMIT 1
            ) AS temperature,
            (
                SELECT er.humidity
                FROM environment_records er
                WHERE er.section_id = s.section_id
                ORDER BY er.date DESC
                LIMIT 1
            ) AS humidity,
            (
                SELECT er.light_level
                FROM environment_records er
                WHERE er.section_id = s.section_id
                ORDER BY er.date DESC
                LIMIT 1
            ) AS light_level,
            (
                SELECT COUNT(*)
                FROM plants p
                WHERE p.section_id = s.section_id
            ) AS plant_count
        FROM sections s
        WHERE s.user_id = %s
        """,
        (user["user_id"],),
        fetch_all=True
    )


@router.post("", status_code=201)
def create_section(
    section: SectionIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    section_id = generate_id(conn, "sections", "section_id", "SEC-A", pad=3)

    run_query(
        conn,
        """
        INSERT INTO sections
        (section_id, section_name, user_id)
        VALUES (%s, %s, %s)
        """,
        (
            section_id,
            section.section_name,
            user["user_id"]
        ),
        commit=True
    )

    return {
        "section_id": section_id,
        "section_name": section.section_name,
        "user_id": user["user_id"]
    }


@router.delete("/{section_id}")
def delete_section(
    section_id: str,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    owned = run_query(
        conn,
        """
        SELECT section_id
        FROM sections
        WHERE section_id = %s AND user_id = %s
        """,
        (section_id, user["user_id"]),
        fetch_one=True
    )

    if not owned:
        raise HTTPException(
            status_code=404,
            detail="Section not found or not owned by you"
        )

    run_query(
        conn,
        "DELETE FROM sections WHERE section_id = %s",
        (section_id,),
        commit=True
    )

    return {"detail": "deleted"}

@router.put("/{section_id}")
def update_section(
    section_id: str,
    section: SectionIn,
    conn=Depends(get_db),
    user=Depends(get_current_user),
):
    owned = run_query(
        conn,
        """
        SELECT section_id
        FROM sections
        WHERE section_id = %s
          AND user_id = %s
        """,
        (
            section_id,
            user["user_id"],
        ),
        fetch_one=True,
    )

    if not owned:
        raise HTTPException(
            status_code=404,
            detail="Section not found or not owned by you",
        )

    run_query(
        conn,
        """
        UPDATE sections
        SET section_name = %s
        WHERE section_id = %s
          AND user_id = %s
        """,
        (
            section.section_name,
            section_id,
            user["user_id"],
        ),
        commit=True,
    )

    return {
        "section_id": section_id,
        "section_name": section.section_name,
    }
