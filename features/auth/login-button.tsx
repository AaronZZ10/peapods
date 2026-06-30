"use client";

import { loginWithGoogle } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function LoginButton() {
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

  if (user) {
    return null;
  }

  return (
    <form action={loginWithGoogle}>
      <button
        type="submit"
        className="bg-gray-900 text-white px-4 py-2 rounded text-sm"
      >
        Login with Google
      </button>
    </form>
  );
}
