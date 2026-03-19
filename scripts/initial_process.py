import os
import glob
from processor import process_file

RAW_DIR = os.path.join(os.getcwd(), "Assets/Raw/")

def main():
    files = glob.glob(os.path.join(RAW_DIR, "*.pptx")) + \
            glob.glob(os.path.join(RAW_DIR, "*.pdf")) + \
            glob.glob(os.path.join(RAW_DIR, "*.docx"))
    
    print(f"[*] Found {len(files)} files to process.")
    for f in files:
        try:
            process_file(f)
        except Exception as e:
            print(f"[!] Critical Error on {f}: {e}")

if __name__ == "__main__":
    main()
