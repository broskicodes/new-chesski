import { Message } from "ai";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const coachSystemMessage = {
  role: "system",
  content: "You are a chess Grandmaster and professional coach. Your will play against the user and provide feedback on moves as they play.\n\nThe FEN string of the current position as well as the list of moves leading up to it will be provided. The color that the user is playing will also be provided.\n\nYour objective is to help the user understand the dynamics of the position. When commenting on the user's moves, be sure to provide a reason for why the move is good or bad. Focus on explaining the concepts behind the moves and how it effects posinal dynamics, rather than just giving the best move.\n\nThe moves that you play will not always be optimal. You are attempting to play close to the user's skill level. When commenting on your own moves, talk about what the optimal move would have been.\n\nYour comments should be short and concise. Do not ramble on!"
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
  });

  return new Response(JSON.stringify(reponse.choices[0].message.content), { status: 200 });  
}
