"""PostgreSQL connection and non-destructive schema initialization."""
import os
from pathlib import Path

import psycopg
from psycopg.rows import dict_row


def connect():
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise psycopg.OperationalError("DATABASE_URL no está configurada")
    return psycopg.connect(
        url, row_factory=dict_row, connect_timeout=10,
        options="-c search_path=centinela,public -c statement_timeout=20000",
    )


def initialize():
    with connect() as connection:
        # Serialize worker startup so multiple workers never race to create tables.
        connection.execute("SELECT pg_advisory_xact_lock(892174320)")
        connection.execute(
            (Path(__file__).resolve().parent.parent / "database/postgres.sql").read_text()
        )
