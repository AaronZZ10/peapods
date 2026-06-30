"use client";

import dynamic from "next/dynamic";

const WorkingListingsMap = dynamic(() => import("./WorkingListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-lg border flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  ),
});

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  latitude: number;
  longitude: number;
};

interface MapSectionProps {
  initialListings: Listing[];
}

export function MapSection({ initialListings }: MapSectionProps) {
  return (
    <section className="space-y-3">
      <WorkingListingsMap initialListings={initialListings} />
    </section>
  );
}
