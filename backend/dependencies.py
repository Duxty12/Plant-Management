from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError
from backend.security import decode_token
from backend.database import get_db, run_query


def get_current_user(
    access_token: str | None = Cookie(default=None),
    conn=Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    if not access_token:
        raise credentials_exception

    try:
        payload = decode_token(access_token)

        user_id = payload.get("sub")

        if not user_id:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = run_query(
        conn,
        """
        SELECT user_id, username, email
        FROM users
        WHERE user_id = %s
        """,
        (user_id,),
        fetch_one=True,
    )

    if user is None:
        raise credentials_exception

    return user
