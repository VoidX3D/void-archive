import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Patterns that slide files match (slide-01.webp, slide_0.webp, slide-1.webp, slide1.webp, etc.)
const SLIDE_REGEX = /^slide[-_]?(\d+)\.(webp|png|jpg|jpeg)$/i;

function naturalSort(a: string, b: string) {
  const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
  const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
  return numA - numB;
}

/** Clean metadata field values */
function sanitizeMeta(meta: Record<string, any>, folder: string): Record<string, any> {
  return {
    ...meta,
    id: folder,
    title: (meta.title || folder)
      .replace(/\.(pptx|docx|pdf|xlsx|ppt)$/gi, "")
      .replace(/[_-]+/g, " ")
      .trim(),
    subject: meta.subject === "Unknown" ? "General" : (meta.subject || "General"),
    creation_date: meta.creation_date || meta.created_at || new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const processedDir = path.join(process.cwd(), "assets/Processed");
    if (!fs.existsSync(processedDir)) {
      return NextResponse.json([]);
    }

    const projects: any[] = [];
    const folders = fs.readdirSync(processedDir).filter((f) => {
      const fullPath = path.join(processedDir, f);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const folder of folders) {
      const folderPath = path.join(processedDir, folder);

      // Locate metadata file
      let metaPath = path.join(folderPath, "meta.json");
      if (!fs.existsSync(metaPath)) metaPath = path.join(folderPath, "metadata.json");

      // Read meta if available
      let meta: Record<string, any> = { id: folder, title: folder };
      if (fs.existsSync(metaPath)) {
        try {
          const raw = fs.readFileSync(metaPath, "utf-8");
          meta = JSON.parse(raw);
        } catch {
          console.warn(`[projects] Failed to parse ${metaPath}`);
        }
      }

      // Resolve all slide images
      const allFiles = fs.readdirSync(folderPath);
      const slideFiles = allFiles
        .filter((f) => SLIDE_REGEX.test(f))
        .sort(naturalSort);

      // Sanitize and assemble
      const sanitized = sanitizeMeta(meta, folder);
      sanitized.slides = slideFiles;
      sanitized.slide_count = slideFiles.length || sanitized.slide_count || 0;
      sanitized.thumbnail = slideFiles[0] || null;
      sanitized.has_slides = slideFiles.length > 0;

      projects.push(sanitized);
    }

    // Sort: newest first
    projects.sort((a, b) => {
      const da = new Date(a.creation_date || 0).getTime();
      const db = new Date(b.creation_date || 0).getTime();
      return db - da;
    });

    return NextResponse.json(projects, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("[projects] Route error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
