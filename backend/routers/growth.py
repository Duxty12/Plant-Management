import uuid
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db, run_query
from backend.schemas import GrowthRecordIn
from backend.dependencies import get_current_user

router = APIRouter(
    prefix="/growth",
    tags=["growth"],
    dependencies=[Depends(get_current_user)]
)


@router.get("")
def list_growth(
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    return run_query(
        conn,
        """
        SELECT
            g.growth_id,
            g.plant_id,
            sp.common_name AS plant_name,
            g.date,
            g.height,
            g.growth_stage,
            g.leaf_count
        FROM growth_records g
        JOIN plants p
            ON g.plant_id = p.plant_id
        JOIN species sp
            ON p.species_id = sp.species_id
        WHERE p.owner_id = %s
        ORDER BY g.date DESC
        """,
        (user["user_id"],),
        fetch_all=True
    )


@router.post("", status_code=201)
def add_growth(
    g: GrowthRecordIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    plant = run_query(
        conn,
        """
        SELECT
            p.plant_id,
            sp.common_name AS plant_name
        FROM plants p
        JOIN species sp
            ON p.species_id = sp.species_id
        WHERE p.plant_id = %s
          AND p.owner_id = %s
        """,
        (
            g.plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not plant:
        raise HTTPException(
            status_code=404,
            detail="Plant not found or not owned by you"
        )

    growth_id = str(uuid.uuid4())

    run_query(
        conn,
        """
        INSERT INTO growth_records
        (
            growth_id,
            plant_id,
            date,
            height,
            growth_stage,
            leaf_count
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            growth_id,
            g.plant_id,
            g.date,
            g.height,
            g.growth_stage,
            g.leaf_count
        ),
        commit=True
    )

    return {
        "growth_id": growth_id,
        "plant_id": g.plant_id,
        "plant_name": plant["plant_name"],
        "date": g.date,
        "height": g.height,
        "growth_stage": g.growth_stage,
        "leaf_count": g.leaf_count
    }


@router.get("/{plant_id}/report")
def growth_report(
    plant_id: str,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    plant = run_query(
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

    if not plant:
        raise HTTPException(
            status_code=404,
            detail="Plant not found or not owned by you"
        )

    return run_query(
        conn,
        """
        SELECT
            growth_id,
            date,
            height,
            growth_stage,
            leaf_count
        FROM growth_records
        WHERE plant_id = %s
        ORDER BY date ASC
        """,
        (plant_id,),
        fetch_all=True
    )