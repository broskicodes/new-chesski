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
      "name": "generate_user_queries",
      "description": "Generate up to 3 possible queries about the provided message that will help the user deepen their understanding of the content.",
      "parameters": {
        "type": "object",
        "properties": {
          "queries": {
            "type": "array", 
            "description": "An array of the generated queries the user can ask.",
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
        "required": ["queries", "query_titles"],
      },
    },
  },
];

const querySystemMessage = {
  role: "system",
  content: "You are a chess Grandmaster and professional coach. Your role is to help the user understand the content of the message they just received.\n\nYou will be given a message about a chess position and your job is to generate up to 3 possible queries that the user can ask to get a better understanding of the position and message content.\n\n Your queries should be short, consise and in the form of questions. Be sure to respond in JSON format."
}

export const POST = async (req: Request) => {
  const { messages } = await req.json();

  const reponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      querySystemMessage,
      messages.at(-1),
    ],
    response_format: { type: "json_object" },
    tools: [
      ...functions
    ],
    tool_choice: { "type": "function", "function": { name: "generate_user_queries" } }
  });

  return new Response(JSON.stringify({
    tool_calls: reponse.choices[0].message.tool_calls,
  }));
}
