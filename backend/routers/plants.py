import uuid
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db, run_query
from backend.schemas import PlantIn
from backend.dependencies import get_current_user

router = APIRouter(
    prefix="/plants",
    tags=["plants"],
    dependencies=[Depends(get_current_user)]
)


@router.get("")
def list_plants(
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    return run_query(
        conn,
        """
        SELECT
            p.*,
            sp.common_name,
            sp.scientific_name,
            se.section_name,
            su.company AS supplier_name,
            u.username AS owner_name
        FROM plants p
        JOIN species sp
            ON p.species_id = sp.species_id
        LEFT JOIN sections se
            ON p.section_id = se.section_id
        LEFT JOIN suppliers su
            ON p.supplier_id = su.supplier_id
        JOIN users u
            ON p.owner_id = u.user_id
        WHERE p.owner_id = %s
        ORDER BY p.acquire_date DESC
        """,
        (user["user_id"],),
        fetch_all=True
    )


@router.post("", status_code=201)
def create_plant(
    plant: PlantIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    species = run_query(
        conn,
        """
        SELECT species_id
        FROM species
        WHERE species_id = %s
        """,
        (plant.species_id,),
        fetch_one=True
    )

    if not species:
        raise HTTPException(
            status_code=404,
            detail="Species not found"
        )

    if plant.supplier_id:
        supplier = run_query(
            conn,
            """
            SELECT supplier_id
            FROM suppliers
            WHERE supplier_id = %s
            """,
            (plant.supplier_id,),
            fetch_one=True
        )

        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found"
            )

    if plant.section_id:
        section = run_query(
            conn,
            """
            SELECT section_id
            FROM sections
            WHERE section_id = %s
              AND user_id = %s
            """,
            (
                plant.section_id,
                user["user_id"]
            ),
            fetch_one=True
        )

        if not section:
            raise HTTPException(
                status_code=404,
                detail="Section not found or not owned by you"
            )

    plant_id = str(uuid.uuid4())

    run_query(
        conn,
        """
        INSERT INTO plants (
            plant_id,
            species_id,
            section_id,
            supplier_id,
            owner_id,
            acquire_date,
            health_status
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            plant_id,
            plant.species_id,
            plant.section_id,
            plant.supplier_id,
            user["user_id"],
            plant.acquire_date,
            plant.health_status
        ),
        commit=True
    )

    return run_query(
        conn,
        """
        SELECT
            p.*,
            sp.common_name,
            sp.scientific_name,
            se.section_name,
            su.company AS supplier_name,
            u.username AS owner_name
        FROM plants p
        JOIN species sp
            ON p.species_id = sp.species_id
        LEFT JOIN sections se
            ON p.section_id = se.section_id
        LEFT JOIN suppliers su
            ON p.supplier_id = su.supplier_id
        JOIN users u
            ON p.owner_id = u.user_id
        WHERE p.plant_id = %s
          AND p.owner_id = %s
        """,
        (
            plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )


@router.get("/{plant_id}")
def get_plant(
    plant_id: str,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    plant = run_query(
        conn,
        """
        SELECT
            p.*,
            sp.common_name,
            sp.scientific_name,
            se.section_name,
            su.company AS supplier_name,
            u.username AS owner_name
        FROM plants p
        JOIN species sp
            ON p.species_id = sp.species_id
        LEFT JOIN sections se
            ON p.section_id = se.section_id
        LEFT JOIN suppliers su
            ON p.supplier_id = su.supplier_id
        JOIN users u
            ON p.owner_id = u.user_id
        WHERE p.plant_id = %s
          AND p.owner_id = %s
        """,
        (
            plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not plant:
        raise HTTPException(
            status_code=404,
            detail="Plant not found"
        )

    plant["waterings"] = run_query(
        conn,
        """
        SELECT water_id, date, amount
        FROM waterings
        WHERE plant_id = %s
        ORDER BY date DESC
        """,
        (plant_id,),
        fetch_all=True
    )

    plant["fertilizer"] = run_query(
        conn,
        """
        SELECT fertilizer_id, name, date, amount
        FROM fertilizer
        WHERE plant_id = %s
        ORDER BY date DESC
        """,
        (plant_id,),
        fetch_all=True
    )

    plant["maintenance_logs"] = run_query(
        conn,
        """
        SELECT log_id, activity_type, date, note
        FROM maintenance_logs
        WHERE plant_id = %s
        ORDER BY date DESC
        """,
        (plant_id,),
        fetch_all=True
    )

    plant["growth_records"] = run_query(
        conn,
        """
        SELECT growth_id, date, height, growth_stage, leaf_count
        FROM growth_records
        WHERE plant_id = %s
        ORDER BY date ASC
        """,
        (plant_id,),
        fetch_all=True
    )

    diseases = run_query(
        conn,
        """
        SELECT d.*
        FROM diseases d
        JOIN suffering_from sf
            ON sf.disease_id = d.disease_id
        WHERE sf.plant_id = %s
        """,
        (plant_id,),
        fetch_all=True
    )

    for disease in diseases:
        disease["treatments"] = run_query(
            conn,
            """
            SELECT treat_id, medicine, treat_date
            FROM treatments
            WHERE disease_id = %s
            """,
            (disease["disease_id"],),
            fetch_all=True
        )

    plant["diseases"] = diseases

    return plant


@router.put("/{plant_id}")
def update_plant(
    plant_id: str,
    plant: PlantIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    owned = run_query(
        conn,
        """
        SELECT plant_id
        FROM plants
        WHERE plant_id = %s
          AND owner_id = %s
        """,
        (
            plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not owned:
        raise HTTPException(
            status_code=404,
            detail="Plant not found or not owned by you"
        )

    species = run_query(
        conn,
        """
        SELECT species_id
        FROM species
        WHERE species_id = %s
        """,
        (plant.species_id,),
        fetch_one=True
    )

    if not species:
        raise HTTPException(
            status_code=404,
            detail="Species not found"
        )

    if plant.supplier_id:
        supplier = run_query(
            conn,
            """
            SELECT supplier_id
            FROM suppliers
            WHERE supplier_id = %s
            """,
            (plant.supplier_id,),
            fetch_one=True
        )

        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found"
            )

    if plant.section_id:
        section = run_query(
            conn,
            """
            SELECT section_id
            FROM sections
            WHERE section_id = %s
              AND user_id = %s
            """,
            (
                plant.section_id,
                user["user_id"]
            ),
            fetch_one=True
        )

        if not section:
            raise HTTPException(
                status_code=404,
                detail="Section not found or not owned by you"
            )

    run_query(
        conn,
        """
        UPDATE plants
        SET
            species_id = %s,
            section_id = %s,
            supplier_id = %s,
            acquire_date = %s,
            health_status = %s
        WHERE plant_id = %s
          AND owner_id = %s
        """,
        (
            plant.species_id,
            plant.section_id,
            plant.supplier_id,
            plant.acquire_date,
            plant.health_status,
            plant_id,
            user["user_id"]
        ),
        commit=True
    )

    return run_query(
        conn,
        """
        SELECT
            p.*,
            sp.common_name,
            sp.scientific_name,
            se.section_name,
            su.company AS supplier_name,
            u.username AS owner_name
        FROM plants p
        JOIN species sp
            ON p.species_id = sp.species_id
        LEFT JOIN sections se
            ON p.section_id = se.section_id
        LEFT JOIN suppliers su
            ON p.supplier_id = su.supplier_id
        JOIN users u
            ON p.owner_id = u.user_id
        WHERE p.plant_id = %s
          AND p.owner_id = %s
        """,
        (
            plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )


@router.delete("/{plant_id}")
def delete_plant(
    plant_id: str,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    owned = run_query(
        conn,
        """
        SELECT plant_id
        FROM plants
        WHERE plant_id = %s
          AND owner_id = %s
        """,
        (
            plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not owned:
        raise HTTPException(
            status_code=404,
            detail="Plant not found or not owned by you"
        )

    run_query(
        conn,
        """
        DELETE FROM plants
        WHERE plant_id = %s
          AND owner_id = %s
        """,
        (
            plant_id,
            user["user_id"]
        ),
        commit=True
    )

    return {
        "detail": "Plant deleted successfully"
    }
