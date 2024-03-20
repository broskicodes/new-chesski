import { createServerClient } from "@supabase/ssr";
import LoopsClient from "loops";
import stripe from "stripe";

const loops = new LoopsClient(process.env.LOOPS_API_KEY!);

export const POST = async (req: Request) => {
  const sig = req.headers.get('stripe-signature');

  let event;
  const endpointSecret = "whsec_7988fec904fd2dac87909ae3e729a4dd5a93f586172f413ffb8964c548f07a19";

  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig!, endpointSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!,
        {
          cookies: {}
        }
      );

      const checkoutSessionCompleted = event.data.object;

      const email = checkoutSessionCompleted.customer_details?.email
      const name = checkoutSessionCompleted.customer_details?.name;
      const amount = checkoutSessionCompleted.amount_subtotal;

      const { data, error } = await supabase
        .rpc("get_user_by_email", { query_email: email });

      const user_id = data && data[0] ? data[0].id : null;

      const { error: insertError } = await supabase.from("user_donos")
        .insert({
          email,
          name,
          amount,
          uuid: user_id
        });

      if (!insertError) {
        const contacts = await loops.findContact(email!);

        if (contacts.length > 0) {
          const res = await loops.updateContact(email!, {
            supporter: true
          });

          if (!res.success && res.message !== "Email or userId is already on list.") {
            console.log(res);
            console.error(`Couldn't subscribe user with email ${email} to Loops.`);
          }
        } else {
          let first: string = "";
          let last: string = "";

          if (name) {
            first = name.replace(" ", "@").split("@")[0];
            last = name.replace(" ", "@").split("@")[1];
          }

          const res = await loops.createContact(email!, {
            firstName: first,
            lastName: last,
            supporter: true
          });

          if (!res.success && res.message !== "Email or userId is already on list.") {
            console.log(res);
            console.error(`Couldn't subscribe user with email ${email} to Loops.`);
          }
        }
      }
        
      // Then define and call a function to handle the event checkout.session.completed
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response("Payment success", { status: 200 });
}