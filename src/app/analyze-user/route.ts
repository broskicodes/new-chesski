import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: Request, res: Response) => {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  if(error) {
    console.log(error)
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const { data: userData, error: userError } = await supabase.from('user_chess_accounts').select().eq('uuid', data.user.id);

  if (userError) {
    console.log(userError)
    return new Response(JSON.stringify({ userError }), { status: 500 });
  }

  if (!userData[0]) {
    return new Response(JSON.stringify("User has not linked accounts"), { status: 500 });
  }

  const { chesscom_name, lichess_name } = userData[0];

  const { data: games, error: gamesError } = await supabase
    .from('game_pgns')
    .select('*')
    .or(`white.in.(${chesscom_name}), black.in.(${chesscom_name}), white.in.(${lichess_name}), black.in.(${lichess_name})`)
    .order('played_at', { ascending: false })
    .limit(20);

  if (gamesError) { 
    console.log(gamesError);
    return new Response(JSON.stringify({ gamesError }), { status: 20 });
  }

  const pgnContext = games.map((game) => {
    return `${game.tags}\n\n${game.moves}`;
  }).join('\n\n');

  const analysisResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a chess analyst. Your role is to classify the playstyle of a chess player given a list on their complete games in PGN format.\n\nLook through each game to determine the whether they tend to play aggresive or passive, positional or tactical, dynamic, prophylactic, unorthodox, or some combination.\n\nBe sure to look through their play in each game before coming to a conclusion. Your final response should be a 1-2 paragraph summary of their playstyle.`,
      }, 
      {
        role: "user",
        content: `Here are the PGNs for the 20 most recent games of the user: ${pgnContext}.\n\nThe user has linked their chess.com account with the username ${chesscom_name} and their lichess account with the username ${lichess_name}.\n\nDefine their playstyle based on the games provided.`,
      }   
    ],
  });

  const playstyle = analysisResponse.choices[0].message.content;

  const weaknessResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a chess analyst. Your role is to indetify the weaknesses of a chess player given a list on their complete games in PGN format.\n\nLook through each game to determine the where they tend to make mistakes. Do most of their mistakes happen in the opening, middle game or the end game? Do their mistakes happen sporadically, or is there a pattern?\n\nDo they often miss tactics? How is their positional awareness? What are some areas they need to improve?\n\nBe sure to look through their play in each game before coming to a conclusion. Your final response should be a 1-2 paragraph summary of their weaknesses.`,
      }, 
      {
        role: "user",
        content: `Here are the PGNs for the 20 most recent games of the user: ${pgnContext}.\n\nThe user has linked their chess.com account with the username ${chesscom_name} and their lichess account with the username ${lichess_name}.\n\nDefine their playstyle based on the games provided.`,
      }   
    ],
  });

  const weaknesses = weaknessResponse.choices[0].message.content;

  const { data: analysis, error: analysisError } = await supabase
    .from("user_analysis")
    .upsert([
      { uuid: data.user.id, playstyle, weaknesses },
    ])
    .select();
  
  if (analysisError) {
    console.log(analysisError);
    return new Response(JSON.stringify({ analysisError }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}