import { getSupabaseCilent } from "@/utils/serverHelpers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: Request, res: Response) => {
  const supabase = getSupabaseCilent();

  const { data: {user}, error } = await supabase.auth.getUser();

  if (error) {
    console.log(error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const { chesscom_name, lichess_name } = await req.json();

  let input: string;

  if (lichess_name) {
    const lichessGameRes = await fetch(
      `https://lichess.org/api/games/user/${lichess_name}?max=5&pgnInJson=true`,
      {
        headers: {
          Accept: "application/x-ndjson",
        },
      },
    );
    try {
      var lichessGameData = (await lichessGameRes.text())
        .split("\n")
        .slice(0, -1)
        .map((obj) => JSON.parse(obj));
    } catch (e) {
      return new Response("error fetching lichess games", { status: 500 });
    }

    const pgns = lichessGameData.map((res) => {
      return res.pgn
    });

    input = JSON.stringify({
      pgns: pgns.slice(0,5),
      name: lichess_name
    })
  } else if (chesscom_name) {
    const chesscomarchiveRes = await fetch(
      `https://api.chess.com/pub/player/${chesscom_name}/games/archives`,
    );
    const chesscomarchiveData = await chesscomarchiveRes.json();
    const chesscomArchives = chesscomarchiveData.archives;
    const caIdx = chesscomarchiveData.archives.length - 1;

    const res = await fetch(chesscomArchives[caIdx]);
    const data = await res.json();

    const pgns = data.games
      .filter((res: any) => res.rules === "chess")
      .map((res: any) => {
        return { 
          pgn: res.pgn,
        };
      });

    input = JSON.stringify({
      pgns: pgns.slice(0,5),
      name: chesscom_name
    })
  }



  const analysisResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are Chesski. An AI chess companion for an app of the same name. You will always be given 2 types of instructions when asked to generate a response:
1) General: in <general></general> tags. This should dictate your general behaviour and provides basic background information.
2) Run: in <run></run> tags. This will inform you of the task you are currently trying to complete. It will contain more specific information.

Pay close attention to the information in both of these sections when generating responses!

Each of your text responses should be 64 tokens or less! This is a strict restriction! ALWAYS FOLLOW IT!!

<general>
You are Chesski. An AI chess companion for an app of the same name. 

The Chesski app is built to help users improve at chess in a fast and straightforward way. Your primary goal is to help users improve their chess and get the most out of the app.

The app is in beta and still being actively developed. Some key features include:
1) Play - lets users play chess against a bot. AI is used to explain concepts and postions to users when they get stuck. The goal of this feature is to help users get a better understanding of different chess positions and improve their thought process while playing.
2) Game Review - lets the user review games that they have played on any website, or in person (with PGN). Stockfish is used to evaluate the game and find mistakes and blunders. Users can then ask AI to generate explainations for these moves. AI will also generate insights from the user's playstyle during the game.
3) Puzzles - lets the user find and practice puzzles that are meant to specifically target their weknesses and help them improve.

Your interactions with the user should be friendly. Help them navigate the app and improve their chess game.
</general>
<run>
Your current task is to figure out the user's experience, playing style and waeknesses. You will be given a list of their 5 most recent games and you must walk though them to get an understanding of how they play.

Once you have this understandinng, update their user profile.
</run>`
      },
      {
        role: "user",
        content: `here is the data ${input!}`,
      },
    ],
    tools: [{
      type: "function",
      "function": {
        "name": "update_user_profile",
        "description": "update the stored data and preferences for a user with new, detailed descriptions.",
        "parameters": {
          "type": "object",
          "properties": {
            "experience": {
              "type": "string",
              "description": "A detailed 2 sentence summary of the user's experience playing chess, including their skill level (Beginner, Intermediate, Advanced, Expert, Master etc.)"
            },
            "playstyle": {
              "type": "string",
              "description": "A detailed 2 sentence summary of the user's preffered playing style if they have one. Positional or tactical, agrresive or startegic etc."
            },
            "weaknesses": {
              "type": "string",
              "description": "A detailed 2 sentence summary of the things the user struggles with the most when it come to chess."
            }
          },
          "required": [
            "experience",
            "playstyle",
            "weaknesses"
          ]
        }
      }
    }],
    tool_choice: { type: "function", "function": { name: "update_user_profile" }}
  });

  const playstyle = analysisResponse.choices[0].message;

  // console.log(playstyle, playstyle.tool_calls![0].function)
  const args = JSON.parse(playstyle.tool_calls![0].function.arguments);


  const { data: analysis, error: analysisError } = await supabase
    .from("user_profiles")
    .upsert([{ user_id: user!.id, ...args }])
    .select();

  if (analysisError) {
    console.log(analysisError);
    // return new Response(JSON.stringify({ analysisError }), { status: 500 });
  }

  const summaryResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are Chesski. An AI chess companion for an app of the same name. You will always be given 2 types of instructions when asked to generate a response:
1) General: in <general></general> tags. This should dictate your general behaviour and provides basic background information.
2) Run: in <run></run> tags. This will inform you of the task you are currently trying to complete. It will contain more specific information.

Pay close attention to the information in both of these sections when generating responses!

Each of your text responses should be 64 tokens or less! This is a strict restriction! ALWAYS FOLLOW IT!!

<general>
You are Chesski. An AI chess companion for an app of the same name. 

The Chesski app is built to help users improve at chess in a fast and straightforward way. Your primary goal is to help users improve their chess and get the most out of the app.

The app is in beta and still being actively developed. Some key features include:
1) Play - lets users play chess against a bot. AI is used to explain concepts and postions to users when they get stuck. The goal of this feature is to help users get a better understanding of different chess positions and improve their thought process while playing.
2) Game Review - lets the user review games that they have played on any website, or in person (with PGN). Stockfish is used to evaluate the game and find mistakes and blunders. Users can then ask AI to generate explainations for these moves. AI will also generate insights from the user's playstyle during the game.
3) Puzzles - lets the user find and practice puzzles that are meant to specifically target their weknesses and help them improve.

Your interactions with the user should be friendly. Help them navigate the app and improve their chess game.
</general>
<run>
You will be give information about the user's chess experience, playstyle and weaknesses. Your current task is to summarize that in single sentence, then share how you think the app can help them improve.
Refer to the user as "you", do not use their name. Be conversational in your response.
You have a 50 token limit for your response! KEEP IT SHORT! DO NOT GO OVER 50 TOKENS!
</run>`
      },
      {
        role: "user",
        content: JSON.stringify(args)
      }
    ],
    max_tokens: 50
  });

  const summary = summaryResponse.choices[0].message;

  console.log(summary.content)

  return new Response(summary.content, { status: 200 });
};
