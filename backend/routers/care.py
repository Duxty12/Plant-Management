from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db, run_query
from backend.schemas import WateringIn, FertilizerIn
from backend.dependencies import get_current_user
from backend.id_generator import generate_id


router = APIRouter(
    prefix="/care",
    tags=["care"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/waterings")
def list_waterings(
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    return run_query(
        conn,
        """
        SELECT
            w.water_id,
            w.plant_id,
            sp.common_name AS plant_name,
            w.date,
            w.amount
        FROM waterings w
        JOIN plants p
            ON w.plant_id = p.plant_id
        JOIN species sp
            ON p.species_id = sp.species_id
        WHERE p.owner_id = %s
        ORDER BY w.date DESC
        """,
        (user["user_id"],),
        fetch_all=True
    )


@router.post("/waterings", status_code=201)
def add_watering(
    w: WateringIn,
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
            w.plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not plant:
        raise HTTPException(
            status_code=404,
            detail="Plant not found or not owned by you"
        )

    water_id = generate_id(conn, "waterings", "water_id", "WAT-", pad=4)

    run_query(
        conn,
        """
        INSERT INTO waterings
        (water_id, plant_id, date, amount)
        VALUES (%s, %s, %s, %s)
        """,
        (
            water_id,
            w.plant_id,
            w.date,
            w.amount
        ),
        commit=True
    )

    return {
        "water_id": water_id,
        "plant_id": w.plant_id,
        "plant_name": plant["plant_name"],
        "date": w.date,
        "amount": w.amount
    }


@router.delete("/waterings/{water_id}")
def delete_watering(
    water_id: str,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    watering = run_query(
        conn,
        """
        SELECT w.water_id
        FROM waterings w
        JOIN plants p
            ON w.plant_id = p.plant_id
        WHERE w.water_id = %s
          AND p.owner_id = %s
        """,
        (
            water_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not watering:
        raise HTTPException(
            status_code=404,
            detail="Watering record not found or not owned by you"
        )

    run_query(
        conn,
        """
        DELETE FROM waterings
        WHERE water_id = %s
        """,
        (water_id,),
        commit=True
    )

    return {"detail": "deleted"}


@router.get("/fertilizer")
def list_fertilizer(
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    return run_query(
        conn,
        """
        SELECT
            f.fertilizer_id,
            f.plant_id,
            sp.common_name AS plant_name,
            f.name,
            f.date,
            f.amount
        FROM fertilizer f
        JOIN plants p
            ON f.plant_id = p.plant_id
        JOIN species sp
            ON p.species_id = sp.species_id
        WHERE p.owner_id = %s
        ORDER BY f.date DESC
        """,
        (user["user_id"],),
        fetch_all=True
    )


@router.post("/fertilizer", status_code=201)
def add_fertilizer(
    f: FertilizerIn,
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
            f.plant_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not plant:
        raise HTTPException(
            status_code=404,
            detail="Plant not found or not owned by you"
        )

    fertilizer_id = generate_id(conn, "fertilizer", "fertilizer_id", "FRT-", pad=4)

    run_query(
        conn,
        """
        INSERT INTO fertilizer
        (fertilizer_id, plant_id, name, date, amount)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            fertilizer_id,
            f.plant_id,
            f.name,
            f.date,
            f.amount
        ),
        commit=True
    )

    return {
        "fertilizer_id": fertilizer_id,
        "plant_id": f.plant_id,
        "plant_name": plant["plant_name"],
        "name": f.name,
        "date": f.date,
        "amount": f.amount
    }


@router.delete("/fertilizer/{fertilizer_id}")
def delete_fertilizer(
    fertilizer_id: str,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    fertilizer = run_query(
        conn,
        """
        SELECT f.fertilizer_id
        FROM fertilizer f
        JOIN plants p
            ON f.plant_id = p.plant_id
        WHERE f.fertilizer_id = %s
          AND p.owner_id = %s
        """,
        (
            fertilizer_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not fertilizer:
        raise HTTPException(
            status_code=404,
            detail="Fertilizer record not found or not owned by you"
        )

    run_query(
        conn,
        """
        DELETE FROM fertilizer
        WHERE fertilizer_id = %s
        """,
        (fertilizer_id,),
        commit=True
    )

    return {"detail": "deleted"}