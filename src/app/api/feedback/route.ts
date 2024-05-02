import { getSupabaseCilent } from "@/utils/serverHelpers";

export const POST = async (req: Request) => {
  const { feedback, uid } = await req.json();

  const supabase = getSupabaseCilent();

  const { data, error } = await supabase.from("feedback").insert({
    user_id: uid,
    feedback: feedback,
  });

  console.log(error, data);

  return new Response("ok");
};
