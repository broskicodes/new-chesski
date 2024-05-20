import { getSupabaseCilent } from "@/utils/serverHelpers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_ASSISTANT_API_KEY,
});

export const POST = async (req: Request) => {
  const { weaknesses, experience } = await req.json();

  console.log(`Experience: ${experience}\nWeaknesses: ${weaknesses}.`)
  const supabase = getSupabaseCilent();

  const { data: { user } } = await supabase.auth.getUser();

  const embed = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input:
    `Experience: ${experience}\nWeaknesses: ${weaknesses}.`,
    dimensions: 512,
    encoding_format: "float",
  });

  const { data: documents } = await supabase.rpc("find_puzzles_3", {
    user_id: user?.id,
    query_embedding: embed.data[0].embedding,
    match_count: 50,
  });

  // console.log(documents);

  return new Response(JSON.stringify(documents), { status: 200 });
};
