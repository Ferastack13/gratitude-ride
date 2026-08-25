import { getCurrentProfile } from "@/lib/auth";
import { getDashboardMode, modeHome } from "@/lib/mode";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  const mode = await getDashboardMode(profile.role);
  redirect(modeHome(mode));
}
