import { getUserBookings } from "@/lib/actions/listings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, ExternalLink, ShieldCheck, Building2, User, MessageSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MyBookingsPage() {
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
    redirect("/");
  }

  const bookings = await getUserBookings();

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-2 py-4">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
        <p className="text-slate-500 text-sm">
          You have reserved <span className="font-semibold text-slate-800">{bookings.length}</span> room sublease{bookings.length === 1 ? "" : "s"} on PeaPods.
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-slate-200/80 bg-white p-12 text-center max-w-md mx-auto space-y-4">
          <div className="rounded-full bg-slate-50 p-4 w-fit mx-auto border">
            <ShieldCheck className="h-10 w-10 text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-950 text-lg">No bookings yet</h3>
            <p className="text-sm text-slate-500">
              When you reserve a sublease listing, it will be listed here with payment verification and host details.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-5 text-sm shadow-sm"
            >
              Explore Subleases
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((item) => {
            const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
            const hostProfile = item.profiles as any;

            return (
              <Card key={item.id} className="rounded-[2rem] border-slate-200/60 bg-white shadow-sm overflow-hidden flex flex-col sm:flex-row h-full">
                {/* Thumbnail Column */}
                <div className="w-full sm:w-2/5 relative min-h-[180px] bg-slate-100 border-r border-slate-100/60">
                  {firstImage ? (
                    <img src={firstImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <Building2 className="h-8 w-8 opacity-40" />
                    </div>
                  )}
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-extrabold border-none text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Secured
                    </Badge>
                  </div>
                </div>

                {/* Details Column */}
                <div className="w-full sm:w-3/5 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-950 text-base leading-tight hover:underline">
                      <Link href={`/listings/${item.id}`}>{item.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.address.split(",")[0]}</span>
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        {new Date(item.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                        {new Date(item.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </p>
                  </div>

                  {/* Host Panel */}
                  <div className="bg-slate-50/60 border border-slate-200/40 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-200">
                        {hostProfile?.avatar_url ? (
                          <img src={hostProfile.avatar_url} alt={hostProfile.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-slate-500" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 leading-none">{hostProfile?.full_name || "Host"}</p>
                        <p className="text-[10px] text-slate-400 leading-none">{hostProfile?.university || "Host Profile"}</p>
                      </div>
                    </div>
                    <Link
                      href="/messages"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-950 transition flex items-center justify-center shadow-xs"
                      title="Chat with Host"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-4">
                    <div className="flex items-baseline text-slate-900">
                      <span className="text-lg font-black">${item.price}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase ml-0.5">/month</span>
                    </div>

                    <Link
                      href={`/listings/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      View details <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
