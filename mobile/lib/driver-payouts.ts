import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "gr.driver.payout.details";

export type DriverPayoutDetails = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  updatedAt: string;
};

export async function getDriverPayoutDetails(): Promise<DriverPayoutDetails | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DriverPayoutDetails;
    if (!parsed?.accountName || !parsed?.bankName || !parsed?.accountNumber) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveDriverPayoutDetails(
  input: Omit<DriverPayoutDetails, "updatedAt">
): Promise<DriverPayoutDetails> {
  const row: DriverPayoutDetails = {
    accountName: input.accountName.trim(),
    bankName: input.bankName.trim(),
    accountNumber: input.accountNumber.trim(),
    updatedAt: new Date().toISOString(),
  };
  if (row.accountName.length < 2) {
    throw new Error("Enter the account name.");
  }
  if (row.bankName.length < 2) {
    throw new Error("Enter the bank name.");
  }
  if (!/^\d{8,12}$/.test(row.accountNumber)) {
    throw new Error("Enter a valid account number (8–12 digits).");
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(row));
  return row;
}
