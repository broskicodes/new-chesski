import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: Request, res: Response) => {
  const { messages } = await req.json();

  const reponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    stream: true,
    messages
  });

  const stream = OpenAIStream(reponse);

  return new StreamingTextResponse(stream);
}