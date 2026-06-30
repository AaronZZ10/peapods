"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createListing(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const address = formData.get("address") as string;
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  const { error } = await supabase.from("listings").insert({
    user_id: user.id,
    title,
    description,
    price,
    address,
    location: `POINT(${longitude} ${latitude})`,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    console.error("Error creating listing:", error);
  }

  revalidatePath("/");
  redirect("/");
}

export async function deleteListing(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .match({ id, user_id: user.id });

  if (error) {
    console.error("Error deleting listing:", error);
  }

  revalidatePath("/");
}

export async function getListings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return data.map((listing: any) => ({
    ...listing,
    latitude: listing.location ? parseFloat(listing.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/)?.[2] || "0") : 0,
    longitude: listing.location ? parseFloat(listing.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/)?.[1] || "0") : 0,
  }));
}

export async function getListingsInBounds(minLat: number, maxLat: number, minLng: number, maxLng: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_listings_in_bounds", {
    min_lat: minLat,
    max_lat: maxLat,
    min_lng: minLng,
    max_lng: maxLng
  });

  if (error) {
    console.error("Error fetching listings in bounds:", error);
    return [];
  }

  return data;
}
