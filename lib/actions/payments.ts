"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

export async function createReservationSession(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user = authUser;
  if (!user && process.env.NODE_ENV === "development") {
    user = {
      id: "mock-student-id-1234",
      email: "mock-student@drexel.edu",
      full_name: "Mock Student",
    } as any;
  }

  if (!user) {
    redirect("/");
  }

  // Fetch listing details
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error("Listing not found");
  }

  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/listings/${listingId}?success=true`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/listings/${listingId}?canceled=true`;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.warn("STRIPE_SECRET_KEY is not set. Redirecting to visual mock Stripe Checkout.");
    redirect(`/payments/mock-checkout?listingId=${listingId}`);
  }

  // Initialize Stripe
  const stripe = new Stripe(stripeSecretKey);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Reservation Deposit - ${listing.title}`,
            description: `Deposit to reserve the sublease at ${listing.address}`,
            images: listing.images && listing.images.length > 0 ? [listing.images[0]] : [],
          },
          unit_amount: 10000, // $100.00
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      listing_id: listingId,
      user_id: user.id,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session URL");
  }

  redirect(session.url);
}

export async function confirmMockPayment(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user = authUser;
  if (!user && process.env.NODE_ENV === "development") {
    user = {
      id: "mock-student-id-1234",
      email: "mock-student@drexel.edu",
      full_name: "Mock Student",
    } as any;
  }

  const { error } = await supabase.rpc("mark_listing_as_reserved", {
    target_listing_id: listingId,
    reserver_id: user?.id || null,
  });

  if (error) {
    console.error("Error executing mark_listing_as_reserved RPC for mock payment:", error);
  }

  revalidatePath(`/listings/${listingId}`);
  redirect(`/listings/${listingId}?success=true`);
}
