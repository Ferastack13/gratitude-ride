import { cookies } from "next/headers";
import type { UserRole } from "@/types";

export type DashboardMode = "client" | "rider";

export const MODE_COOKIE = "gr_dashboard_mode";

export async function getDashboardMode(
  profileRole: UserRole
): Promise<DashboardMode | "admin"> {
  if (profileRole === "admin") return "admin";

  const store = await cookies();
  const raw = store.get(MODE_COOKIE)?.value;
  if (raw === "client" || raw === "rider") return raw;

  return profileRole === "rider" ? "rider" : "client";
}

export function modeHome(mode: DashboardMode | "admin") {
  if (mode === "admin") return "/admin";
  if (mode === "rider") return "/rider";
  return "/client";
}
