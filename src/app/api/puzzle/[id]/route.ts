import { getSupabaseCilent } from "@/utils/serverHelpers";

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

  return new Response(JSON.stringify(data[0]), { status: 200 });
}