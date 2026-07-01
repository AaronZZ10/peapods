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
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Initialize map only if it doesn't exist yet
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([39.9526, -75.1652], 13);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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
          marker.bindPopup(
            `
            <div style="font-family: sans-serif; padding: 4px; min-width: 200px;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <span style="background: #ecfdf5; color: #059669; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; border: 1px solid #d1fae5;">Student Stay</span>
                <span style="font-weight: 800; color: #059669; font-size: 16px;">$${listing.price}</span>
              </div>
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.2;">${listing.title}</h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #059669;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                ${listing.address.split(",")[0]}
              </p>
              <a href="/listings/${listing.id}" style="display: block; text-align: center; text-decoration: none; width: 100%; background: #059669; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; box-sizing: border-box;">View Details</a>
            </div>
          `,
            {
              maxWidth: 250,
              className: "student-popup",
            },
          );
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
