import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const isValidUrl = supabaseUrl.startsWith("http");

export async function POST(req: Request) {
  const { projectId, rating, identityHash, telemetry } = await req.json();

  if (!supabaseUrl || !supabaseKey || !isValidUrl) {
    // Mock success if no supabase configured
    console.log("[Rating Mock]", { projectId, rating, identityHash, telemetry });
    return NextResponse.json({ success: true, message: "Rating recorded (Mock)" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Supabase RLS will handle 1 hash = 1 vote if configured, 
  // but we can also check here.
  const { data, error } = await supabase
    .from("hardware_ratings")
    .upsert({ 
      project_id: projectId, 
      identity_hash: identityHash, 
      rating: rating,
      telemetry: telemetry,
      created_at: new Date().toISOString()
    }, { onConflict: "project_id,identity_hash" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, data });
}
