import { getSupabaseCilent } from "@/utils/serverHelpers";
import { LoopsClient } from "loops";

const loops = new LoopsClient(process.env.LOOPS_API_KEY!);

export const POST = async (req: Request) => {
  const supabase = getSupabaseCilent();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response("No user found", { status: 500 });
  }

  const { data, error } = await supabase
    .from("streaks")
    .select("updated_at,streak")
    .eq("uuid", user.id);

  if (data) {
    if (data[0]) {
      const s = data[0];

      const today = new Date(new Date().toISOString().split("T")[0]);
      const updatedDate = new Date(s.updated_at);

      if (today > updatedDate) {
        const { error: insertError } = await supabase.from("streaks").upsert({
          uuid: user.id,
          updated_at: new Date(),
          streak: s.streak + 1,
        });

        console.log(insertError);
      }

      // console.log(today > new Date(s.updated_at));
      // console.log(s.streak, s.updated_at);
    } else {
      const { error: insertError } = await supabase.from("streaks").insert({
        uuid: user.id,
        updated_at: new Date(),
        streak: 1,
      });

      console.log(insertError);
    }

    // const resp = await loops.sendEvent(
    //   {
    //     email: user.email,
    //   },
    //   "user_played_move",
    //   {
    //     lastUpdated: data[0] ? data[0].updated_at : new Date("2000-01-01"),
    //     streak: data[0] ? data[0].streak : 0
    //   }
    // )

    // console.log(resp);
  }

  return new Response("good");
};
