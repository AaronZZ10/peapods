"use client";

import { useState } from "react";
import { AddressAutocompleteInput } from "@/features/listings/AddressAutocompleteInput";
import { createListing } from "@/lib/actions/listings";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Info, DollarSign, Calendar } from "lucide-react";

export function CreateListingForm() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const files = Array.from(e.target.files);
    const urls: string[] = [...images];

    for (const file of files) {
      if (urls.length >= 5) {
        alert("Maximum 5 photos allowed.");
        break;
      }
      try {
        const ext = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        urls.push(publicUrl);
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }

    setImages(urls);
    setUploading(false);
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <Dialog
      modal={false}
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        if (
          !nextOpen &&
          (eventDetails?.reason === "outside-press" ||
            eventDetails?.reason === "focus-out")
        ) {
          return;
        }

        if (!nextOpen) {
          setImages([]);
        }
        setOpen(nextOpen);
      }}
    >
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Photos of the Space
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4"
              >
                <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {uploading ? "Uploading..." : "Upload Photos"}
                </span>
                <span className="text-xs text-slate-400">
                  PNG, JPG, JPEG (Min 2, Max 5 photos)
                </span>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200/80 bg-white"
                  >
                    <img
                      src={url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 text-[10px] font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <input type="hidden" name="images" value={JSON.stringify(images)} />
          </div>

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

          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left w-full sm:w-auto">
              {images.length < 2 && (
                <p className="text-xs text-rose-500 font-semibold leading-tight">
                  ⚠️ Minimum 2 photos required to publish.
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end w-full sm:w-auto">
              <DialogClose
                render={
                  <Button variant="ghost" className="rounded-full">
                    Cancel
                  </Button>
                }
              />
              <Button
                type="submit"
                disabled={uploading || images.length < 2}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-8 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {uploading ? "Uploading..." : "Publish Listing"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
