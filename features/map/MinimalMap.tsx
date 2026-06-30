"use client";

import { useEffect, useState } from "react";

export default function MinimalMap() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== "undefined") {
      // Dynamically import Leaflet only on the client
      const L = require("leaflet");
      
      // Initialize map only after component is mounted
      const map = L.map("minimal-map").setView([39.9526, -75.1652], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      return () => {
        map.remove();
      };
    }
  }, []);

  if (!isMounted) {
    return (
      <div style={{ height: "500px", width: "100%" }}>
        Loading map...
      </div>
    );
  }

  return (
    <div
      id="minimal-map"
      style={{ height: "500px", width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px" }}
    />
  );
}
