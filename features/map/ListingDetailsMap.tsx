"use client";

import { useEffect, useState, useRef } from "react";

interface ListingDetailsMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

export default function ListingDetailsMap({
  latitude,
  longitude,
  address,
}: ListingDetailsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([latitude, longitude], 15);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(map);

        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(`<div style="font-family: sans-serif; font-size: 12px; font-weight: 600; padding: 2px;">${address.split(",")[0]}</div>`)
          .openPopup();

        mapInstanceRef.current = map;

        requestAnimationFrame(() => {
          map.invalidateSize();
        });
      }
    }
  }, [isMounted, latitude, longitude, address]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[350px] w-full rounded-2xl border bg-slate-50 flex items-center justify-center text-slate-400">
        Loading map...
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="h-[350px] w-full rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
    />
  );
}
