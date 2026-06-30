"use client";

import { AddressAutocompleteInput } from "@/features/listings/AddressAutocompleteInput";
import { createListing } from "@/lib/actions/listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Info, DollarSign, Calendar } from "lucide-react";

export function CreateListingForm() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Post a Listing
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none rounded-3xl">
        <DialogHeader className="bg-emerald-50 px-6 py-8">
          <Badge className="w-fit mb-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
            HOST A PLACE
          </Badge>
          <DialogTitle className="text-2xl font-black text-slate-900">
            Create your listing
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Fill in the details below to help students find their next home.
          </DialogDescription>
        </DialogHeader>

        <form
          action={createListing}
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Listing Title
            </label>
            <Input
              name="title"
              placeholder="e.g., Cozy Room near University"
              required
              className="h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              placeholder="What makes this place great? (Utilities, roommate vibe, distance to campus)"
              className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Price ($/mo)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  name="price"
                  min="0"
                  required
                  className="pl-9 h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-50"
                  placeholder="850"
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-sky-50 text-sky-700 text-[10px] p-2 rounded-lg border border-sky-100 leading-tight">
                Honest pricing builds trust with student subletters.
              </div>
            </div>
          </div>

          <AddressAutocompleteInput />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 uppercase tracking-tighter text-[10px]">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  name="startDate"
                  required
                  className="pl-9 h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 uppercase tracking-tighter text-[10px]">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  name="endDate"
                  required
                  className="pl-9 h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800">
              Your listing will be instantly visible on the map after
              publishing.
            </p>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <DialogTrigger
              render={
                <Button variant="ghost" className="rounded-full">
                  Cancel
                </Button>
              }
            />
            <Button
              type="submit"
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-8"
            >
              Publish Listing
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
