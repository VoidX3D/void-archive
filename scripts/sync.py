import os
import glob
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

def get_client() -> Client:
    if not URL or not KEY:
        print("[!] SUPABASE_URL or SUPABASE_KEY not found in .env")
        return None
    return create_client(URL, KEY)

def sync_to_cloud(project_id, processed_dir):
    client = get_client()
    if not client: return

    # 1. Upload metadata to PostgreSQL
    meta_path = os.path.join(processed_dir, "metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            import json
            meta = json.load(f)
            
        # Insert or update
        client.table("projects").upsert(meta).execute()

    # 2. Upload assets to Supabase Storage
    # Bucket: 'void-archive'
    bucket = "void-archive"
    for file_path in glob.glob(os.path.join(processed_dir, "*")):
        filename = os.path.basename(file_path)
        if filename == "metadata.json": continue
        
        storage_path = f"{project_id}/{filename}"
        with open(file_path, "rb") as f:
            client.storage.from_(bucket).upload(
                path=storage_path,
                file=f,
                file_options={"upsert": "true"}
            )
    print(f"[+] Synced {project_id} to cloud.")
