import { getSupabaseCilent } from "@/utils/serverHelpers";

export const POST = async (req: Request) => {
  const { feedback, uid, email } = await req.json();

  const supabase = getSupabaseCilent();

  const { data, error } = await supabase.from("feedback").insert({
    user_id: uid,
    feedback: feedback,
  });

  console.log(error, data);

  const res = await fetch("https://api.divinate.co/team/api/v0/create-one", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.DIVINATE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: feedback,
      email: email,
      name: uid
    })
  });

  console.log(await res.json())

  return new Response("ok");
};
