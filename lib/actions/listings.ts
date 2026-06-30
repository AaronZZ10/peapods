"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function geocodeAddress(address: string) {
  const query = new URLSearchParams({
    q: address,
    format: "jsonv2",
    limit: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${query.toString()}`,
    {
      cache: "no-store",
      headers: {
        "Accept-Language": "en",
        "User-Agent": "PeaPods/1.0",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to geocode address");
  }

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
  }>;

  if (!results.length) {
    throw new Error("Address could not be geocoded");
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
  };
}

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
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const { latitude, longitude } = await geocodeAddress(address);

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

  const { data, error } = await supabase.rpc("get_all_listings");

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return data;
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
