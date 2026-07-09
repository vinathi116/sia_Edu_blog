import logging
from urllib.parse import parse_qsl, urlencode, urlsplit

import psycopg

logger = logging.getLogger(__name__)


def _ensure_supabase_ssl(database_url: str) -> str:
    parsed = urlsplit(database_url)
    if not parsed.hostname or "supabase.co" not in parsed.hostname:
        return database_url

    query_params = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if query_params.get("sslmode", "").lower() != "require":
        query_params["sslmode"] = "require"

    new_query = urlencode(query_params)
    return parsed._replace(query=new_query).geturl()


def check_supabase_connection(database_url, timeout=3):
    """
    Ping the Supabase PostgreSQL database to check if it's reachable.
    """
    if not database_url:
        return False

    try:
        with psycopg.connect(_ensure_supabase_ssl(database_url), connect_timeout=timeout) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
        return True
    except Exception as e:
        logger.warning(f"Supabase unavailable, falling back to local SQLite. Error: {e}")
        return False
