import { getListingById, deleteListing } from "@/lib/actions/listings";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CalendarDays, MapPin, User, Trash2, ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import ListingDetailsMap from "@/features/map/ListingDetailsMap";
import { cn } from "@/lib/utils";
import { ChatDrawer } from "@/features/listings/ChatDrawer";
import { createReservationSession } from "@/lib/actions/payments";

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { id } = await params;
  const searchParamsResolved = await searchParams;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Development mock user bypass for testing without Google login configured
  let user = authUser;
  if (!user && process.env.NODE_ENV === "development") {
    user = {
      id: "mock-student-id-1234",
      email: "mock-student@drexel.edu",
      full_name: "Mock Student",
    } as any;
  }

  if (searchParamsResolved.success === "true") {
    // Call database RPC directly on success page load as a robust fallback for local dev webhook testing
    await supabase.rpc("mark_listing_as_reserved", {
      target_listing_id: id,
      reserver_id: user?.id || null,
    });
  }

  const listing = await getListingById(id);

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto px-4">
        <div className="rounded-full bg-slate-100 p-4">
          <MapPin className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Listing not found</h2>
        <p className="text-slate-500">
          The sublease you are looking for does not exist or has been removed by the host.
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants({ size: "lg" }),
            "rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold px-6 py-2"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings
        </Link>
      </div>
    );
  }

  // User is already resolved at the top of the function

  const isOwner = user?.id === listing.user_id;
  const hasImages = listing.images && listing.images.length > 0;

  // Format date range nicely
  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "rounded-full gap-2 text-slate-600 hover:text-slate-900"
          )}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>
        {isOwner && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none font-bold py-1 px-3">
            YOUR LISTING
          </Badge>
        )}
      </div>

      {/* Search Params Status Notifications */}
      {searchParamsResolved.success === "true" && (
        <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2.5 shadow-sm">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>🎉 Reservation successful! Your deposit has been confirmed, and this sublease has been reserved.</span>
        </div>
      )}
      {searchParamsResolved.canceled === "true" && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2.5 shadow-sm">
          <span>⚠️ Reservation checkout was canceled. You can try reserving again when ready.</span>
        </div>
      )}

      {/* Header Gallery */}
      {hasImages ? (
        <div className="space-y-4">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2">
            {listing.images.map((img: string, index: number) => (
              <div
                key={index}
                className="relative h-[300px] sm:h-[480px] w-[85%] sm:w-[70%] snap-center rounded-[2.5rem] overflow-hidden border border-slate-200/60 shadow-md shrink-0 bg-slate-100"
              >
                <img
                  src={img}
                  alt={`${listing.title} - Slide ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {listing.images.length > 1 && (
            <p className="text-xs text-slate-400 text-right font-medium pr-4">
              Swipe to see all {listing.images.length} photos
            </p>
          )}
        </div>
      ) : (
        <div className="relative h-[250px] sm:h-[350px] w-full rounded-[2.5rem] bg-gradient-to-br from-emerald-100 via-teal-50 to-slate-100 flex flex-col justify-end p-8 border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/30 via-slate-100/50 to-slate-200/50 -z-10" />
          <div className="flex items-center gap-2 mb-3">
            <Badge className="w-fit bg-white/95 text-emerald-700 hover:bg-white border-none font-extrabold shadow-sm">
              Student Sublet
            </Badge>
            {listing.reserved && (
              <Badge className="bg-rose-600 text-white font-extrabold shadow-sm border-none">
                RESERVED
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {listing.title}
          </h1>
        </div>
      )}

      {/* Title block when images are shown */}
      {hasImages && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-bold">
              Student Stay
            </Badge>
            {listing.reserved ? (
              <Badge className="bg-rose-600 text-white font-extrabold shadow-sm border-none">
                RESERVED
              </Badge>
            ) : (
              <Badge variant="outline" className="border-slate-200 bg-white">
                Verified Address
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            {listing.title}
          </h1>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <Card className="rounded-[2rem] border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b pb-6">
                <div>
                  <span className="text-4xl font-black text-slate-900">${listing.price}</span>
                  <span className="text-slate-500 font-semibold">/ month</span>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-2xl border border-emerald-100 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider">Student Rate</p>
                  <p className="text-xs font-semibold">All utilities included</p>
                </div>
              </div>

              {/* Dates & Location list */}
              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sublease Period</h4>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {formatDate(listing.start_date)}
                    </p>
                    <p className="text-xs text-slate-500">to {formatDate(listing.end_date)}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</h4>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 line-clamp-2">
                      {listing.address}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Section */}
          <Card className="rounded-[2rem] border-slate-200/60 bg-white shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-black text-slate-900">About this place</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </CardContent>
          </Card>

          {/* Host Info Section */}
          <Card className="rounded-[2rem] border-slate-200/60 bg-white shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xl font-black text-teal-800 uppercase ring-2 ring-white shadow-sm">
                  {(listing.profiles?.full_name || listing.profiles?.email || "A")[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-bold text-slate-900">
                      Hosted by {listing.profiles?.full_name || "Verified Student"}
                    </h3>
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    PeaPods Verified Student Sublease Host
                  </p>
                </div>
              </div>
              {user ? (
                <ChatDrawer
                  listingId={listing.id}
                  hostName={listing.profiles?.full_name || "Host"}
                  isHost={isOwner}
                  currentUserId={user.id}
                />
              ) : (
                <div className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-center w-full sm:w-auto">
                  Sign in to chat
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Map & Controls */}
        <div className="space-y-6">
          {/* Reservation Card */}
          <Card className={cn(
            "rounded-[2rem] border overflow-hidden shadow-sm",
            listing.reserved ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200/60 bg-white"
          )}>
            <CardContent className="p-6 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                {listing.reserved ? "Reserved Sublease" : "Reserve this sublease"}
              </h4>
              {listing.reserved ? (
                <div className="space-y-3">
                  <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 border border-emerald-200">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                    This place is reserved!
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    A deposit has been paid to hold this room. The listing is no longer active for new bookings.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pay a **$100 deposit** via Stripe to reserve this sublease and remove it from public search. The host will receive confirmation instantly.
                  </p>
                  {user ? (
                    isOwner ? (
                      <div className="bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-2 rounded-xl border border-amber-100">
                        Hosts cannot reserve their own listing.
                      </div>
                    ) : (
                      <form action={createReservationSession.bind(null, listing.id)}>
                        <Button
                          type="submit"
                          className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-sm font-bold gap-2 text-white h-10"
                        >
                          Reserve Place
                        </Button>
                      </form>
                    )
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-2">Sign in to book this sublease</p>
                      <Button disabled className="w-full rounded-full bg-slate-100 text-slate-400 cursor-not-allowed">
                        Reserve Place
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map details */}
          <Card className="rounded-[2rem] border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold text-slate-950 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-500" /> Location Details
              </h3>
            </div>
            <div className="p-2 bg-slate-50">
              <ListingDetailsMap
                latitude={Number(listing.latitude)}
                longitude={Number(listing.longitude)}
                address={listing.address}
              />
            </div>
          </Card>

          {/* Owner options if applicable */}
          {isOwner && (
            <Card className="rounded-[2rem] border-rose-200/80 bg-rose-50/50 shadow-sm border overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <h4 className="font-bold text-rose-955 text-sm uppercase tracking-wide">Owner Dashboard</h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  You created this listing. You can remove it at any time if you find a roommate or need to make updates. This will instantly drop the listing from the map and catalog.
                </p>
                <form action={deleteListing.bind(null, listing.id)} className="w-full">
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full rounded-full bg-rose-600 hover:bg-rose-700 shadow-sm gap-2 font-bold"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Sublease
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
