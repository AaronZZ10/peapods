"use client";

import { useEffect, useState, useRef } from "react";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  latitude: number;
  longitude: number;
};

interface WorkingListingsMapProps {
  initialListings: Listing[];
}

export default function WorkingListingsMap({
  initialListings,
}: WorkingListingsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    setListings(initialListings);
  }, [initialListings]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && mapRef.current && typeof window !== "undefined") {
      const L = require("leaflet");

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Initialize map only if it doesn't exist yet
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([39.9526, -75.1652], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
        requestAnimationFrame(() => {
          map.invalidateSize();
        });
      }

      if (mapInstanceRef.current) {
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        listings.forEach((listing) => {
          if (
            typeof listing.latitude !== "number" ||
            typeof listing.longitude !== "number"
          ) {
            return;
          }

          const marker = L.marker([listing.latitude, listing.longitude]).addTo(
            mapInstanceRef.current,
          );
          marker.bindPopup(`
            <div>
              <h3 style="font-weight: bold;">${listing.title}</h3>
              <p style="color: #16a34a; font-weight: bold;">$${listing.price}/mo</p>
              <p>${listing.address}</p>
              <p style="font-size: 0.875rem; color: #6b7280;">${listing.description}</p>
            </div>
          `);
          markersRef.current.push(marker);
        });
      }
    }
  }, [isMounted, listings]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isMounted) {
    return <div style={{ height: "500px", width: "100%" }}>Loading map...</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-medium text-gray-900">Map View</p>
        <p className="text-xs text-gray-500">
          {listings.length} listing{listings.length === 1 ? "" : "s"} shown
        </p>
      </div>
      <div
        ref={mapRef}
        style={{
          height: "500px",
          width: "100%",
        }}
      />
    </div>
  );
}
