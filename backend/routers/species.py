import uuid

from fastapi import APIRouter, Depends, HTTPException

from backend.database import get_db, run_query
from backend.schemas import SpeciesIn
from backend.dependencies import get_current_user


router = APIRouter(
    prefix="/species",
    tags=["species"],
    dependencies=[Depends(get_current_user)]
)


@router.get("")
def list_species(
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    return run_query(
        conn,
        """
        SELECT
            sp.*,
            COUNT(p.plant_id) AS plant_count,
            (sp.user_id = %s) AS is_user_owned
        FROM species sp
        LEFT JOIN plants p
            ON p.species_id = sp.species_id
        GROUP BY sp.species_id
        """,
        (user["user_id"],),
        fetch_all=True
    )


@router.post("")
def create_species(
    species: SpeciesIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    species_id = str(uuid.uuid4())

    run_query(
        conn,
        """
        INSERT INTO species (
            species_id,
            common_name,
            scientific_name,
            origin_country,
            user_id
        )
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            species_id,
            species.common_name,
            species.scientific_name,
            species.origin_country,
            user["user_id"]
        ),
        commit=True
    )

    return {
        "species_id": species_id,
        "common_name": species.common_name,
        "scientific_name": species.scientific_name,
        "origin_country": species.origin_country,
        "user_id": user["user_id"],
        "plant_count": 0,
        "is_user_owned": True,
    }


@router.put("/{species_id}")
def update_species(
    species_id: str,
    species: SpeciesIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    # First verify that this species belongs to the
    # currently authenticated user.
    owned = run_query(
        conn,
        """
        SELECT species_id
        FROM species
        WHERE species_id = %s
          AND user_id = %s
        """,
        (
            species_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not owned:
        raise HTTPException(
            status_code=404,
            detail="Species not found or not owned by you"
        )

    # Now update it.
    run_query(
        conn,
        """
        UPDATE species
        SET
            common_name = %s,
            scientific_name = %s,
            origin_country = %s
        WHERE species_id = %s
          AND user_id = %s
        """,
        (
            species.common_name,
            species.scientific_name,
            species.origin_country,
            species_id,
            user["user_id"]
        ),
        commit=True
    )

    return {
        "detail": "Species updated successfully"
    }


@router.delete("/{species_id}")
def delete_species(
    species_id: str,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    # Verify ownership before deleting.
    owned = run_query(
        conn,
        """
        SELECT species_id
        FROM species
        WHERE species_id = %s
          AND user_id = %s
        """,
        (
            species_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not owned:
        raise HTTPException(
            status_code=404,
            detail="Species not found or not owned by you"
        )

    run_query(
        conn,
        """
        DELETE FROM species
        WHERE species_id = %s
          AND user_id = %s
        """,
        (
            species_id,
            user["user_id"]
        ),
        commit=True
    )

    return {
        "detail": "Species deleted successfully"
    }
