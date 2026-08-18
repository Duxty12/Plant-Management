from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from mysql.connector.pooling import PooledMySQLConnection
from backend.security import decode_token
from backend.database import get_db, run_query

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), conn=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = run_query(
        conn, "SELECT user_id, username, email FROM users WHERE user_id = %s",
        (user_id,), fetch_one=True
    )
    if user is None:
        raise credentials_exception
    return user