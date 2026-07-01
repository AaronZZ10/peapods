import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !endpointSecret) {
    console.error("Stripe keys are not configured in environment variables.");
    return NextResponse.json({ error: "Stripe is not configured on the server" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful reservation checkout completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const listingId = session.metadata?.listing_id;
    const userId = session.metadata?.user_id;

    if (listingId) {
      console.log(`Stripe reservation payment succeeded for listing: ${listingId} by user: ${userId}`);
      
      // Call the SECURITY DEFINER RPC to bypass RLS and flag as reserved
      const { error } = await supabase.rpc("mark_listing_as_reserved", {
        target_listing_id: listingId,
        reserver_id: userId || null,
      });

      if (error) {
        console.error("Database update via RPC failed:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
