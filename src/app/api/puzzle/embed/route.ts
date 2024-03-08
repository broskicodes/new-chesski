import { getChessRatingCategory } from "@/utils/clientHelpers";
import { getSupabaseCilent } from "@/utils/helpers"
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST =async (req: Request) => {
  const supabase = getSupabaseCilent();

  for (let j = 13; j < 100; j++) {
    const { data, error } = await supabase
      .from("puzzles")
      .select()
      .order("id", { ascending: true })
      .range(j * 1000, j * 1000 + 1000);

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    const puzzles_descs = await Promise.all(
      data.map(async (puzzle: any) => {
        const desc = `This is a puzzle for ${getChessRatingCategory(puzzle.rating).toLowerCase()} level players. The puzzle trains the following themes: ${puzzle.themes.replaceAll(" ", ", ")}.${puzzle.opening_tags!.length > 0 ? ` It is related to the following openings: ${puzzle.opening_tags.replaceAll(" ", ", ")}.` : ""}`;

        const embed = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: desc,
          dimensions: 512,
          encoding_format: "float"
        });

        return {
          id: puzzle.id,
          description: desc,
          embedding: embed.data[0].embedding
        };
      })
    );

    const batchSize = 100;
    const puzzlesCount = puzzles_descs.length;

    console.log(puzzlesCount);

    for (let i = 0; i < puzzlesCount; i += batchSize) {
      const batch = puzzles_descs.slice(i, i + batchSize);
      const { data: embData, error: embError } = await supabase.from("puzzle_embeddings").upsert(batch).select();
      
      if (embError) {
        return new Response(JSON.stringify({ embError }), { status: 500 });
      }

      console.log(i, embData.length);
    }
  }

  return new Response(JSON.stringify("success"), { status: 200 });
}