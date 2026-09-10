import AsyncStorage from "@react-native-async-storage/async-storage";

export type AccountType = "driver" | "passenger" | "business";

const KEY = "gr.account_type";

export function accountTypeLabel(type: AccountType) {
  if (type === "driver") return "Driver";
  if (type === "business") return "Client / Business";
  return "Passenger";
}

/** Maps UI account type → Supabase user_role */
export function roleForAccountType(type: AccountType): "rider" | "client" {
  return type === "driver" ? "rider" : "client";
}

export async function getAccountType(): Promise<AccountType | null> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v === "driver" || v === "passenger" || v === "business") return v;
    return null;
  } catch {
    return null;
  }
}

export async function setAccountType(type: AccountType) {
  await AsyncStorage.setItem(KEY, type);
}

export type AppHome = "/rider" | "/passenger" | "/business" | "/login";

/**
 * Resolve where a signed-in user should land.
 * Returns null when role/accountType are still unknown — callers must wait,
 * never Redirect to /login while a session exists (that loops with auth layout).
 */
export function homeForAccount(
  role?: "client" | "rider" | "admin" | null,
  accountType?: AccountType | null
): AppHome | null {
  if (role === "rider" || accountType === "driver") return "/rider";
  if (accountType === "business") return "/business";
  if (accountType === "passenger") return "/passenger";
  if (role === "client" || role === "admin") return "/passenger";
  // No role + no account type yet → still hydrating
  return null;
}
