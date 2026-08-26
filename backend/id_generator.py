from backend.database import run_query

def generate_id(conn, table: str, column: str, prefix: str, pad: int = 4, start: int = 1) -> str:
    row = run_query(
        conn,
        f"SELECT {column} FROM {table} WHERE {column} LIKE %s ORDER BY {column} DESC LIMIT 1",
        (f"{prefix}%",),
        fetch_one=True
    )
    if not row:
        next_num = start
    else:
        last_id = row[column]
        num_part = last_id[len(prefix):]
        next_num = int(num_part) + 1

    return f"{prefix}{str(next_num).zfill(pad)}"


def generate_year_id(conn, table: str, column: str, prefix: str, year: int, pad: int = 4) -> str:
    full_prefix = f"{prefix}{year}-"
    row = run_query(
        conn,
        f"SELECT {column} FROM {table} WHERE {column} LIKE %s ORDER BY {column} DESC LIMIT 1",
        (f"{full_prefix}%",),
        fetch_one=True
    )
    if not row:
        next_num = 1
    else:
        last_id = row[column]
        num_part = last_id[len(full_prefix):]
        next_num = int(num_part) + 1

    return f"{full_prefix}{str(next_num).zfill(pad)}"