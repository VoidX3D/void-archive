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
    const processedPath = path.join(process.cwd(), "public", "assets", "Processed");
    if (!fs.existsSync(processedPath)) return NextResponse.json([]);

    const projects: any[] = [];
    const projectFolders = fs.readdirSync(processedPath).filter(f => fs.statSync(path.join(processedPath, f)).isDirectory());

    const rawPath = path.join(process.cwd(), "public", "assets", "Raw");
    const rawFiles = fs.existsSync(rawPath) ? fs.readdirSync(rawPath) : [];

    for (const folder of projectFolders) {
      const folderPath = path.join(processedPath, folder);
      const metaPath = path.join(folderPath, "metadata.json");
      
      let meta: any = { id: folder, title: folder, subject: "General" };
      if (fs.existsSync(metaPath)) {
        try {
          meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        } catch (e) { console.error(`Failed to parse meta for ${folder}`, e); }
      }

      // Find raw counterpart
      const rawFile = rawFiles.find(rf => rf.startsWith(folder) || rf === meta.id);
      const rawUrl = rawFile ? `/assets/Raw/${rawFile}` : null;

      // Check for slides dynamically if not in meta or to verify
      const allFiles = fs.readdirSync(folderPath);
      const slideFiles = allFiles.filter(f => SLIDE_REGEX.test(f)).sort(naturalSort);

      projects.push({
        ...meta,
        id: folder,
        slides: slideFiles,
        slide_count: slideFiles.length || meta.slide_count || 0,
        thumbnail: meta.thumbnail || slideFiles[0] || null,
        has_slides: slideFiles.length > 0,
        raw_url: rawUrl
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
