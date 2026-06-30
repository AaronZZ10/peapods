"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  latitude: number;
  longitude: number;
};

interface ListingsMapProps {
  initialListings: Listing[];
  onBoundsChange?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
}

function MapBoundsHandler({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
    },
  });
  return null;
}

export default function ListingsMap({
  initialListings,
  onBoundsChange,
}: ListingsMapProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings);

  useEffect(() => {
    setListings(initialListings);
  }, [initialListings]);

  const defaultCenter: [number, number] = [39.9526, -75.1652];

  return (
    <div className="h-[500px] w-full rounded-lg border">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onBoundsChange && <MapBoundsHandler onBoundsChange={onBoundsChange} />}
        <MarkerClusterGroup>
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              position={[listing.latitude, listing.longitude]}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{listing.title}</h3>
                  <p className="text-green-600 font-semibold">
                    ${listing.price}/mo
                  </p>
                  <p>{listing.address}</p>
                  <p className="text-sm text-gray-600">{listing.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
