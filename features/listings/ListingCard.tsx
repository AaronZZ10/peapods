"use client";

import { deleteListing } from "@/lib/actions/listings";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, User, Trash2 } from "lucide-react";
import Link from "next/link";

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
  images?: string[];
  reserved?: boolean;
};

export function ListingCard({
  listing,
  isOwner,
}: {
  listing: Listing;
  isOwner: boolean;
}) {
  return (
    <Card className="group overflow-hidden border-slate-200/60 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/40 rounded-3xl">
      {/* Image / Thumbnail */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <Link href={`/listings/${listing.id}`} className="block h-full w-full">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-slate-100 to-slate-200"></div>
          )}
        </Link>
        <div className="absolute left-4 top-4 flex gap-2 pointer-events-none z-10">
          <Badge
            variant="secondary"
            className="bg-white/90 text-emerald-700 hover:bg-white backdrop-blur-md border-none font-bold shadow-sm"
          >
            Student Stay
          </Badge>
          {listing.reserved && (
            <Badge className="bg-rose-600 text-white font-extrabold shadow-sm border-none z-10">
              RESERVED
            </Badge>
          )}
        </div>
        {isOwner && (
          <div className="absolute right-4 top-4 z-10">
            <form action={deleteListing.bind(null, listing.id)}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/90 text-slate-400 hover:text-rose-600 hover:bg-rose-50 backdrop-blur-md shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">
              ${listing.price}
            </span>
            <span className="text-sm font-medium text-slate-500">/ mo</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
            <Link href={`/listings/${listing.id}`}>
              {listing.title}
            </Link>
          </h3>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {listing.description}
        </p>

        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">{listing.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <CalendarDays className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              {new Date(listing.start_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(listing.end_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xs font-bold text-teal-800 uppercase ring-1 ring-white shadow-sm">
            {(listing.profiles?.full_name || listing.profiles?.email || "A")[0]}
          </div>
          <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">
            {listing.profiles?.full_name?.split(" ")[0] ||
              listing.profiles?.email?.split("@")[0] ||
              "Host"}
          </span>
        </div>
        <Link
          href={`/listings/${listing.id}`}
          className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Details &rarr;
        </Link>
      </CardFooter>
    </Card>
  );
}
