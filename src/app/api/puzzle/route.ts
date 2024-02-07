import { getSupabaseCilent } from "@/utils/helpers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: Request) => {
  const supabase = getSupabaseCilent();

  const embed = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: "I am looking for a puzzle for an beginner level player lookig to learn more lines in the london system",
    dimensions: 512,
    encoding_format: "float"
  });

  const { data: documents } = await supabase.rpc('find_puzzles', {
    query_embedding: embed.data[0].embedding, 
    match_count: 3, 
  });

  console.log(documents);

  return new Response(JSON.stringify(documents), { status: 200 });
}