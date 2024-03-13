import OpenAI from "openai";
import { ChatCompletionSystemMessageParam, ChatCompletionTool } from "openai/resources/index.mjs";

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const coachSystemMessage: ChatCompletionSystemMessageParam = {
  role: "system",
  content: "You are a chess Grandmaster. Your job is to guide chess students through puzzles.\n\nThe student will be given a puzzle that they must solve. You will receive all information about the puzzle as context, including postion, context and description.\n\nRespond to the user's queries about the puzzle in an educational manner. Each of your responses should be VERY CONCISE (2 sentences or less). You have a maximum of 32 tokens."
}

export const POST = async (req: Request) => {
  const { messages, puzzle } = await req.json();

  const reponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    // stream: true,
    messages: [
      coachSystemMessage,
      {
        role: "assistant",
        content: `Here is the description of the puzzle: ${puzzle.description}\nThis is the starting position in FEN notation: ${puzzle.starting_fen}. It has the following solution: ${puzzle.moves.join(", ")}.\nThe puzzle trains the following themes: ${puzzle.themes.join(", ")}.`
      },
      ...messages,
    ],
    max_tokens: 32,
    temperature: 0
  });

  // console.log(reponse.choices[0].message.content);

  return new Response(reponse.choices[0].message.content);
}