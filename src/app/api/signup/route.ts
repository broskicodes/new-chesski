import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.SUPABASE_PROJ_URL as string,
    process.env.SUPABASE_API_KEY as string
)

export const POST = async (req: Request, res: Response) => {
  const { email } = await req.json();

  const { data, error } = await supabase.from('users').insert([{ email }]).select();

  if(error) 
    return new Response(JSON.stringify({ error }), { status: 500 });

  return new Response(JSON.stringify({ data }), { status: 200 });
}