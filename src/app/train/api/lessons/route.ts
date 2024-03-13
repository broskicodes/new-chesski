import { getSupabaseCilent } from "@/utils/serverHelpers";
import OpenAI from "openai";
import { ChatCompletionSystemMessageParam, ChatCompletionTool } from "openai/resources/index.mjs";

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const GET = async (req: Request) => {
  const supabase = getSupabaseCilent();

  const embed = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: "looking for a puzzle that trains piece development and central control in the opening",
    dimensions: 512,
    encoding_format: "float"
  });

  const { data: documents } = await supabase.rpc('find_puzzles_2', {
    user_id: "c3647deb-c942-4a3a-8110-64d77e955ee3",
    query_embedding: embed.data[0].embedding, 
    match_count: 3, 
  });

  // console.log(documents[0]);

  const { data: puzzle } = await supabase.from("puzzles").select().eq("id", documents[0].id)
  console.log(puzzle);

  return new Response(JSON.stringify(puzzle), { status: 200 });
}

const coachSystemMessage: ChatCompletionSystemMessageParam = {
  role: "system",
  content: "You are an expert at chess. You will be given information about a chess puzzle including starting position and solution.The puzzle starts after the first move in the solution is played. The user will solve from the resulting postition.\n\nYou job is to write a short description of what the puzzle trains. The description should be no more that 2 sentences.\n\nBe sure to clearly visualize the starting position from the FEN string and think through each move in the solution."
}

export const POST = async (req: Request) => {
  const supabase = getSupabaseCilent();

  for (let j = 60; j < 100; j++) {
    const { data, error } = await supabase
      .from("puzzles")
      .select()
      .order("rating", { ascending: true })
      .range(j * 100, j * 100 + 99);

    if (error) {
      console.log(error);
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    const puzzles_descs = await Promise.all(
      data.map(async (puzzle: any) => {
        const reponse = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          // stream: true,
          messages: [
            coachSystemMessage,
            {
              role: "user",
              content: `Startting FEN: ${puzzle.starting_fen}\nSolution Moves: ${puzzle.moves}\nRating range: ${puzzle.rating - puzzle.rating_deviation}-${puzzle.rating + puzzle.rating_deviation}\nThemes: ${puzzle.themes.replaceAll(" ", ", ")}.`
            }
          ],
          temperature: 0
        });

        // console.log(`Startting FEN: ${puzzle.starting_fen}\nSolution Moves: ${puzzle.moves}\nRating range: ${puzzle.rating - puzzle.rating_deviation}-${puzzle.rating + puzzle.rating_deviation}\nThemes: ${puzzle.themes.replaceAll(" ", ", ")}.`)
        // console.log(reponse.choices[0].message);

        const desc = reponse.choices[0].message.content;

        const embed = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: desc!,
          dimensions: 512,
          encoding_format: "float"
        });

        return {
          id: puzzle.id,
          description: desc,
          embedding: embed.data[0].embedding
        }
      })
    )

    const batchSize = 100;
    const puzzlesCount = puzzles_descs.length;

    // console.log(puzzlesCount);

    for (let i = 0; i < puzzlesCount; i += batchSize) {
      const batch = puzzles_descs.slice(i, i + batchSize);
      const { data: embData, error: embError } = await supabase.from("puzzle_embeddings_2").upsert(batch).select();
      
      if (embError) {
        console.log(embError);
        return new Response(JSON.stringify({ embError }), { status: 500 });
      }

      console.log(j, embData.length);
    }
    // return new Response("ok");

  }

  return new Response("ok");
}
