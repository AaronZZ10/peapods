"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user = authUser;
  if (!user && process.env.NODE_ENV === "development") {
    user = {
      id: "mock-student-id-1234",
      email: "mock-student@drexel.edu",
    } as any;
  }

  if (!user) {
    return false;
  }

  // Auto-grant admin to the specified emails or mock student in dev
  if (user.email === "aaronzz10101@gmail.com" || user.email === "aaronzz10@tamu.edu") {
    return true;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin) {
    return true;
  }

  // Development bypass
  if (user.id === "mock-student-id-1234" && process.env.NODE_ENV === "development") {
    return true;
  }

  return false;
}

export async function getAdminListings() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized access");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        university
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin listings:", error);
    return [];
  }

  return data || [];
}

export async function getAdminProfiles() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized access");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching admin profiles:", error);
    return [];
  }

  return data || [];
}

export async function adminDeleteListing(listingId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized access");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId);

  if (error) {
    console.error("Error deleting listing as admin:", error);
    throw new Error("Failed to delete listing");
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function adminToggleRole(profileId: string, currentStatus: boolean) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized access");
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user = authUser;
  if (!user && process.env.NODE_ENV === "development") {
    user = {
      id: "mock-student-id-1234",
      email: "mock-student@drexel.edu",
    } as any;
  }

  if (!user) {
    throw new Error("Unauthorized access");
  }

  // Only the super administrator (aaronzz10101@gmail.com) or development mock student can edit roles
  const isSuperAdmin =
    user.email === "aaronzz10101@gmail.com" ||
    (user.id === "mock-student-id-1234" && process.env.NODE_ENV === "development");

  if (!isSuperAdmin) {
    throw new Error(
      "Unauthorized: Only the super administrator (aaronzz10101@gmail.com) can manage administrator roles."
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: !currentStatus })
    .eq("id", profileId);

  if (error) {
    console.error("Error toggling admin role:", error);
    throw new Error("Failed to toggle admin role");
  }

  revalidatePath("/admin");
}
