import uuid
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db, run_query
from backend.schemas import SectionIn
from backend.dependencies import get_current_user

router = APIRouter(prefix="/sections", tags=["sections"], dependencies=[Depends(get_current_user)])

@router.post("", status_code=201)
def create_section(section: SectionIn, conn=Depends(get_db)):
    existing = run_query(conn, "SELECT section_id FROM sections WHERE section_name=%s",
                          (section.section_name,), fetch_one=True)
    if existing:
        raise HTTPException(400, "Section already exists")

    section_id = str(uuid.uuid4())
    run_query(
        conn, "INSERT INTO sections (section_id, section_name, env_id) VALUES (%s,%s,%s)",
        (section_id, section.section_name, section.env_id), commit=True
    )
    return {"section_id": section_id, "section_name": section.section_name}

@router.get("")
def list_sections(conn=Depends(get_db)):
    return run_query(
        conn,
        """SELECT s.*, er.temperature, er.humidity, er.light_level, er.date
           FROM sections s
           LEFT JOIN environment_records er ON s.env_id = er.env_id""",
        fetch_all=True
    )

@router.get("/{section_id}")
def get_section(section_id: str, conn=Depends(get_db)):
    section = run_query(
        conn,
        """SELECT s.*, er.temperature, er.humidity, er.light_level, er.date
           FROM sections s
           LEFT JOIN environment_records er ON s.env_id = er.env_id
           WHERE s.section_id = %s""",
        (section_id,), fetch_one=True
    )
    if not section:
        raise HTTPException(404, "Section not found")
    return section

@router.put("/{section_id}")
def update_section(section_id: str, section: SectionIn, conn=Depends(get_db)):
    run_query(
        conn, "UPDATE sections SET section_name=%s, env_id=%s WHERE section_id=%s",
        (section.section_name, section.env_id, section_id), commit=True
    )
    return {"detail": "updated"}

@router.delete("/{section_id}")
def delete_section(section_id: str, conn=Depends(get_db)):
    run_query(conn, "DELETE FROM sections WHERE section_id=%s", (section_id,), commit=True)
    return {"detail": "deleted"}