import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const processedDir = path.join(process.cwd(), "assets/Processed");
    if (!fs.existsSync(processedDir)) {
       return NextResponse.json([]);
    }

    const projects: any[] = [];
    const folders = fs.readdirSync(processedDir);
    
    for (const folder of folders) {
       // Look for both meta.json and metadata.json
       let metaPath = path.join(processedDir, folder, "meta.json");
       if (!fs.existsSync(metaPath)) {
          metaPath = path.join(processedDir, folder, "metadata.json");
       }

       if (fs.existsSync(metaPath)) {
          const raw = fs.readFileSync(metaPath, "utf-8");
          try {
             const meta = JSON.parse(raw);
             // Inject local folder ID to match the route dynamic ID and assets
             meta.id = folder;

             // Resolve all slides in folder
             const filesInFolder = fs.readdirSync(path.join(processedDir, folder));
             const slideFiles = filesInFolder
                .filter(f => f.toLowerCase().startsWith("slide") && f.toLowerCase().endsWith(".webp"))
                .sort((a, b) => {
                   // Natural sort for slide-1, slide-2, slide-10
                   return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
                });
             
             meta.slides = slideFiles;
             meta.thumbnail = slideFiles[0] || "slide_0.webp";
             
             projects.push(meta);
          } catch(e) {
             console.error(`Failed to parse ${metaPath}`);
          }
       }
    }
    
    // Sort descending by creation date if available
    projects.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("Local Asset read failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
