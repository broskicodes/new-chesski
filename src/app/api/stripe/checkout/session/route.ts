import { getSupabaseCilent } from "@/utils/serverHelpers";
import { SubType } from "@/utils/types";
import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? '',
  {
    // @ts-ignore
    apiVersion: null,
    appInfo: {
      name: 'Chesski',
      version: '0.0.0',
      url: process.env.ENV_URL
    }
  }
);



export const POST = async (req: Request) => {
  const { subType, referral } = await req.json();

  console.log(referral);

  let productId: string;
  switch (subType) {
    case SubType.Monthly:
      productId = process.env.CHESSKI_MONTHLY_ID!;
      break;
    case SubType.Yearly:
      productId = process.env.CHESSKI_YEARLY_ID!
      break;
    default:
      productId = process.env.CHESSKI_MONTHLY_ID!;
  }
  const supabase = getSupabaseCilent();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return new Response("Error getting user", { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    // customer: user ? user.id : undefined,
    customer_email: user ? user.email : undefined,
    // client_reference_id: user ? user.id : "",
    success_url: `${process.env.ENV_URL}/play`,
    cancel_url: `${process.env.ENV_URL}/subscribe`,
    line_items: [{
      price: productId,
      quantity: 1
    }],
    mode: "subscription",
    metadata: {
      user_id: user ? user.id : null,
      tolt_referral: referral
    },
    allow_promotion_codes: true
  });

  if (!session) {
    return new Response("Error creating session", { status: 500 });
  }

  // console.log(session.url)
  return new Response(session.url);
}