import { StreamingTextResponse, OpenAIStream } from "ai";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const coachSystemMessage = {
  role: "system",
  content:
    "You are a chess Grandmaster and professional coach. Your role is to respond to user queries and help them understand the dynamics of chess positions.\n\nYou will receive the user query and the previous message it is referencing as context. The color the user is playing, the FEN string of the current position as well as the list of moves leading up to it will a;so be provided.\n\nYour comments should be short and concise. Your response must be less than 64 tokens. Do not ramble on!",
};

export const POST = async (req: Request, res: Response) => {
  const { messages } = await req.json();

  // console.log("messages", messages);

  const reponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    // stream: true,
    messages: [coachSystemMessage, ...messages.slice(-3)],
    max_tokens: 64,
    temperature: 0,
  });

  // const stream = OpenAIStream(reponse);
  // return new StreamingTextResponse(stream);

  return new Response(reponse.choices.at(-1)?.message.content);
};
