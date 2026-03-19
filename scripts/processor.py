import os
import subprocess
import shutil
import time
import json
import glob
from datetime import datetime
from PIL import Image
try:
    from pptx import Presentation
    from docx import Document
except ImportError:
    Presentation = None
    Document = None

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_BASE = os.path.join(PROJECT_ROOT, "assets/Processed/")
RAW_DIR = os.path.join(PROJECT_ROOT, "assets/Raw")

# HIGH FIDELITY SETTINGS
SINCERE_NAME = "Sincere Bhattarai"
OUTPUT_DPI = 150  # Increased for clarity
WEBP_QUALITY = 85 # Shifting from 70 to 85 for sharpness

def get_metadata(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    meta = {
        "title": os.path.basename(file_path).replace(ext, "").replace("_", " ").replace("-", " ").title(),
        "subject": "General",
        "author": SINCERE_NAME,
        "creation_date": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
        "filetype": ext.replace(".", "").upper(),
        "keywords": [],
        "description": ""
    }

    try:
        if ext == ".pptx" and Presentation:
            prs = Presentation(file_path)
            if prs.core_properties.title: meta["title"] = prs.core_properties.title
            if prs.core_properties.subject: meta["subject"] = prs.core_properties.subject
        elif ext == ".docx" and Document:
            doc = Document(file_path)
            if doc.core_properties.title: meta["title"] = doc.core_properties.title
    except:
        pass

    lower_title = str(meta["title"]).lower()
    if any(k in lower_title for k in ["computer", "code", "scratch"]): meta["subject"] = "Computer Science"
    elif any(k in lower_title for k in ["social", "history", "nepal"]): meta["subject"] = "Social Studies"
    elif any(k in lower_title for k in ["science", "bio", "chem"]): meta["subject"] = "Science"
    elif any(k in lower_title for k in ["math", "logic"]): meta["subject"] = "Mathematics"
    
    return meta

def dominant_color(img_path):
    try:
        with Image.open(img_path) as img:
            rgb = img.resize((1, 1)).getpixel((0, 0))
            return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])
    except:
        return "#000000"

def process_slide(img_path, out_path):
    # Sharp WebP conversion
    cmd = [
        "convert", img_path,
        "-quality", str(WEBP_QUALITY),
        "-define", "webp:method=6",
        out_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def process_project(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in [".pptx", ".docx", ".pdf"]: return

    file_id = os.path.basename(file_path).replace(ext, "").replace(" ", "_")
    out_dir = os.path.join(OUTPUT_BASE, file_id)
    os.makedirs(out_dir, exist_ok=True)

    print(f"[*] Processing (High-Fi): {file_id}")
    
    pdf_path = os.path.join(out_dir, "archive.pdf")
    if ext == ".pdf":
        shutil.copy2(file_path, pdf_path)
    else:
        subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", out_dir, file_path], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        actual_pdf = os.path.join(out_dir, os.path.basename(file_path).replace(ext, ".pdf"))
        if os.path.exists(actual_pdf) and actual_pdf != pdf_path:
            shutil.move(actual_pdf, pdf_path)

    # High Resolution Extraction
    img_prefix = os.path.join(out_dir, "slide")
    subprocess.run(["pdftoppm", "-png", "-rx", str(OUTPUT_DPI), "-ry", str(OUTPUT_DPI), pdf_path, img_prefix], 
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    slides = sorted(glob.glob(os.path.join(out_dir, "*.png")))
    slide_names = []
    for i, png in enumerate(slides, 1):
        name = f"slide_{i:02d}.webp"
        slide_names.append(name)
        process_slide(png, os.path.join(out_dir, name))
        os.remove(png)
    
    if len(slide_names) > 0: os.remove(pdf_path)

    meta = get_metadata(file_path)
    meta["id"] = file_id
    meta["slides"] = slide_names
    meta["slide_count"] = len(slide_names)
    meta["thumbnail"] = "slide_01.webp" if slide_names else None
    
    if slide_names:
        meta["dominant_color"] = dominant_color(os.path.join(out_dir, "slide_01.webp"))
    
    with open(os.path.join(out_dir, "metadata.json"), "w") as f:
        json.dump(meta, f, indent=4)
        
    print(f"[+] Sharp Assets Created: {file_id}")

if __name__ == "__main__":
    if not os.path.exists(RAW_DIR):
        print(f"[!] Raw directory not found at: {RAW_DIR}")
    else:
        for f in os.listdir(RAW_DIR):
            process_project(os.path.join(RAW_DIR, f))
