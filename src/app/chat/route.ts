import { getSupabaseCilent } from "@/utils/helpers";
import { OpenAIStream, StreamingTextResponse, experimental_StreamData } from "ai";
import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources/index.mjs";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const functions: ChatCompletionTool[] = [
  {
    "type": "function",
    "function": {
      "name": "find_relevant_puzzles",
      "description": "Semantically search for puzzles that are relevant to the user's query.",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {"type": "string", "description": "The query that will be embedded and used to find relevant puzzles."},
        },
        "required": ["query"],
      },
    },
  },
];

const systemMessage = {
  role: "system",
  content: "You are a chess Grandmaster and professional coach. Your role is to help the user find relevant puzzles to train their chess skills and weaknesses.\n\nYou have access to a function called `find_relevant_puzzles` that takes a query and returns relevant puzzles. You will call this function for every user prompt. Your job is to convert the user prompt into a query that is effective at finding the most relevant puzzles.\n\nPuzzles will be searched semanically based on desription. Each puzzle description is of the form: 'This is a puzzle for ${skill_level} level players. The puzzle trains the following themes: ${array_of_themes}. It is related to the following openings: ${optional_array_of_openings}.' Structure your queries in a way that will find the most relevant puzzles for the user.\n\nMake sure you provide your responses in JSON format!"
}


export const POST = async (req: Request, res: Response) => {
  const { messages } = await req.json();

  const lastMessage = messages.at(-1);

  if (lastMessage.tool_calls) {
    const call = lastMessage.tool_calls[0];
    const args = JSON.parse(call.function.arguments);

    switch (call.function.name) {
      case "find_relevant_puzzles": {
        const supabase = getSupabaseCilent();

        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.log(error)
          return new Response(JSON.stringify({ error }), { status: 500 });
        }

        const embed = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: args.query,
          dimensions: 512,
          encoding_format: "float"
        });
      
        const { data: documents } = await supabase.rpc('find_puzzles', {
          query_embedding: embed.data[0].embedding, 
          match_count: 5, 
        });

        const streamData = new experimental_StreamData();
        streamData.append({
          puzzles: documents
        });
        streamData.close();

        const reponse = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          stream: true,
          messages: [
            {
              role: "system",
              content: "The user is looking for puzzles to train their chess skills. You will be given the list of puzzles that were found to be relevant. Your job is to describe them to the user in a single short sentence! Refer to the user as 'you'."
            },
            {
              role: "user",
              content: `Here are the descriptions for the puzzles found: ${documents.map((puzzle: any) => puzzle.description).join("\n")}\n\nDescribe this collection of puzzles.`
            }
          ]
        });

        // console.log(documents);

        const stream = OpenAIStream(reponse, {
          experimental_streamData: true
        });
        return new StreamingTextResponse(stream, {}, streamData);
      }
      default: {
        return new Response(JSON.stringify({ error: "Invalid function name" }), { status: 500 });
      }
    }
  }
  

  // await supabase.from("sent_msg").upsert({ uuid: data.user.id, sent: true });

  // const { data: analysis, error: analysisError } = await supabase
  //   .from("user_analysis")
  //   .select("*")
  //   .eq("uuid", data.user.id);

  // if (analysisError) {
  //   console.log(analysisError)
  //   return new Response(JSON.stringify({ analysisError }), { status: 500 });
  // }

  // if (!analysis[0]) {
  //   return new Response(JSON.stringify("Please generate playstyle analysis first"), { status: 500 });
  // }

  // const { playstyle, weaknesses } = analysis[0];

  const reponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    // stream: true,
    messages: [
      systemMessage,
      lastMessage
    ],
    response_format: { type: "json_object" },
    tools: [
      ...functions
    ],
    tool_choice: { "type": "function", "function": { name: "find_relevant_puzzles" } }
  });

  // const stream = OpenAIStream(reponse);

  // return new StreamingTextResponse(stream);

  return new Response(JSON.stringify({
    tool_calls: reponse.choices[0].message.tool_calls,
  }), { status: 200 });
}