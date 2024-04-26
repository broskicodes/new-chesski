import { getSupabaseCilent } from "@/utils/serverHelpers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "edge";

export const GET = async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { cookies: {} },
  );

  const { data, error } = await supabase
    .from("streaks")
    .select("updated_at,streak,uuid");

  if (!data) {
    console.log(error);
    return new Response(`Couldn't exectute cron job. ${new Date()}`, {
      status: 500,
    });
  }

  await Promise.all(
    data?.map(async (s) => {
      const updatedDate = new Date(s.updated_at);
      updatedDate.setDate(updatedDate.getDate() + 1);

      const currentDate = new Date();
      currentDate.setUTCHours(0, 0, 0, 0);

      if (updatedDate < currentDate) {
        const { error: updateError } = await supabase
          .from("streaks")
          .update({
            streak: 0,
          })
          .eq("uuid", s.uuid);

        if (updateError) {
          console.error(updateError);
        }
      }
    }),
  );

  return new Response("Cron complete");
};
