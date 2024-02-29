import { NextResponse } from 'next/server'
import { getSupabaseCilent } from '@/utils/helpers';
import LoopsClient from 'loops';

const loops = new LoopsClient(process.env.LOOPS_API_KEY!);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/profile'

  if (code) {
    const supabase = getSupabaseCilent();

    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && user) {
      const [first, last] = user.user_metadata.full_name.replace(" ", "@").split("@");

      const res = await loops.createContact(user.email!, {
        userId: user.id,
        firstName: first,
        lastName: last,
      })

      if (!res.success && res.message !== "Email or userId is already on list.") {
        console.log(res);
        console.error(`Couldn't subscribe user ${user.id} with email ${user.email} to Loops.`);
      }

      console.log('redirecting to', `${origin}${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}