import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

const refreshListeners = new Set<() => void>();

/** Call after marking inbox messages read so the tab badge updates immediately. */
export function bumpUnreadNotificationCount() {
  refreshListeners.forEach((fn) => fn());
}

/**
 * Unread rows in `notifications` for the signed-in user.
 * Powers the Inbox tab badge; updates when messages are read or inserted.
 */
export function useUnreadNotificationCount() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }
    const { count: next, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) return;
    setCount(next ?? 0);
  }, [userId]);

  useEffect(() => {
    void refresh();
    refreshListeners.add(refresh);
    if (!userId) {
      return () => {
        refreshListeners.delete(refresh);
      };
    }

    const channel = supabase
      .channel(`unread-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refresh();
        }
      )
      .subscribe();

    return () => {
      refreshListeners.delete(refresh);
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  return count;
}
