"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

const MOCK_FILE_PATH = path.join(process.cwd(), "tmp-messages.json");

function getMockMessagesFromFile(): any[] {
  try {
    if (fs.existsSync(MOCK_FILE_PATH)) {
      const content = fs.readFileSync(MOCK_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading mock messages:", err);
  }
  return [];
}

function saveMockMessagesToFile(messages: any[]) {
  try {
    fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify(messages, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing mock messages:", err);
  }
}

export async function getMessages(listingId: string, otherUserId?: string) {
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

  if (!user) return [];

  // Fetch listing to get host ID
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    console.error("Error fetching listing for messages:", listingError);
    return [];
  }

  const hostId = listing.user_id;
  const isHost = user.id === hostId;

  // Determine the other chat participant's ID
  let targetUserId = otherUserId;
  if (!isHost) {
    targetUserId = hostId;
  }

  if (!targetUserId) {
    return [];
  }

  // Development mock bypass using local JSON file
  if (user.id === "mock-student-id-1234" && process.env.NODE_ENV === "development") {
    const allMsgs = getMockMessagesFromFile();
    return allMsgs.filter(
      (msg) =>
        msg.listing_id === listingId &&
        ((msg.sender_id === user.id && msg.receiver_id === targetUserId) ||
          (msg.sender_id === targetUserId && msg.receiver_id === user.id))
    );
  }

  // Fetch messages exchanged between current user and target user
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      sender_id,
      receiver_id,
      created_at
    `)
    .eq("listing_id", listingId)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data || [];
}

export async function sendMessage(listingId: string, content: string, otherUserId?: string) {
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

  if (!user) throw new Error("Unauthorized");

  // Fetch listing to get host ID
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error("Listing not found");
  }

  const hostId = listing.user_id;
  const isHost = user.id === hostId;

  // Determine who receives the message
  let receiverId = otherUserId;
  if (!isHost) {
    receiverId = hostId;
  }

  if (!receiverId) {
    throw new Error("No receiver specified");
  }

  // Development mock bypass using local JSON file
  if (user.id === "mock-student-id-1234" && process.env.NODE_ENV === "development") {
    const allMsgs = getMockMessagesFromFile();
    const newMsg = {
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      created_at: new Date().toISOString(),
    };
    allMsgs.push(newMsg);
    saveMockMessagesToFile(allMsgs);
    revalidatePath(`/listings/${listingId}`);
    return;
  }

  const { error } = await supabase.from("messages").insert({
    listing_id: listingId,
    sender_id: user.id,
    receiver_id: receiverId,
    content,
  });

  if (error) {
    console.error("Error inserting message:", error);
    throw error;
  }

  revalidatePath(`/listings/${listingId}`);
}

// Fetch all active chats (conversation threads) for the host on this listing
export async function getListingConversations(listingId: string) {
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

  if (!user) return [];

  // Verify user is host
  const { data: listing } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  if (!listing || listing.user_id !== user.id) {
    return [];
  }

  // Get unique senders who sent messages to the host for this listing
  const { data, error } = await supabase
    .from("messages")
    .select(`
      sender_id,
      sender:profiles!messages_sender_id_fkey(full_name, email)
    `)
    .eq("listing_id", listingId)
    .neq("sender_id", user.id);

  if (error) {
    console.error("Error fetching listing conversations:", error);
    return [];
  }

  // Unique profiles
  const uniqueConversations = Array.from(
    new Map(data.map((item: any) => [item.sender_id, item.sender])).entries()
  ).map(([id, profile]: [string, any]) => ({
    userId: id,
    full_name: profile?.full_name || "Student Subletter",
    email: profile?.email || "",
  }));

  return uniqueConversations;
}
