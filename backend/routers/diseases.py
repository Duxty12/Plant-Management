import uuid
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db, run_query
from backend.schemas import DiseaseIn, DiseaseUpdate, TreatmentIn
from backend.dependencies import get_current_user

router = APIRouter(
    prefix="/diseases",
    tags=["diseases"],
    dependencies=[Depends(get_current_user)]
)


@router.get("")
def list_diseases(
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    diseases = run_query(
        conn,
        """
        SELECT
            d.disease_id,
            d.disease_name,
            d.detect_date,
            d.recovery_status,
            d.heal_date,
            sf.plant_id,
            sp.common_name AS plant_name
        FROM diseases d
        JOIN suffering_from sf
            ON sf.disease_id = d.disease_id
        JOIN plants p
            ON p.plant_id = sf.plant_id
        JOIN species sp
            ON p.species_id = sp.species_id
        WHERE p.owner_id = %s
        ORDER BY d.detect_date DESC
        """,
        (user["user_id"],),
        fetch_all=True
    )

    for d in diseases:
        d["treatments"] = run_query(
            conn,
            """
            SELECT
                treat_id,
                disease_id,
                medicine,
                treat_date
            FROM treatments
            WHERE disease_id = %s
            ORDER BY treat_date DESC
            """,
            (d["disease_id"],),
            fetch_all=True
        )

    return diseases


@router.post("", status_code=201)
def create_disease(
    d: DiseaseIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    plant = run_query(
        conn,
        """
        SELECT
            p.plant_id,
            sp.common_name
        FROM plants p
        JOIN species sp
            ON p.species_id = sp.species_id
        WHERE p.plant_id = %s
          AND p.owner_id = %s
        """,
        (
            d.plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not plant:
        raise HTTPException(
            status_code=404,
            detail="Plant not found or not owned by you"
        )

    disease_id = str(uuid.uuid4())

    heal_date = (
        d.heal_date
        if d.recovery_status == "recovered"
        else None
    )

    run_query(
        conn,
        """
        INSERT INTO diseases (
            disease_id,
            disease_name,
            detect_date,
            recovery_status,
            heal_date
        )
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            disease_id,
            d.disease_name,
            d.detect_date,
            d.recovery_status,
            heal_date
        ),
        commit=True
    )

    run_query(
        conn,
        """
        INSERT INTO suffering_from (
            plant_id,
            disease_id
        )
        VALUES (%s, %s)
        """,
        (
            d.plant_id,
            disease_id
        ),
        commit=True
    )

    return {
        "disease_id": disease_id,
        "disease_name": d.disease_name,
        "plant_id": d.plant_id,
        "plant_name": plant["common_name"],
        "detect_date": d.detect_date,
        "recovery_status": d.recovery_status,
        "heal_date": heal_date,
        "treatments": []
    }


@router.put("/{disease_id}")
def update_disease(
    disease_id: str,
    d: DiseaseUpdate,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    existing = run_query(
        conn,
        """
        SELECT
            d.disease_id,
            sf.plant_id
        FROM diseases d
        JOIN suffering_from sf
            ON sf.disease_id = d.disease_id
        JOIN plants p
            ON p.plant_id = sf.plant_id
        WHERE d.disease_id = %s
          AND p.owner_id = %s
        """,
        (
            disease_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Disease not found or not owned by you"
        )

    new_plant = run_query(
        conn,
        """
        SELECT plant_id
        FROM plants
        WHERE plant_id = %s
          AND owner_id = %s
        """,
        (
            d.plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not new_plant:
        raise HTTPException(
            status_code=404,
            detail="Plant not found or not owned by you"
        )

    heal_date = (
        d.heal_date
        if d.recovery_status == "recovered"
        else None
    )

    run_query(
        conn,
        """
        UPDATE diseases
        SET
            disease_name = %s,
            detect_date = %s,
            recovery_status = %s,
            heal_date = %s
        WHERE disease_id = %s
        """,
        (
            d.disease_name,
            d.detect_date,
            d.recovery_status,
            heal_date,
            disease_id
        ),
        commit=True
    )

    if existing["plant_id"] != d.plant_id:
        run_query(
            conn,
            """
            UPDATE suffering_from
            SET plant_id = %s
            WHERE disease_id = %s
            """,
            (
                d.plant_id,
                disease_id
            ),
            commit=True
        )

    return {
        "detail": "Disease updated successfully"
    }


@router.delete("/{disease_id}")
def delete_disease(
    disease_id: str,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    existing = run_query(
        conn,
        """
        SELECT d.disease_id
        FROM diseases d
        JOIN suffering_from sf
            ON sf.disease_id = d.disease_id
        JOIN plants p
            ON p.plant_id = sf.plant_id
        WHERE d.disease_id = %s
          AND p.owner_id = %s
        """,
        (
            disease_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Disease not found or not owned by you"
        )

    run_query(
        conn,
        "DELETE FROM diseases WHERE disease_id = %s",
        (disease_id,),
        commit=True
    )

    return {
        "detail": "Disease deleted successfully"
    }


@router.post("/{disease_id}/treatments", status_code=201)
def add_treatment(
    disease_id: str,
    t: TreatmentIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    disease = run_query(
        conn,
        """
        SELECT d.disease_id
        FROM diseases d
        JOIN suffering_from sf
            ON sf.disease_id = d.disease_id
        JOIN plants p
            ON p.plant_id = sf.plant_id
        WHERE d.disease_id = %s
          AND p.owner_id = %s
        """,
        (
            disease_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not disease:
        raise HTTPException(
            status_code=404,
            detail="Disease not found or not owned by you"
        )

    treat_id = str(uuid.uuid4())

    run_query(
        conn,
        """
        INSERT INTO treatments (
            treat_id,
            disease_id,
            medicine,
            treat_date
        )
        VALUES (%s, %s, %s, %s)
        """,
        (
            treat_id,
            disease_id,
            t.medicine,
            t.treat_date
        ),
        commit=True
    )

    return {
        "treat_id": treat_id,
        "disease_id": disease_id,
        "medicine": t.medicine,
        "treat_date": t.treat_date
    }