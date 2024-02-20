import { NextResponse } from 'next/server'
import { getSupabaseCilent } from '@/utils/serverHelpers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/profile'

  if (code) {
    const supabase = getSupabaseCilent();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('redirecting to', `${origin}${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}