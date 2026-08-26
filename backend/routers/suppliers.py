import uuid

from fastapi import APIRouter, Depends, HTTPException

from backend.database import get_db, run_query
from backend.schemas import SupplierIn
from backend.dependencies import get_current_user


router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"],
    dependencies=[Depends(get_current_user)]
)


@router.get("")
def list_suppliers(
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    return run_query(
        conn,
        """
        SELECT
            su.*,
            COUNT(p.plant_id) AS plants_supplied,
            (su.user_id = %s) AS is_user_owned
        FROM suppliers su
        LEFT JOIN plants p
            ON p.supplier_id = su.supplier_id
        GROUP BY su.supplier_id
        """,
        (user["user_id"],),
        fetch_all=True
    )


@router.post("", status_code=201)
def create_supplier(
    supplier: SupplierIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    supplier_id = str(uuid.uuid4())

    run_query(
        conn,
        """
        INSERT INTO suppliers (
            supplier_id,
            company,
            email,
            phone,
            address,
            user_id
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            supplier_id,
            supplier.company,
            supplier.email,
            supplier.phone,
            supplier.address,
            user["user_id"]
        ),
        commit=True
    )

    return {
        "supplier_id": supplier_id,
        "company": supplier.company,
        "email": supplier.email,
        "phone": supplier.phone,
        "address": supplier.address,
        "plants_supplied": 0,
        "is_user_owned": True,
        "user_id": user["user_id"],
    }



@router.put("/{supplier_id}")
def update_supplier(
    supplier_id: str,
    supplier: SupplierIn,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):
    owned = run_query(
        conn,
        """
        SELECT supplier_id
        FROM suppliers
        WHERE supplier_id = %s
          AND user_id = %s
        """,
        (
            supplier_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not owned:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found or not owned by you"
        )

    run_query(
        conn,
        """
        UPDATE suppliers
        SET
            company = %s,
            email = %s,
            phone = %s,
            address = %s
        WHERE supplier_id = %s
          AND user_id = %s
        """,
        (
            supplier.company,
            supplier.email,
            supplier.phone,
            supplier.address,
            supplier_id,
            user["user_id"]
        ),
        commit=True
    )

    return {
        "detail": "Supplier updated successfully"
    }


@router.delete("/{supplier_id}")
def delete_supplier(
    supplier_id: str,
    conn=Depends(get_db),
    user=Depends(get_current_user)
):

    owned = run_query(
        conn,
        """
        SELECT supplier_id
        FROM suppliers
        WHERE supplier_id = %s
          AND user_id = %s
        """,
        (
            supplier_id,
            user["user_id"]
        ),
        fetch_one=True
    )

    if not owned:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found or not owned by you"
        )
    
    run_query(
        conn,
        """
        DELETE FROM suppliers
        WHERE supplier_id = %s
          AND user_id = %s
        """,
        (
            supplier_id,
            user["user_id"]
        ),
        commit=True
    )

    return {
        "detail": "Supplier deleted successfully"
    }
