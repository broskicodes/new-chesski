import PostHogClient from "@/utils/posthog";
import { CHESSKI_MONTHLY_PRICE, CHESSKI_YEARLY_PRICE } from "@/utils/types";
import { createServerClient } from "@supabase/ssr";
import { LoopsClient } from "loops";
import Stripe from "stripe";

const loops = new LoopsClient(process.env.LOOPS_API_KEY!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  // https://github.com/stripe/stripe-node#configuration
  // https://stripe.com/docs/api/versioning
  // @ts-ignore
  apiVersion: null,
  // Register this as an official Stripe plugin.
  // https://stripe.com/docs/building-plugins#setappinfo
  appInfo: {
    name: "Chesski",
    version: "0.0.0",
    url: process.env.ENV_URL,
  },
});

export const POST = async (req: Request) => {
  const sig = req.headers.get("stripe-signature");

  let event;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      sig!,
      endpointSecret,
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { cookies: {} },
  );

  // Handle the event
  switch (event.type) {
    case "customer.subscription.updated":
      console.log("updated");
      break;
    case "customer.subscription.deleted":
      // console.log("deleted", event.data);
      const sub_id = event.data.object.id;

      const { data, error } = await supabase
        .from("pro_users")
        .update({
          active: false,
        })
        .eq("sub_id", sub_id)
        .select("*");

      console.log(data, error);
      // console.log(sub_id);
      break;

    case "checkout.session.completed":
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ["line_items"],
        },
      );
      const lineItems = sessionWithLineItems.line_items;
      const price_id = lineItems?.data[0].price?.id;
      const user_id = sessionWithLineItems.metadata?.user_id;
      const trial = sessionWithLineItems.metadata?.trial;
      const user_email = sessionWithLineItems.customer_details?.email;

      if (!user_id) {
        return new Response("Invalid user somehow", { status: 500 });
      }

      // console.log(sessionWithLineItems.customer);

      if (
        price_id === process.env.CHESSKI_MONTHLY_ID ||
        price_id === process.env.CHESSKI_YEARLY_ID
      ) {
        const { data, error } = await supabase
          .from("pro_users")
          .insert({
            user_id: user_id,
            sub_id: sessionWithLineItems.subscription,
            customer_id: sessionWithLineItems.customer,
            active: true,
          })
          .select("*");

        // console.log(sessionWithLineItems.customer_details?.email, sessionWithLineItems.customer_email);

        const posthog = PostHogClient();
        posthog.identify({
          distinctId: user_id,
          properties: {
            email: sessionWithLineItems.customer_email,
          },
        });

        posthog.capture({
          distinctId: user_id,
          event: trial ? "trial_started" : "sub_purchased",
        });
        await posthog.shutdownAsync();

        if (trial) {
          const loopsRes = await loops.sendEvent({ 
            eventName: "trialStarted",
            email: user_email!,
            contactProperties: {
              plan: "trial"
            },
            eventProperties: {
              price: price_id === process.env.CHESSKI_MONTHLY_ID ? CHESSKI_MONTHLY_PRICE : CHESSKI_YEARLY_PRICE,
              period: price_id === process.env.CHESSKI_MONTHLY_ID ? "month" : "year"
            }
          });
          console.log("loops success:" + loopsRes.success);
        }

        console.log(data, error);
      }
      break;
    // const email = checkoutSessionCompleted.customer_details?.email
    // const name = checkoutSessionCompleted.customer_details?.name;
    // const amount = checkoutSessionCompleted.amount_subtotal;

    // const { data, error } = await supabase
    //   .rpc("get_user_by_email", { query_email: email });

    // const user_id = data && data[0] ? data[0].id : null;

    // const { error: insertError } = await supabase.from("user_donos")
    //   .insert({
    //     email,
    //     name,
    //     amount,
    //     uuid: user_id
    //   });

    // if (!insertError) {
    //   const contacts = await loops.findContact(email!);

    //   if (contacts.length > 0) {
    //     const res = await loops.updateContact(email!, {
    //       supporter: true
    //     });

    //     if (!res.success && res.message !== "Email or userId is already on list.") {
    //       console.log(res);
    //       console.error(`Couldn't subscribe user with email ${email} to Loops.`);
    //     }
    //   } else {
    //     let first: string = "";
    //     let last: string = "";

    //     if (name) {
    //       first = name.replace(" ", "@").split("@")[0];
    //       last = name.replace(" ", "@").split("@")[1];
    //     }

    //     const res = await loops.createContact(email!, {
    //       firstName: first,
    //       lastName: last,
    //       supporter: true
    //     });

    //     if (!res.success && res.message !== "Email or userId is already on list.") {
    //       console.log(res);
    //       console.error(`Couldn't subscribe user with email ${email} to Loops.`);
    //     }
    //   }
    // }

    // Then define and call a function to handle the event checkout.session.completed
    // break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response("Payment success", { status: 200 });
};
