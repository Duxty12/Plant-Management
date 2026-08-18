import mysql.connector
from mysql.connector import pooling
from fastapi import HTTPException
from backend import config

pool = pooling.MySQLConnectionPool(
    pool_name="greenhouse_pool",
    pool_size=10,
    host=config.DB_HOST,
    port=config.DB_PORT,
    user=config.DB_USER,
    password=config.DB_PASSWORD,
    database=config.DB_NAME,
)

def get_db():
    conn = pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()

def run_query(conn, query: str, params: tuple = (), fetch_one=False, fetch_all=False, commit=False):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params)
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        if commit:
            conn.commit()
            result = cursor.lastrowid
        return result
    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()