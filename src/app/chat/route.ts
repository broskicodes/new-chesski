import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { cookies } from "next/headers";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: Request, res: Response) => {
  const { messages } = await req.json();

  // console.log(messages);
  // gonna assume that ppl already have a analysis listed in db
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.log(error)
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  await supabase.from("sent_msg").upsert({ uuid: data.user.id, sent: true });

  const { data: analysis, error: analysisError } = await supabase
    .from("user_analysis")
    .select("*")
    .eq("uuid", data.user.id);

  if (analysisError) {
    console.log(analysisError)
    return new Response(JSON.stringify({ analysisError }), { status: 500 });
  }

  if (!analysis[0]) {
    return new Response(JSON.stringify("Please generate playstyle analysis first"), { status: 500 });
  }

  const { playstyle, weaknesses } = analysis[0];


  const reponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are a chess analyst. You help the user to improve their play by highlighting their weaknesses and giving them ways to improve based on their playstyle.\n\nHere is a description of the user's playstyle: ${playstyle}\n\nTheir weaknesses include: ${weaknesses}\n\nUse this information to respond to the user's queries and provide them with guidance. Be very concise with your answers. Provide 3 tips/examples for each query. Each tip should be no more than 3 sentences.`
      },
      ...messages
    ]
  });

  const stream = OpenAIStream(reponse);

  return new StreamingTextResponse(stream);
}