"use client";

import { useState, useTransition } from "react";
import { adminDeleteListing, adminToggleRole } from "@/lib/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Shield,
  Trash2,
  Search,
  Building2,
  Users,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminDashboardClientProps {
  initialListings: any[];
  initialProfiles: any[];
  isSuperAdmin: boolean;
}

export function AdminDashboardClient({
  initialListings,
  initialProfiles,
  isSuperAdmin,
}: AdminDashboardClientProps) {
  const [listings, setListings] = useState(initialListings);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [activeTab, setActiveTab] = useState<"listings" | "users">("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Metrics calculation
  const totalListings = listings.length;
  const activeListings = listings.filter((l) => !l.reserved).length;
  const totalAdmins = profiles.filter((p) => p.is_admin).length;

  // Search filtering
  const filteredListings = listings.filter((listing) => {
    const term = searchQuery.toLowerCase();
    return (
      listing.title.toLowerCase().includes(term) ||
      listing.address.toLowerCase().includes(term) ||
      (listing.profiles?.email || "").toLowerCase().includes(term) ||
      (listing.profiles?.full_name || "").toLowerCase().includes(term)
    );
  });

  const filteredProfiles = profiles.filter((profile) => {
    const term = searchQuery.toLowerCase();
    return (
      profile.full_name.toLowerCase().includes(term) ||
      profile.email.toLowerCase().includes(term) ||
      (profile.university || "").toLowerCase().includes(term)
    );
  });

  // Actions
  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action is permanent.")) {
      return;
    }

    startTransition(async () => {
      try {
        await adminDeleteListing(id);
        setListings(listings.filter((l) => l.id !== id));
      } catch (err) {
        alert("Failed to delete listing. Try again.");
      }
    });
  };

  const handleToggleAdmin = async (id: string, currentStatus: boolean) => {
    const actionName = currentStatus ? "revoke admin rights from" : "grant admin rights to";
    if (!confirm(`Are you sure you want to ${actionName} this user?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await adminToggleRole(id, currentStatus);
        setProfiles(
          profiles.map((p) => {
            if (p.id === id) {
              return { ...p, is_admin: !currentStatus };
            }
            return p;
          })
        );
      } catch (err) {
        alert("Failed to update user role. Try again.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200/60 bg-white shadow-2xs rounded-2xl">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Subleases
              </p>
              <h3 className="text-2xl font-black text-slate-800">{totalListings}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 bg-white shadow-2xs rounded-2xl">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Listings
              </p>
              <h3 className="text-2xl font-black text-slate-800">{activeListings}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 bg-white shadow-2xs rounded-2xl">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                System Admins
              </p>
              <h3 className="text-2xl font-black text-slate-800">{totalAdmins}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("listings");
              setSearchQuery("");
            }}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition",
              activeTab === "listings"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Listings Audit ({listings.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              setSearchQuery("");
            }}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition",
              activeTab === "users"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            User Accounts ({profiles.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={
              activeTab === "listings"
                ? "Search listings by title/host..."
                : "Search users by name/email..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl border-slate-200 text-xs shadow-none w-full bg-white"
          />
        </div>
      </div>

      {/* Data Table Panel */}
      <Card className="border border-slate-200/60 bg-white shadow-xs rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {activeTab === "listings" ? (
            filteredListings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-4">Sublease Info</th>
                      <th className="p-4">Host Profile</th>
                      <th className="p-4">Pricing</th>
                      <th className="p-4">Booking Status</th>
                      <th className="p-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredListings.map((listing) => (
                      <tr
                        key={listing.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200/60 relative shrink-0">
                              {listing.images?.[0] ? (
                                <img
                                  src={listing.images[0]}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                                  <Building2 className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="font-extrabold text-slate-800 truncate max-w-xs">
                                {listing.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">
                                {listing.address}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-700">
                              {listing.profiles?.full_name || "Unknown User"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {listing.profiles?.email || "No email"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-slate-900">
                            ${listing.price}
                          </span>
                          <span className="text-[10px] text-slate-400"> / month</span>
                        </td>
                        <td className="p-4">
                          {listing.reserved ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-red-100">
                              Reserved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-100">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/listings/${listing.id}`} target="_blank">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-slate-400 hover:text-slate-700"
                                title="View Sublease"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={isPending}
                              onClick={() => handleDeleteListing(listing.id)}
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete Sublease"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium space-y-2">
                <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto" />
                <p>No listings match your audit search criteria.</p>
              </div>
            )
          ) : filteredProfiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">Student Profile</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Institution / Verified Status</th>
                    <th className="p-4">Permissions Role</th>
                    <th className="p-4 text-right font-bold">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProfiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative flex items-center justify-center text-xs font-bold text-slate-500">
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              profile.full_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800">
                              {profile.full_name}
                            </h4>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {profile.email}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-500">
                          {profile.university || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        {profile.is_admin ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-purple-100">
                            <ShieldCheck className="h-3 w-3 inline" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            Student
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isSuperAdmin ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleToggleAdmin(profile.id, profile.is_admin)}
                            className={cn(
                              "h-8 text-xs font-bold rounded-xl cursor-pointer shadow-none",
                              profile.is_admin
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-purple-200 text-purple-600 hover:bg-purple-50"
                            )}
                          >
                            <UserCog className="h-3.5 w-3.5 mr-1" />
                            {profile.is_admin ? "Revoke Admin" : "Promote Admin"}
                          </Button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg select-none">
                            Locked (Super Admin Only)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 font-medium space-y-2">
              <Users className="h-8 w-8 text-slate-300 mx-auto" />
              <p>No user profiles match your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
