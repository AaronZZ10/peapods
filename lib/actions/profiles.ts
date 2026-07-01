"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile() {
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

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Fallback: If database profile record is missing, create it
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || "PeaPods User",
        university: user.email?.endsWith(".edu") ? "Verified Student" : "Other",
        avatar_url: user.user_metadata?.avatar_url || null,
        bio: "",
        is_admin: user.id === "mock-student-id-1234" && process.env.NODE_ENV === "development",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating default profile:", insertError);
      return null;
    }
    return newProfile;
  }

  // Auto-sync Google avatar if it is not currently set in our database profile
  if (!profile.avatar_url && user.user_metadata?.avatar_url) {
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update({ avatar_url: user.user_metadata.avatar_url })
      .eq("id", user.id)
      .select()
      .single();
    if (updatedProfile) {
      return updatedProfile;
    }
  }

  return profile;
}

export async function updateProfile(data: {
  full_name: string;
  university: string;
  bio: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user = authUser;
  if (!user && process.env.NODE_ENV === "development") {
    user = {
      id: "mock-student-id-1234",
    } as any;
  }

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      university: data.university,
      bio: data.bio,
      avatar_url: data.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile");
}
