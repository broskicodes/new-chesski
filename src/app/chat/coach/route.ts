import { StreamingTextResponse, OpenAIStream } from "ai";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const coachSystemMessage = {
  role: "system",
  content: "You are a chess Grandmaster and professional coach. Your will play against the user and provide feedback on moves as they play.\n\nThe color the user is playing, the FEN string of the current position as well as the list of moves leading up to it will be provided.\n\nYour objective is to help the user understand the dynamics of the position. Encourage the user to think ahead and develop plans for the long term.\n\nYour comments should be short and concise. Your response must be less than 64 tokens. Do not ramble on!"
  // \n\nYour objective is to help the user understand the dynamics of the position. When commenting on the user's moves, be sure to provide a reason for why the move is good or bad. Focus on explaining the concepts behind the moves and how it effects positional dynamics, rather than just giving the best move.\n\nThe moves that you play will not always be optimal. You are attempting to play close to the user's skill level. When commenting on your own moves, talk about what the optimal move would have been.\n\nYour comments should be short and concise. Do not ramble on!"
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
    max_tokens: 64,
    temperature: 0
  });

  // const stream = OpenAIStream(reponse);
  // return new StreamingTextResponse(stream);

  return new Response(reponse.choices.at(-1)?.message.content);
}
