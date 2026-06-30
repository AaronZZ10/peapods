"use client";

import { logout } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
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

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          {user.user_metadata.full_name || user.email}
        </span>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="border border-gray-300 px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </form>
    </div>
  );
}
