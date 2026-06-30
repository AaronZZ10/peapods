import { getListings } from "@/lib/actions/listings";
import { CreateListingForm } from "@/features/listings/CreateListingForm";
import { ListingCard } from "@/features/listings/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { MapSection } from "@/features/map/MapSection";
import { Badge } from "@/components/ui/badge";
import { Search, Map as MapIcon, ShieldCheck, Sparkles } from "lucide-react";

export default async function Home() {
  const listings = await getListings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-600 px-6 py-12 text-white sm:px-12 sm:py-20">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/50 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/30 blur-3xl" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <Badge className="bg-emerald-400/20 text-emerald-50 hover:bg-emerald-400/30 border-none px-4 py-1 text-xs font-bold uppercase tracking-wider">
              Student Sublease Network
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                Your next home, <br />
                <span className="text-emerald-200">found on the map.</span>
              </h1>
              <p className="max-w-xl text-lg text-emerald-50/80 leading-relaxed">
                PeaPods is the trust-first marketplace for university students
                and summer interns. No more sketchy listings—just clear dates,
                verified locations, and student vibes.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {user ? (
                <CreateListingForm />
              ) : (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-sm text-emerald-50">
                  Sign in to post your sublease and reach thousands of students.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: MapIcon,
                title: "Map Discovery",
                desc: "Find stays exactly where you need to be.",
                color: "bg-amber-400",
              },
              {
                icon: ShieldCheck,
                title: "Student Verified",
                desc: "Trust-based matching for peace of mind.",
                color: "bg-sky-400",
              },
              {
                icon: Search,
                title: "Fast Search",
                desc: "Filter by budget, dates, and campus proximity.",
                color: "bg-violet-400",
              },
              {
                icon: Sparkles,
                title: "Simple Setup",
                desc: "Post your room in under 2 minutes.",
                color: "bg-pink-400",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 p-6 transition-all hover:bg-white/15"
              >
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${feature.color} text-white shadow-lg`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-emerald-50/60 leading-snug">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Explore the Area
            </h2>
            <p className="text-slate-500">
              Find the perfect spot near your campus or office.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-slate-200 text-slate-500"
          >
            {listings.length} Active Stays
          </Badge>
        </div>
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <MapSection initialListings={listings} />
        </div>
      </section>

      {/* Listings Grid */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-100" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Latest Stays
          </h2>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4">
              <MapIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No stays listed yet
            </h3>
            <p className="text-sm text-slate-500">
              Be the first to post a listing in this area!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing: any) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isOwner={user?.id === listing.user_id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
