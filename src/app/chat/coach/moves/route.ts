import { StreamingTextResponse, OpenAIStream } from "ai";
import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functions: ChatCompletionTool[] = [
  {
    "type": "function",
    "function": {
      "name": "advise",
      "description": "Provide feedback on a chess position. This may include position dynamics (basic concepts/principles, tactical oppourtunities, positional weaknesses, key insights etc.) or advise for moves to make.",
      "parameters": {
        "type": "object",
        "properties": {
          "resoning": {
            "type": "string",
            "description": "This field should be used to think step by step and analyze the position before coming up with advice or move suggestions. The rational for suggestions and advice should be based on the data generated here."
          },
          "advice": {
            "type": "string",
            "description": "Information to provide to the user about the postion. Should touch on positional dynamics and follow fundamental chess principles. Comments should be short and concise (less than 64 tokens). Aim to summarize important information for the reasoning section. Do not ramble here!."
          },
          "move_suggestions": {
            "type": "array",
            "description": "An array of LEGAL chess moves suggested in the current postion and why.",
            "items": {
              "type": "object",
              "properties": {
                "reason": { "type": "string", "description": "The reasoning for playing the suggested move. Should take the current position tactics and dynamics into account." },
                "move": { "type": "string", "description": "The suggested move in SAN syntax" }
              }
            },
            "maxItems": 3,
            "uniqueItems": true
          },
          "queries": {
            "type": "array", 
            "description": "An array of the generated queries the user can ask based on the provided advice and/or suggestions. These queries should aim to help the user deepen their understanding of a specific concept or idea.",
            "items": {
              "type": "object",
              "properties": {
                "query": {
                  "type": "string",
                  "description": "The query the user can ask. These should be short and consise questions. Should be a maximum of 10 words."
                },
                "title": {
                  "type": "string",
                  "description": "The title of the query. Should be a maximum of 3 words."
                }
              }
            },
            "minItems": 1,
            "maxItems": 3
          }
        },
        "required": ["reasoning", "advice", "queries"],
      }
    }
  }
];

const coachSystemMessage = {
  role: "system",
  content: "You are a chess Grandmaster and professional coach. You will play against the user and provide feedback on moves as they play.\n\nThe color the user is playing, the FEN string of the current position as well as the list of moves leading up to it will be provided. You will also be told the Stockfish evaluation of the position, as well as the top engine line. Use all of this information to analyze the position before providing feedback.\n\nYour objective is to help the user understand the dynamics of the position. Encourage the user to think ahead and develop plans for the long term.\n\nYou will always output a JSON function call. Parts of your output will be selected and shown to the user."
}

export const POST = async (req: Request, res: Response) => {
  const { messages } = await req.json();

  const reponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    // stream: true,
    messages: [
      coachSystemMessage,
      messages.at(-1),
    ],
    // max_tokens: 64,
    temperature: 0,
    response_format: { type: "json_object" },
    tools: [
      ...functions
    ],
    tool_choice: { "type": "function", "function": { name: "advise" } }
  });

  // const stream = OpenAIStream(reponse);
  // return new StreamingTextResponse(stream);

  // console.log(reponse.choices.at(-1)?.message.tool_calls![0].function)

  return new Response(JSON.stringify({
    tool_calls: reponse.choices[0].message.tool_calls,
  }));
}
