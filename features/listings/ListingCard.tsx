"use client";

import { deleteListing } from "@/lib/actions/listings";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  start_date: string;
  end_date: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name?: string | null;
    email?: string;
  } | null;
  latitude?: number;
  longitude?: number;
};

export function ListingCard({
  listing,
  isOwner,
}: {
  listing: Listing;
  isOwner: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          <p className="text-2xl font-bold text-green-600">
            ${listing.price}/mo
          </p>
        </div>
        {isOwner && (
          <form action={deleteListing.bind(null, listing.id)}>
            <button
              type="submit"
              className="text-red-600 text-sm hover:underline"
            >
              Delete
            </button>
          </form>
        )}
      </div>
      <p className="text-gray-600 mt-2">{listing.description}</p>
      <div className="mt-2 text-sm text-gray-500">
        <p>{listing.address}</p>
        <p>
          Available: {new Date(listing.start_date).toLocaleDateString()} -{" "}
          {new Date(listing.end_date).toLocaleDateString()}
        </p>
        <p className="mt-1">
          Posted by:{" "}
          {listing.profiles?.full_name ||
            listing.profiles?.email ||
            "Anonymous"}
        </p>
      </div>
    </div>
  );
}
