import { getChessRatingCategory } from "@/utils/clientHelpers";
import { getSupabaseCilent } from "@/utils/serverHelpers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_ASSISTANT_API_KEY,
});


async function describePuzzle(rating: string, themes: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system", 
        "content": `
          You are a brilliant chess assistant. You will be given some information about a specific chess puzzle. 
          Your task is to describe the puzzle, listing both the experince level a player solving it should be, and the weaknesses that the puzzle trains.

          Format your responses as follows:
          Experience: ...,
          Weaknesses: ...
        `
      },
      {
        "role": "user",
        "content": "This puzzle is for players rated around 2092. It trains these themes: advantage, middlegame, veryLong"
      },
      {
        "role": "assistant",
        "content": "Experience: Intermediate to Advanced (around 2092 rating)\nWeaknesses: Strategic planning in the middlegame, recognizing and capitalizing on advantages in complex positions, and maintaining focus over extended calculations and sequences."
      },
      {
        "role": "user",
        "content": "This puzzle is for players rated around 889. It trains these themes: advantage, hangingPiece, oneMove, opening"
      },
      {
        "role": "assistant",
        "content": "Experience: Beginner (around 889 rating)\nWeaknesses: Identifying and taking advantage of hanging pieces in the opening, spotting one-move tactical opportunities."
      },
      {
        "role": "user",
        "content": "This puzzle is for players rated around 1479. It trains these themes: advantage, long, opening, queensideAttack"
      },
      {
        "role": "assistant",
        "content": "Experience: Intermediate (around 1479 rating)\nWeaknesses: Maintaining an advantage in the opening, understanding long-term strategic planning, and effectively conducting a queenside attack."
      },
      {
        "role": "user",
        "content": `This puzzle is for players rated around ${rating}. It trains these themes: ${themes}`
      }
    ]
  })

  return res.choices[0].message.content!
}

export const POST = async (req: Request) => {
  const supabase = getSupabaseCilent();

  for (let j = 14; j < 100; j++) {
    const { data, error } = await supabase
      .from("puzzles")
      .select("*")
      .order("id", { ascending: false })
      .range(j * 50, j * 50 + 49);

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    const puzzles_descs = await Promise.all(
      data.map(async (puzzle: any) => {
        const desc = await describePuzzle(puzzle.rating, puzzle.themes.replaceAll(" ", ", "))

        const embed = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: desc,
          dimensions: 512,
          encoding_format: "float",
        });

        return {
          id: puzzle.id,
          description: desc,
          embedding: embed.data[0].embedding,
        };
      }),
    );

    const batchSize = 100;
    const puzzlesCount = puzzles_descs.length;

    console.log(j, puzzlesCount);

    for (let i = 0; i < puzzlesCount; i += batchSize) {
      const batch = puzzles_descs.slice(i, i + batchSize);
      const { data: embData, error: embError } = await supabase
        .from("puzzle_embeddings_3")
        .upsert(batch)
        .select();

      if (embError) {
        return new Response(JSON.stringify({ embError }), { status: 500 });
      }

      // console.log(i, embData.length);
    }
  }

  return new Response(JSON.stringify("success"), { status: 200 });
};
