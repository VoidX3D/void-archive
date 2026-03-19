import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Cache projects in memory for 1 minute to save IO
let cache: { data: any[], timestamp: number } | null = null;
const CACHE_TTL = 60000;

const SLIDE_REGEX = /^slide[-_]?(\d+)\.(webp|png|jpg|jpeg)$/i;

function naturalSort(a: string, b: string) {
  const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
  const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
  return numA - numB;
}

export async function GET() {
  const now = Date.now();
  if (cache && (now - cache.timestamp) < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const processedDir = path.join(process.cwd(), "assets/Processed");
    if (!fs.existsSync(processedDir)) return NextResponse.json([]);

    const projects: any[] = [];
    const folders = fs.readdirSync(processedDir).filter(f => fs.statSync(path.join(processedDir, f)).isDirectory());

    for (const folder of folders) {
      const folderPath = path.join(processedDir, folder);
      const metaPath = path.join(folderPath, "metadata.json");
      
      let meta: any = { id: folder, title: folder, subject: "General" };
      if (fs.existsSync(metaPath)) {
        try {
          meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        } catch (e) { console.error(`Failed to parse meta for ${folder}`, e); }
      }

      // Check for slides dynamically if not in meta or to verify
      const allFiles = fs.readdirSync(folderPath);
      const slideFiles = allFiles.filter(f => SLIDE_REGEX.test(f)).sort(naturalSort);

      projects.push({
        ...meta,
        id: folder,
        slides: slideFiles,
        slide_count: slideFiles.length || meta.slide_count || 0,
        thumbnail: meta.thumbnail || slideFiles[0] || null,
        has_slides: slideFiles.length > 0
      });
    }

    // Newest first
    projects.sort((a, b) => new Date(b.creation_date || 0).getTime() - new Date(a.creation_date || 0).getTime());

    cache = { data: projects, timestamp: now };
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
