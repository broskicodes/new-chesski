import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'


export const POST = async (req: Request, res: Response) => {
  const { email } = await req.json();

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

  const { data, error } = await supabase.from('users').insert([{ email }]).select();

  if(error) 
    return new Response(JSON.stringify({ error }), { status: 500 });

  return new Response(JSON.stringify({ data }), { status: 200 });
}