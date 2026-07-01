import { getListingById } from "@/lib/actions/listings";
import { confirmMockPayment } from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Lock, Shield, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const { listingId } = await searchParams;

  if (!listingId) {
    redirect("/");
  }

  const listing = await getListingById(listingId);

  if (!listing) {
    redirect("/");
  }

  const firstImage = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row -mt-32 -mb-20 -mx-4 sm:-mx-6">
      {/* Left Column: Product Summary */}
      <div className="w-full md:w-5/12 bg-slate-900 text-slate-100 p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
        <div className="space-y-8">
          <Link
            href={`/listings/${listing.id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" /> Back to Sublease details
          </Link>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Shield className="h-3.5 w-3.5" /> Simulated Stripe Checkout
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-400">Reservation Deposit</p>
              <h2 className="text-xl font-black text-white leading-tight">{listing.title}</h2>
              <p className="text-xs text-slate-500">{listing.address}</p>
            </div>
            <div className="pt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$100.00</span>
              <span className="text-sm font-semibold text-slate-400">USD</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Preview */}
        <div className="mt-12 space-y-6">
          {firstImage ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
              <img src={firstImage} alt={listing.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
              <Building2 className="h-10 w-10 opacity-40" />
            </div>
          )}

          <div className="text-[11px] text-slate-500 leading-relaxed space-y-2 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-emerald-500" />
              <span className="font-semibold text-slate-400">Secure simulated transaction</span>
            </div>
            <p>
              PeaPods reserves this room instantly upon completion. Real payment methods are mocked; do not enter actual credit card numbers.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Checkout Form */}
      <div className="w-full md:w-7/12 bg-white p-8 sm:p-12 md:p-16 flex flex-col justify-center max-w-xl mx-auto">
        <form action={confirmMockPayment.bind(null, listing.id)} className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Pay with card</h3>

          {/* Email input */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Email Address
            </label>
            <Input
              type="email"
              id="email"
              placeholder="student@university.edu"
              required
              className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-50 rounded-xl"
            />
          </div>

          {/* Card Info Wrapper */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Card Information
            </label>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-50 transition-all">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="4242  4242  4242  4242"
                  maxLength={19}
                  required
                  className="h-10 border-none rounded-none pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              </div>
              <div className="flex divide-x divide-slate-100">
                <Input
                  type="text"
                  placeholder="MM / YY"
                  maxLength={5}
                  required
                  className="h-10 border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-center"
                />
                <Input
                  type="text"
                  placeholder="CVC"
                  maxLength={3}
                  required
                  className="h-10 border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-center"
                />
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-1.5">
            <label htmlFor="card-name" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Cardholder Name
            </label>
            <Input
              type="text"
              id="card-name"
              placeholder="Verified Student"
              required
              className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-50 rounded-xl"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 shadow-sm text-sm"
            >
              Simulate $100.00 Reservation Payment
            </Button>
            <div className="text-center">
              <Link
                href={`/listings/${listing.id}?canceled=true`}
                className="text-xs text-slate-500 hover:text-slate-900 underline font-medium"
              >
                Cancel and return
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
