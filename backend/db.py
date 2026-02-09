import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = None

if url and key:
    try:
        supabase = create_client(url, key)
        print("Connected to Supabase")
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")
else:
    print("Supabase credentials not found in .env. Database features will be disabled.")
