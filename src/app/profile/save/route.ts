import { getSupabaseCilent } from "@/utils/serverHelpers";

export const GET = async (req: Request, res: Response) => {
  const supabase = getSupabaseCilent();

  const { data, error } = await supabase.auth.getUser();

  if(error) 
    return new Response(JSON.stringify({ error }), { status: 500 });

  const { data: userData, error: userError } = await supabase.from('user_chess_accounts').select().eq('uuid', data.user.id);

  if(userError) {
    console.log(userError)
    return new Response(JSON.stringify({ userError }), { status: 500 });
  }

  return new Response(JSON.stringify(userData[0] ?? { chesscom_name: "", lichess_name: "" }), { status: 200 });
}

export const POST = async (req: Request, res: Response) => {
  const { chesscom, lichess } = await req.json();

  const supabase = getSupabaseCilent();

  const { data, error } = await supabase.auth.getUser();

  if(error) 
    return new Response(JSON.stringify({ error }), { status: 500 });

  const { data: userData, error: userError } = await supabase.from('user_chess_accounts').upsert({ uuid: data.user.id, chesscom_name: chesscom, lichess_name: lichess }).eq('uuid', data.user.id).select();

  if(userError) {
    console.log(userError)
    return new Response(JSON.stringify({ userError }), { status: 500 });
  }

  return new Response(JSON.stringify({ data: { chesscom, lichess } }), { status: 200 });
}