import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

// Replace these with your actual RevenueCat API keys after setting up your account at revenuecat.com
// iOS key: RevenueCat dashboard → Project → Apps → iOS App → Public API key (starts with appl_)
// Android key: RevenueCat dashboard → Project → Apps → Android App → Public API key (starts with goog_)
const IOS_API_KEY = 'appl_REPLACE_WITH_YOUR_IOS_KEY';
const ANDROID_API_KEY = 'goog_REPLACE_WITH_YOUR_ANDROID_KEY';

export function useRevenueCatInit(userId: string | null) {
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') return;

    const apiKey = platform === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
    Purchases.setLogLevel({ level: LOG_LEVEL.ERROR });
    Purchases.configure({ apiKey, appUserID: userId ?? undefined });
  }, [userId]);
}

export async function getIsPremium(): Promise<boolean> {
  if (Capacitor.getPlatform() === 'web') return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings() {
  const { offerings } = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: any) {
  return Purchases.purchasePackage({ aPackage: pkg });
}

export async function restorePurchases() {
  return Purchases.restorePurchases();
}
