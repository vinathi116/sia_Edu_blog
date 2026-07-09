import os
from pathlib import Path
from dotenv import load_dotenv
from psycopg import connect

load_dotenv(Path(__file__).with_name('.env'))

DATABASE_URL = os.getenv('DATABASE_URL', '').strip()
SQL_PATH = Path(__file__).with_name('supabase_init.sql')

if not DATABASE_URL:
    raise SystemExit('DATABASE_URL is not set in .env')

sql = SQL_PATH.read_text(encoding='utf-8')

with connect(DATABASE_URL, connect_timeout=10) as conn:
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()

print('Supabase tables created successfully.')
