import { getListings } from "@/lib/actions/listings";
import { CreateListingForm } from "@/features/listings/CreateListingForm";
import { ListingCard } from "@/features/listings/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { MapSection } from "@/features/map/MapSection";

export default async function Home() {
  const listings = await getListings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Find Your Perfect Sublease</h2>
        <p className="text-gray-600">
          Browse temporary housing for students and interns
        </p>
      </div>

      {user && <CreateListingForm />}

      <div className="mb-10">
        <MapSection initialListings={listings} />
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">Available Listings</h3>
        {listings.length === 0 ? (
          <p className="text-gray-500">
            No listings yet. Be the first to post one!
          </p>
        ) : (
          listings.map((listing: any) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isOwner={user?.id === listing.user_id}
            />
          ))
        )}
      </div>
    </div>
  );
}
