import { getSupabaseCilent } from '@/utils/helpers';

export const POST = async (req: Request, res: Response) => {
  const { email } = await req.json();

  const supabase = getSupabaseCilent();

  const { data, error } = await supabase.from('users').insert([{ email }]).select();

  if(error) 
    return new Response(JSON.stringify({ error }), { status: 500 });

  return new Response(JSON.stringify({ data }), { status: 200 });
}