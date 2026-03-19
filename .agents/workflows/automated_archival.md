---
description: Automated Archival Pipeline (VoidEngine v2.4)
---

# Automated Archival Pipeline

This workflow describes the process of automatically transforming raw documents into high-fidelity, GitHub-optimized assets.

## 1. Upload Raw Files

Simply upload your `.pptx`, `.docx`, or `.pdf` files into the `assets/Raw/` directory.

## 2. Automatic Processing (GitHub Actions)

Once pushed, the **Archival Engine** workflow is triggered:

- **Environment Setup**: Installs LibreOffice, ImageMagick, and Python dependencies.
- **Extraction**: Converts documents to PDF, then into 96 DPI PNG slides.
- **Compression**: Transforms PNGs into Lossy WebP (75% quality) with a subtle metadata watermark.
- **Metadata Generation**: Extracts titles and subjects using heuristic analysis.
- **Teaser Generation**: (Experimental) Creates `.webm` video previews.

## 3. Sync to Supabase

The pipeline automatically uploads:

- `metadata.json` to the PostgreSQL `projects` table.
- WebP slides to the `void-archive` storage bucket.

## 4. Committing Assets

The processed assets are committed back to the `assets/Processed/` folder in the repository so they can be served via the frontend immediately.

## Manual Override

If you need to run the process locally:

```bash
cd scripts
./venv/bin/python processor.py
```

// turbo
## Cleanup Duplicates

To identify and remove duplicate files in the `Raw` directory:

```bash
./venv/bin/python check_duplicates.py
```
