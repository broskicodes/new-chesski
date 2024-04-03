import { getSupabaseCilent } from "@/utils/serverHelpers"
import { createServerClient } from "@supabase/ssr";

export const runtime = "edge";

export const GET = async (req: Request) => {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { cookies: {} }
  );

  const { data, error } = await supabase
    .from("daily_position_queries")
    .select("user_id");

  if (!data) {
    console.log(error);
    return new Response(`Couldn't exectute cron job. ${new Date()}`, {
      status: 500
    });
  }

  await Promise.all(data?.map(async (s) => {
    const { error: updateError } = await supabase
      .from("daily_position_queries")
      .update({
        number: 0,
      })
      .eq("user_id", s.user_id)

    if (updateError) {
      console.error(updateError);
    }
  }));

  return new Response("Cron complete");
}