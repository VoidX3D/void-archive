import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const RATINGS_FILE = path.join(process.cwd(), ".ratings.json");

/** Load ratings from local JSON file (fallback when no Supabase) */
function loadLocalRatings(): Record<string, { total: number; count: number; votes: Record<string, number> }> {
  try {
    if (fs.existsSync(RATINGS_FILE)) {
      return JSON.parse(fs.readFileSync(RATINGS_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function saveLocalRatings(data: Record<string, any>) {
  try {
    fs.writeFileSync(RATINGS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn("[rate] Could not save local ratings:", e);
  }
}

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const hasSupabase = supabaseUrl.startsWith("http") && supabaseKey.length > 10;

/** GET — fetch average rating for a project */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  if (hasSupabase) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("hardware_ratings")
      .select("rating")
      .eq("project_id", projectId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const ratings = (data || []).map((r: any) => r.rating);
    const avg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
    return NextResponse.json({ average: parseFloat(avg.toFixed(2)), count: ratings.length });
  }

  // Local fallback
  const all = loadLocalRatings();
  const proj = all[projectId];
  if (!proj || proj.count === 0) {
    return NextResponse.json({ average: 0, count: 0 });
  }
  return NextResponse.json({
    average: parseFloat((proj.total / proj.count).toFixed(2)),
    count: proj.count,
  });
}

/** POST — submit a rating */
export async function POST(req: Request) {
  const body = await req.json();
  const { projectId, rating, identityHash, telemetry } = body;

  if (!projectId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (hasSupabase) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("hardware_ratings")
      .upsert(
        {
          project_id: projectId,
          identity_hash: identityHash,
          rating,
          telemetry,
          created_at: new Date().toISOString(),
        },
        { onConflict: "project_id,identity_hash" }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  }

  // Local JSON fallback
  const all = loadLocalRatings();
  if (!all[projectId]) {
    all[projectId] = { total: 0, count: 0, votes: {} };
  }

  const prev = all[projectId].votes[identityHash];
  if (prev !== undefined) {
    all[projectId].total -= prev;
    all[projectId].count -= 1;
  }
  all[projectId].votes[identityHash] = rating;
  all[projectId].total += rating;
  all[projectId].count += 1;

  saveLocalRatings(all);

  const proj = all[projectId];
  return NextResponse.json({
    success: true,
    average: parseFloat((proj.total / proj.count).toFixed(2)),
    count: proj.count,
  });
}
