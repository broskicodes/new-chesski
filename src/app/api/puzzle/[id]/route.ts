import { getSupabaseCilent } from "@/utils/serverHelpers";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const GET = async (req: Request, { params }: { params: { id: string }}) => {
  const { id } = params;
  const supabase = getSupabaseCilent();

  const { data, error } = await supabase.from("puzzles").select("*").eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  if (!data || data.length === 0) {
    return new Response(JSON.stringify({ error: "Puzzle not found" }), { status: 404 });
  }

  const { data: emb, error: embError } = await supabase.from("puzzle_embeddings_2").select("description").eq("id", id);

  if (embError) {
    return new Response(JSON.stringify({ embError }), { status: 500 });
  }

  if (!emb || emb.length === 0) {
    return new Response(JSON.stringify({ error: "Puzzle embedding not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ puzzle: data[0], description: emb[0].description }), { status: 200 });
}