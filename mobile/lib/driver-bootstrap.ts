import { ensureClientId, ensureRiderId } from "@/lib/deliveries";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";
import { Alert } from "react-native";

export type RiderRow = Tables<"riders">;

export const DRIVER_VEHICLE_OPTIONS = [
  "Motorcycle",
  "Car",
  "Bicycle",
  "Van",
] as const;

export type DriverVehicleType = (typeof DRIVER_VEHICLE_OPTIONS)[number];

/** True when no rider row yet (first time entering driver mode). */
export function riderNeedsVehicleChoice(
  rider: Pick<RiderRow, "vehicle_type"> | null | undefined
) {
  return !rider;
}

export async function getRiderByUserId(
  userId: string
): Promise<RiderRow | null> {
  const { data, error } = await supabase
    .from("riders")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Ensure this user can operate as a driver:
 * - riders row exists
 * - users.role = rider
 * - auth metadata account_type / role / vehicle
 */
export async function ensureDriverIdentity(
  userId: string,
  vehicleType?: string
): Promise<RiderRow> {
  const vehicle =
    (vehicleType?.trim() || "Motorcycle").trim() || "Motorcycle";

  const riderId = await ensureRiderId(userId, vehicle);

  if (vehicleType?.trim()) {
    const { error: vehicleError } = await supabase
      .from("riders")
      .update({ vehicle_type: vehicleType.trim() })
      .eq("id", riderId);
    if (vehicleError) throw new Error(vehicleError.message);
  }

  const { error: roleError } = await supabase
    .from("users")
    .update({ role: "rider" })
    .eq("id", userId);
  if (roleError) throw new Error(roleError.message);

  const row = await getRiderByUserId(userId);
  await supabase.auth.updateUser({
    data: {
      role: "rider",
      account_type: "driver",
      vehicle_type: row?.vehicle_type || vehicle,
    },
  });

  if (!row) throw new Error("Couldn’t create your driver profile.");
  return row;
}

/** Leave driver mode for passenger/business — keep riders row, flip role back. */
export async function ensureClientIdentity(
  userId: string,
  accountType: "passenger" | "business"
) {
  await ensureClientId(userId);

  // Don't leave the driver "online" after switching roles.
  const { data: rider } = await supabase
    .from("riders")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (rider?.id) {
    await supabase
      .from("riders")
      .update({ is_available: false })
      .eq("id", rider.id);
  }

  const { error } = await supabase
    .from("users")
    .update({ role: "client" })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  await supabase.auth.updateUser({
    data: {
      role: "client",
      account_type: accountType,
    },
  });
}

/** Persist vehicle type + license on the riders row. */
export async function updateRiderVehicle(
  userId: string,
  patch: { vehicle_type: string; license_number?: string | null }
): Promise<RiderRow> {
  const rider = await getRiderByUserId(userId);
  if (!rider) throw new Error("Driver profile not found.");

  const { error } = await supabase
    .from("riders")
    .update({
      vehicle_type: patch.vehicle_type.trim(),
      license_number: patch.license_number?.trim() || null,
    })
    .eq("id", rider.id);
  if (error) throw new Error(error.message);

  await supabase.auth.updateUser({
    data: { vehicle_type: patch.vehicle_type.trim() },
  });

  const next = await getRiderByUserId(userId);
  if (!next) throw new Error("Couldn’t update vehicle.");
  return next;
}

/**
 * Ask for vehicle type. Cancel leaves the user where they are.
 */
export function promptDriverVehicle(
  onChosen: (vehicle: DriverVehicleType) => void,
  onCancel?: () => void
) {
  Alert.alert(
    "Choose your vehicle",
    "We’ll use this on your driver profile so passengers know what to expect.",
    [
      ...DRIVER_VEHICLE_OPTIONS.map((vehicle) => ({
        text: vehicle,
        onPress: () => onChosen(vehicle),
      })),
      {
        text: "Cancel",
        style: "cancel" as const,
        onPress: onCancel,
      },
    ]
  );
}

/**
 * Switch into driver mode. Prompts for vehicle the first time (no riders row).
 * Call from Account / Settings before navigating to `/rider`.
 */
export async function switchToDriverMode(opts: {
  userId: string;
  setAccountTypePreference: (
    type: "driver" | "passenger" | "business",
    opts?: { vehicleType?: string }
  ) => Promise<void>;
  onReady: () => void;
  onError?: (message: string) => void;
}) {
  try {
    const existing = await getRiderByUserId(opts.userId).catch(() => null);
    if (riderNeedsVehicleChoice(existing)) {
      promptDriverVehicle(async (vehicle) => {
        try {
          await opts.setAccountTypePreference("driver", {
            vehicleType: vehicle,
          });
          opts.onReady();
        } catch (err) {
          opts.onError?.(
            err instanceof Error ? err.message : "Couldn’t switch to driver."
          );
        }
      });
      return;
    }
    await opts.setAccountTypePreference("driver", {
      vehicleType: existing?.vehicle_type,
    });
    opts.onReady();
  } catch (err) {
    opts.onError?.(
      err instanceof Error ? err.message : "Couldn’t switch to driver."
    );
  }
}
