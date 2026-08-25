import type { UserRole } from "@/types";

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "rider":
      return "/rider";
    default:
      return "/client";
  }
}
