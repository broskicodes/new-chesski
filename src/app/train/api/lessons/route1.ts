import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources/index.mjs";

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functions: ChatCompletionTool[] = [
  {
    "type": "function",
    "function": {
      "name": "create_lesson",
      "description": "Generate a chess lesson to explain a particular chess concept/topic. Lesson will include a list of moves and an explanation of the topic.",
      "parameters": {
        "type": "object",
        "properties": {
          "topic": {
            "type": "string",
            "description": "The topic/concept the lesson is meant to train."
          },
          "difficulty": {
            "type": "string",
            "description": "The difficulty of the lesson. Helps decide what level of players will train on it",
            "enum": ["beginner", "intermediate", "advanced", "master"]
          },
          "explanation": {
            "type": "string",
            "description": "An explanation of how the generated lesson is relevant to the concept."
          },
          "color": {
            "type": "string",
            "description": "The color the person studying the lesson is playing.",
            "enum": ["white", "black"]
          },
          "starting_position": {
            "type": "string",
            "description": "The postion to start the lesson from in FEN notation. Take lots of care to ensure this FEN is VALID and CORRECT."
          },
          "moves": {
            "type": "array",
            "description": "The list of chess moves that showcases the concept of the lesson. The first move should be able to be played out of the starting_position FEN. The moves should be in valid algebraic notation (SAN).",
            "items": {
              "type": "string",
            },
            "maxItems": 10
          }
        },
        "required": ["topic", "difficulty", "color", "starting_position", "moves", "explanation"],
      }
    }
  }
];

const coachSystemMessage = {
  role: "system",
  content: "You are a chess Grandmaster and professional coach. You are responsible for creating lessons to educate chess players.\n\nYou will be told the skill level of the player and the concept they wish to learn. Your goal is to generate a lesson that illustrates the concept in a way the user can understand.\n\n You will call a function to do this. Make sure you output the results in JSON."
}

export const POST = async (req: Request) => {
  const { messages } = await req.json();

  const reponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    // stream: true,
    messages: [
      coachSystemMessage,
      messages.at(-1),
    ],
    // max_tokens: 64,
    response_format: { type: "json_object" },
    tools: [
      ...functions
    ],
    tool_choice: { "type": "function", "function": { name: "create_lesson" } }
  });


  return new Response(JSON.stringify({
    tool_calls: reponse.choices[0].message.tool_calls,
  }));
}