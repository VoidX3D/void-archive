import os
import hashlib
import json

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
RAW_DIR = os.path.join(PROJECT_ROOT, "assets/Raw")

def get_file_hash(file_path):
    hasher = hashlib.md5()
    with open(file_path, 'rb') as f:
        buf = f.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()

def find_duplicates(raw_dir):
    hashes = {}
    duplicates = []
    
    for filename in os.listdir(raw_dir):
        path = os.path.join(raw_dir, filename)
        if os.path.isfile(path):
            fhash = get_file_hash(path)
            if fhash in hashes:
                duplicates.append((filename, hashes[fhash]))
            else:
                hashes[fhash] = filename
                
    return duplicates

if __name__ == "__main__":
    if not os.path.exists(RAW_DIR):
        print(f"[!] Raw directory not found: {RAW_DIR}")
    else:
        dupes = find_duplicates(RAW_DIR)
    if dupes:
        print(f"[!] Found {len(dupes)} duplicates:")
        for d, original in dupes:
            print(f"  - {d} (duplicate of {original})")
            # Suggest cleanup
            # os.remove(os.path.join(raw_dir, d))
    else:
        print("[+] No duplicates found in Raw assets.")
