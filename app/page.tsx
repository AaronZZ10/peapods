import { getListings } from "@/lib/actions/listings";
import { CreateListingForm } from "@/features/listings/CreateListingForm";
import { ListingCard } from "@/features/listings/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { MapSection } from "@/features/map/MapSection";
import { Badge } from "@/components/ui/badge";
import { Map as MapIcon, Sparkles } from "lucide-react";

export default async function Home() {
  const listings = await getListings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-16 pb-12 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-slate-50 to-slate-50"></div>

        <Badge
          variant="outline"
          className="mb-8 rounded-full border-slate-200 bg-white/50 px-4 py-1.5 text-sm font-medium text-slate-600 backdrop-blur-md"
        >
          <Sparkles className="mr-2 h-4 w-4 text-emerald-500" />
          The Student Sublease Network
        </Badge>

        <h1 className="max-w-4xl text-balance text-5xl font-black tracking-tighter text-slate-900 sm:text-7xl lg:text-8xl">
          Find your next home. <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Without the stress.
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-balance text-lg text-slate-500 sm:text-xl">
          PeaPods is the trust-first marketplace for university students and
          summer interns. Clear dates, verified locations, and a seamless map
          experience.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          {user ? (
            <CreateListingForm />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white/50 p-4 text-sm text-slate-600 backdrop-blur-md shadow-sm">
              Sign in to post your sublease and reach thousands of students.
            </div>
          )}
          <a
            href="#map"
            className="group flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm"
          >
            <MapIcon className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            Explore the Map
          </a>
        </div>
      </section>

      {/* Map Section */}
      <section id="map" className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between px-2">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Explore Stays
            </h2>
            <p className="text-slate-500">
              Interactive map matching for the perfect location.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit rounded-xl bg-slate-100 text-slate-600 border-none px-3 py-1"
          >
            {listings.length} Active Stays
          </Badge>
        </div>
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white shadow-sm ring-1 ring-slate-900/5">
          <MapSection initialListings={listings} />
        </div>
      </section>

      {/* Listings Grid */}
      <section className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center gap-6 px-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Latest Drops
          </h2>
          <div className="h-px flex-1 bg-slate-200/60" />
        </div>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-300 bg-slate-50/50 py-32 text-center">
            <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <MapIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              No stays listed yet
            </h3>
            <p className="mt-2 text-slate-500">
              Be the first to drop a listing in your area!
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
