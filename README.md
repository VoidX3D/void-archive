# 🌌 VoidArchive - The Sincere Bhattarai Legacy

Welcome to the **VoidArchive**, a highly-engineered "Observer" Backend + "Expressive" M3 Frontend platform designed to permanently digitize, watermark, and host 400+ legacy presentations in an automated, interactive View-Only Archive perfectly suited for high-fidelity preservation.

## 🚀 Features

### 1. The "Observer" Backend (Python)

- Watches `assets/Raw`, `~/Presentations`, and `~/Legacy` for incoming PPTX, DOCX, XLSX, and PDF files.
- Triggers a headless LibreOffice pipeline automatically wrapping into high-res `.webp` static slides.
- Extracts slide counts and applies a fast **FFMPEG WebM Pipe** to stitch the first 10 slides into a fast dynamic trailer/teaser for hover loops.
- Applies a deep-etched 2% Ghost Watermark with global credentials to the centroid of all output slides preventing unauthorized stripping.
- Authenticates with Supabase PostgreSQL and Storage via automated `.env` synced JWT roles, automatically uploading metadata and public-facing archive packets.

### 2. The "Expressive" Frontend (Next.js 16)

- Designed on a Material 3 inspired architectural glassmorphic standard.
- Integrated **Live Animated Grid Carousel & Statistics** module mapping all synced presentation metrics (Estimated labor, metadata extraction, subject mapping).
- **Responsive Adaptive Bento Grid** where heavier projects scale contextually into 2x2 spans!
- Hover loops load the `ffmpeg`-generated webm trailers seamlessly.

### 3. Account-less Supabase Telemetry & Ratifying

- Employs a zero-login 5-star authentication system.
- Fingerprints the canvas, navigator cores, device memory bounds, and IP to hash a verified **Identity Hex**.
- Connects directly to Supabase with RLS rules asserting `1 Unique Hash = 1 Vote` for immutable public metrics rating.

### 4. Dual-Track Download Architecture (Bottom Sheet)

- An integrated animated Bottom Sheet intercepting download hooks with an interactive UI.
- Displays a mandatory "Caution Archive" barrier.
- Allows a choice between the core stripped `.PPTX` format *or* an Image-embedded offline standalone `.ZIP`.

## 🛠 Setup & Development

### Requirements

- Node.js 18+ (20+ Recommended)
- Python 3.9+ (`pip install -r scripts/requirements.txt`)
- Supabase Project Database + Storage Bucket named `void-archive` (Public)

1. Clone Repository & Install Next.js:

   ```bash
   npm install
   ```

2. Check your Database Policy:

   Ensure your Supabase project's `hardware_ratings` table is deployed using the queries stored statically within `scripts/setup_supabase.sql`.
   *(Do NOT use FOR UPSERT in standard PG policies).*

3. Set your internal environment mapping:

   Configure your `NEXT_PUBLIC_SUPABASE_URL` inside `.env.local`.

4. Serve the Archive:

   ```bash
   npm run dev
   ```

## 🔒 Automated Watcher

Deploy the Python Watcher script alongside your desktop routine:

```bash
python3 scripts/watcher.py
```

*Note that external libraries `ImageMagick (mogrify)` and `ffmpeg` must be locally cached to system path!*

## 🎨 Asset Migrations

All raw source presentation targets have been migrated into the unified repository `assets/`.
Output logs are rendered securely to `assets/Processed/` before they are securely transported downstream.
