import { NextResponse } from 'next/server'
import { getSupabaseCilent } from '@/utils/serverHelpers';
import LoopsClient from 'loops';
import PostHogClient from '@/utils/posthog';

const loops = new LoopsClient(process.env.LOOPS_API_KEY!);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/play'

  if (code) {
    const supabase = getSupabaseCilent();

    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && user) {
      const posthog = PostHogClient();

      posthog.identify({
        distinctId: user.id,
        properties: {
          email: user.email
        }
      });
      
      posthog.capture({
        distinctId: user.id,
        event: "user_signup"
      })
      await posthog.shutdownAsync();

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