"use client";

import { logout } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { MessageSquare, User as UserIcon, Calendar, ClipboardList, Menu, Shield } from "lucide-react";
import { getUnreadMessagesCount } from "@/lib/actions/messages";
import { getProfile } from "@/lib/actions/profiles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch the full profile details (including avatar and is_admin role)
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile inside UserNav:", err);
      }
    };

    fetchProfile();
  }, [user]);

  // Poll for unread message counts in the background
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const count = await getUnreadMessagesCount();
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch unread messages count:", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-900 transition px-4 py-2 rounded-full cursor-pointer relative shadow-2xs">
          <Menu className="h-4.5 w-4.5 text-emerald-500" />
          <span>Menu</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 bg-white border border-slate-200/60 shadow-lg z-[99999]">
          {profile?.is_admin && (
            <>
              <DropdownMenuItem
                render={<Link href="/admin" />}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl cursor-pointer"
              >
                <Shield className="h-4 w-4 text-purple-600" />
                <span>Admin Portal</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-slate-100" />
            </>
          )}

          <DropdownMenuItem
            render={<Link href="/profile" />}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
          >
            <UserIcon className="h-4 w-4 text-emerald-500" />
            <span>Profile Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href="/messages" />}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-500" />
              <span>Messages Inbox</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full min-w-5 text-center leading-none">
                {unreadCount}
              </span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href="/my-listings" />}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
          >
            <ClipboardList className="h-4 w-4 text-emerald-500" />
            <span>My Listings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href="/my-bookings" />}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-emerald-500" />
            <span>My Bookings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 border-slate-100" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl cursor-pointer"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Avatar direct shortcut link to Profile */}
      <Link
        href="/profile"
        className="h-9 w-9 rounded-full overflow-hidden border border-slate-200/60 hover:border-emerald-500 transition shadow-2xs shrink-0 flex items-center justify-center bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer"
        title="Go to Profile"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || "Profile Avatar"}
            className="h-full w-full object-cover animate-in fade-in duration-200"
          />
        ) : (
          <span>{user.email?.charAt(0).toUpperCase() || "P"}</span>
        )}
      </Link>
    </div>
  );
}
