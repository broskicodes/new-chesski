import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_ASSISTANT_API_KEY
})

export const POST = async (req: Request) => {
  const thread = await openai.beta.threads.create();

  return new Response(thread.id);
}