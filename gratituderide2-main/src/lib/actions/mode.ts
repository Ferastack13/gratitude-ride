"use server";

import { createClient } from "@/lib/supabase/server";
import { MODE_COOKIE, type DashboardMode } from "@/lib/mode";
import { ensureUserProfile } from "@/lib/supabase/profile";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function referralCodeFromId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export async function switchDashboardMode(mode: DashboardMode) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await ensureUserProfile(supabase, user);
  if (!profile) {
    redirect("/login");
  }

  // Keep admin on admin dashboard
  if (profile.role === "admin") {
    redirect("/admin");
  }

  if (mode === "rider") {
    await supabase.from("riders").upsert(
      {
        user_id: user.id,
        vehicle_type:
          String(user.user_metadata?.vehicle_type || "").trim() || "Motorcycle",
      },
      { onConflict: "user_id" }
    );
  } else {
    await supabase.from("clients").upsert(
      {
        user_id: user.id,
        referral_code: referralCodeFromId(user.id),
      },
      { onConflict: "user_id" }
    );
  }

  const store = await cookies();
  store.set(MODE_COOKIE, mode, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
  redirect(mode === "rider" ? "/rider" : "/client");
}
