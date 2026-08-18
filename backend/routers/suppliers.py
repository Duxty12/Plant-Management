import uuid
from fastapi import APIRouter, Depends
from backend.database import get_db, run_query
from backend.schemas import SupplierIn
from backend.dependencies import get_current_user

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

@router.post("", status_code=201)
def create_supplier(supplier: SupplierIn, conn=Depends(get_db), user=Depends(get_current_user)):
    supplier_id = str(uuid.uuid4())
    run_query(
        conn,
        "INSERT INTO suppliers (supplier_id, company, email, phone, address) VALUES (%s,%s,%s,%s,%s)",
        (supplier_id, supplier.company, supplier.email, supplier.phone, supplier.address),
        commit=True
    )
    return {"supplier_id": supplier_id}

@router.get("")
def list_suppliers(conn=Depends(get_db), user=Depends(get_current_user)):
    return run_query(conn, "SELECT * FROM suppliers", fetch_all=True)

@router.put("/{supplier_id}")
def update_supplier(supplier_id: str, supplier: SupplierIn, conn=Depends(get_db), user=Depends(get_current_user)):
    run_query(
        conn,
        "UPDATE suppliers SET company=%s, email=%s, phone=%s, address=%s WHERE supplier_id=%s",
        (supplier.company, supplier.email, supplier.phone, supplier.address, supplier_id),
        commit=True
    )
    return {"detail": "updated"}

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: str, conn=Depends(get_db), user=Depends(get_current_user)):
    run_query(conn, "DELETE FROM suppliers WHERE supplier_id=%s", (supplier_id,), commit=True)
    return {"detail": "deleted"}