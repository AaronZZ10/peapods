import { getUserListings, deleteListing } from "@/lib/actions/listings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Trash2, ExternalLink, ShieldCheck, Building2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MyListingsPage() {
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

  const listings = await getUserListings();

  async function handleDelete(formData: FormData) {
    "use server";
    const listingId = formData.get("listingId") as string;
    await deleteListing(listingId);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-2 py-4">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Listings</h1>
        <p className="text-slate-500 text-sm">
          You have published <span className="font-semibold text-slate-800">{listings.length}</span> room sublease{listings.length === 1 ? "" : "s"} on PeaPods.
        </p>
      </div>

      {listings.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-slate-200/80 bg-white p-12 text-center max-w-md mx-auto space-y-4">
          <div className="rounded-full bg-slate-50 p-4 w-fit mx-auto border">
            <Building2 className="h-10 w-10 text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-950 text-lg">No listings yet</h3>
            <p className="text-sm text-slate-500">
              Publish your empty bedroom or apartment to start receiving messages from students.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-5 text-sm shadow-sm"
            >
              Go to Map Discovery
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((item) => {
            const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
            return (
              <Card key={item.id} className="rounded-[2rem] border-slate-200/60 bg-white shadow-sm overflow-hidden flex flex-col sm:flex-row h-full">
                {/* Thumbnail Column */}
                <div className="w-full sm:w-2/5 relative min-h-[160px] bg-slate-100 border-r border-slate-100/60">
                  {firstImage ? (
                    <img src={firstImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <Building2 className="h-8 w-8 opacity-40" />
                    </div>
                  )}
                  {/* Status Badge overlay */}
                  <div className="absolute top-3 left-3">
                    {item.reserved ? (
                      <Badge className="bg-red-500 hover:bg-red-500 text-white font-extrabold border-none text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md shadow-sm">
                        Reserved
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white font-extrabold border-none text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md shadow-sm">
                        Active
                      </Badge>
                    )}
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

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
                    <div className="flex items-baseline text-slate-900">
                      <span className="text-lg font-black">${item.price}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase ml-0.5">/month</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/listings/${item.id}`}
                        className="p-2 rounded-full hover:bg-slate-50 border border-slate-200/60 text-slate-600 hover:text-slate-900 transition flex items-center justify-center"
                        title="View Listing Details"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>

                      <form action={handleDelete} className="inline-block">
                        <input type="hidden" name="listingId" value={item.id} />
                        <button
                          type="submit"
                          className="p-2 rounded-full hover:bg-red-50 border border-slate-200/60 text-slate-500 hover:text-red-600 hover:border-red-100 transition flex items-center justify-center cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
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
