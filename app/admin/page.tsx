import { redirect } from "next/navigation";
import { verifyAdmin, getAdminListings, getAdminProfiles } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAdmin = await verifyAdmin();

  // Strictly block non-admin access and redirect back to homepage
  if (!isAdmin) {
    redirect("/");
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

  const isSuperAdmin =
    user?.email === "aaronzz10101@gmail.com" ||
    (user?.id === "mock-student-id-1234" && process.env.NODE_ENV === "development");

  const [listings, profiles] = await Promise.all([
    getAdminListings(),
    getAdminProfiles(),
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Admin Control Center
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Manage system users, moderate active subleases, and audit transactions.
        </p>
      </div>

      <AdminDashboardClient
        initialListings={listings}
        initialProfiles={profiles}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
