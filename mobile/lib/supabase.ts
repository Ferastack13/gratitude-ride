import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import type { Database } from "@/types/database";

if (Platform.OS !== "web") {
  require("react-native-url-polyfill/auto");
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env"
  );
}

const isNative = Platform.OS === "ios" || Platform.OS === "android";

const memory: Record<string, string> = {};
const memoryStorage = {
  getItem: async (key: string) => memory[key] ?? null,
  setItem: async (key: string, value: string) => {
    memory[key] = value;
  },
  removeItem: async (key: string) => {
    delete memory[key];
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isNative ? AsyncStorage : memoryStorage,
    persistSession: isNative,
    autoRefreshToken: isNative,
    detectSessionInUrl: false,
  },
});
