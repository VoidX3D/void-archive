import os
import subprocess
import shutil
import time
import json
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
from sync import sync_to_cloud

# Config
OUTPUT_BASE = os.path.join(os.getcwd(), "Assets/Processed/")
SINCERE_NAME = "Sincere B. Archive"
AUTHOR_FULL = "Sincere Bhattarai"

def get_metadata(file_path):
    # Try to extract metadata
    # ...
    # Placeholder
    basename = os.path.basename(file_path).lower()
    subject = "General"
    if "computer" in basename: subject = "Computer Science"
    elif "social" in basename: subject = "Social Studies"
    elif "science" in basename: subject = "Science"
    elif "math" in basename: subject = "Mathematics"
    elif "nepali" in basename: subject = "Nepali"

    return {
        "title": os.path.basename(file_path).replace(".pptx", "").replace(".docx", "").replace(".pdf", ""),
        "subject": subject,
        "word_count": 0,
        "creation_date": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat(),
        "dominant_color": "#6750A4", # Default M3 Purple
        "time_spent": "" 
    }

def get_dominant_color(image_path):
    # Quick dominant color extraction using PIL
    img = Image.open(image_path)
    img = img.resize((1, 1))
    color = img.getpixel((0, 0))
    return '#{:02x}{:02x}{:02x}'.format(color[0], color[1], color[2])

def watermark_image(input_path, output_path):
    # Use ImageMagick (convert) for performance
    # 2% opacity "Sincere Bhattarai" in the center
    cmd = [
        "convert", input_path,
        "-gravity", "center", 
        "-pointsize", "72", 
        "-fill", "rgba(0,0,0,0.02)", 
        "-annotate", "0", SINCERE_NAME, 
        "-define", "webp:lossless=true",
        output_path
    ]
    subprocess.run(cmd)

def deep_etch_metadata(target_path):
    # Inject Sincere Bhattarai into Author tags using ImageMagick
    cmd = ["mogrify", "-set", "Author", AUTHOR_FULL, target_path]
    subprocess.run(cmd)

def create_teaser(images, output_path):
    # Create an animated teaser using ImageMagick
    if not images: return
    # Use only first 10 slides for teaser to keep it small
    teaser_inputs = images[:10]
    cmd = [
        "convert", "-delay", "100", "-loop", "0"
    ] + teaser_inputs + [output_path.replace(".webm", ".webp")]
    subprocess.run(cmd)
    print(f"[*] Teaser generated: {output_path.replace('.webm', '.webp')}")

def process_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    file_id = os.path.basename(file_path).replace(ext, "").replace(" ", "_")
    output_dir = os.path.join(OUTPUT_BASE, file_id)
    os.makedirs(output_dir, exist_ok=True)

    print(f"[*] Processing {file_path} for ID {file_id}")
    
    # 1. Convert to PDF using LibreOffice
    pdf_path = os.path.join(output_dir, f"{file_id}.pdf")
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", output_dir, file_path])
    
    # 2. PDF to Slides (High-res WebP)
    # Using pdftoppm to get PNG then convert to WebP with watermark
    img_prefix = os.path.join(output_dir, "slide")
    subprocess.run(["pdftoppm", "-png", "-rx", "150", "-ry", "150", pdf_path, img_prefix])
    
    # 3. Process each slide
    images = []
    for f in sorted(os.listdir(output_dir)):
        if f.startswith("slide") and f.endswith(".png"):
            slide_path = os.path.join(output_dir, f)
            webp_path = slide_path.replace(".png", ".webp")
            watermark_image(slide_path, webp_path)
            deep_etch_metadata(webp_path)
            os.remove(slide_path)
            images.append(webp_path)
            
    # 4. Create Teaser
    teaser_path = os.path.join(output_dir, "teaser.webm")
    create_teaser(images, teaser_path)
    
    # 5. Metadata Sync (Save locally as JSON for now)
    meta = get_metadata(file_path)
    meta["id"] = file_id
    meta["slide_count"] = len(images)
    teaser_filename = "teaser.webp"
    meta["teaser"] = teaser_filename if os.path.exists(os.path.join(output_dir, teaser_filename)) else None
    
    # Estimate time spent: 15m per slide + 2h base
    total_minutes = (len(images) * 15) + 120
    meta["time_spent"] = f"{total_minutes // 60}h {total_minutes % 60}m"

    if images:
        meta["dominant_color"] = get_dominant_color(images[0])
    
    with open(os.path.join(output_dir, "metadata.json"), "w") as f:
        json.dump(meta, f, indent=4)
    
    # Cloud Sync
    sync_to_cloud(file_id, output_dir)
    
    print(f"[+] Finished processing and syncing {file_id}")
