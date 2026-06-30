"use client";

import { deleteListing } from "@/lib/actions/listings";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, User, Trash2 } from "lucide-react";

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
    <Card className="group overflow-hidden border-slate-200 transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100">
              Student Friendly
            </Badge>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
              {listing.title}
            </h3>
          </div>
          {isOwner && (
            <form action={deleteListing.bind(null, listing.id)}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-emerald-600">${listing.price}</span>
          <span className="text-sm text-slate-500 font-medium">/ month</span>
        </div>
        
        <p className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
          {listing.description}
        </p>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">{listing.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              {new Date(listing.start_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })} - {new Date(listing.end_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-700 uppercase">
            {(listing.profiles?.full_name || listing.profiles?.email || "A")[0]}
          </div>
          <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
            {listing.profiles?.full_name || listing.profiles?.email || "Anonymous"}
          </span>
        </div>
        <Button variant="link" className="h-auto p-0 text-xs text-emerald-600 font-bold hover:no-underline">
          View Details →
        </Button>
      </CardFooter>
    </Card>
  );
}
