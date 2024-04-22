import { getSupabaseCilent } from "@/utils/serverHelpers";
import LoopsClient from "loops";

const loops = new LoopsClient(process.env.LOOPS_API_KEY!);

export const POST = async (req: Request) => {
  const supabase = getSupabaseCilent();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response("No user found", { status: 500 })
  }

  const { data, error } = await supabase.from("free_trial_tracker")
    .select("user_id")
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }

  if (data.length > 0) {
    return new Response(JSON.stringify({ emailTriggered: false }), { status: 200 });
  }

  const { data: subData, error: subError } = await supabase.from("pro_user")
    .select("user_id")
    .eq("user_id", user.id);

  if (subError) {
    console.error(subError);
    return new Response(subError.message, { status: 500 });
  }

  if (subData.length > 0) {
    return new Response(JSON.stringify({ emailTriggered: false }), { status: 200 });
  }

  const loopsRes = await loops.sendEvent({ email: user.email }, "subPageVisit")

  if (!loopsRes.success) {
    return new Response("Error triggering email", { status: 500 });
  }

  const { error: inError } = await supabase.from("free_trial_tracker")
    .insert({ user_id: user.id });


  if (inError) {
    console.error(inError);
    return new Response(inError.message, { status: 500 });
  }

  return new Response(JSON.stringify({ emailTriggered: true }), { status: 200 });
}