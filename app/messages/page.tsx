import { getUserConversations } from "@/lib/actions/messages";
import { InboxClient } from "./InboxClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
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

  const initialConversations = await getUserConversations();

  return (
    <div className="max-w-6xl mx-auto px-2 py-4">
      <InboxClient initialConversations={initialConversations} currentUserId={user.id} />
    </div>
  );
}
