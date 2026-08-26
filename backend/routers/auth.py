import uuid
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from backend.database import get_db, run_query
from backend.schemas import UserRegister, Token
from backend.security import hash_password, verify_password, create_access_token
from backend.dependencies import get_current_user
from backend.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=201)
def register(user: UserRegister, conn=Depends(get_db)):
    existing = run_query(conn, "SELECT user_id FROM users WHERE username=%s OR email=%s",
                          (user.username, user.email), fetch_one=True)
    if existing:
        raise HTTPException(400, "Username or email already registered")

    user_id = str(uuid.uuid4())
    run_query(
        conn,
        "INSERT INTO users (user_id, username, email, password) VALUES (%s,%s,%s,%s)",
        (user_id, user.username, user.email, hash_password(user.password)),
        commit=True
    )
    return {"user_id": user_id, "username": user.username, "email": user.email}

@router.post("/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), conn=Depends(get_db)):
    user = run_query(
        conn, "SELECT * FROM users WHERE username=%s OR email=%s",
        (form_data.username, form_data.username), fetch_one=True
    )
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(401, "Incorrect username or password")

    token = create_access_token({"sub": user["user_id"]})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * ACCESS_TOKEN_EXPIRE_MINUTES,
        path="/",
    )

    return {
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "email": user["email"],
        }
    }



@router.get("/me")
def me(user=Depends(get_current_user)):
    return user