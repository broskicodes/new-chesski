import { getSupabaseCilent } from "@/utils/serverHelpers";
import { SubType } from "@/utils/types";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  // @ts-ignore
  apiVersion: null,
  appInfo: {
    name: "Chesski",
    version: "0.0.0",
    url: process.env.ENV_URL,
  },
});

export const POST = async (req: Request) => {
  const supabase = getSupabaseCilent();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response("Error getting user", { status: 500 });
  }

  const { data } = await supabase
    .from("pro_users")
    .select("*")
    .eq("user_id", user.id);

  if (!data || !data[0] || !data[0].customer_id) {
    return new Response("Error. No customer listed", { status: 500 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data[0].customer_id,
    return_url: `${process.env.ENV_URL}/play`,
  });

  if (!session) {
    return new Response("Error creating session", { status: 500 });
  }

  // console.log(session.url)
  return new Response(session.url);
};
