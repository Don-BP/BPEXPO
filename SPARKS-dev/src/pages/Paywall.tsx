import React, { useEffect, useState } from 'react';
import { getOfferings, purchasePackage, restorePurchases } from '../hooks/useRevenueCat';

const Paywall: React.FC = () => {
  const [offering, setOffering] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOfferings()
      .then(setOffering)
      .catch(() => setError('Could not load subscription options.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (pkg: any) => {
    setPurchasing(true);
    setError(null);
    try {
      await purchasePackage(pkg);
      window.history.back();
    } catch (e: any) {
      if (!e.userCancelled) setError('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    setError(null);
    try {
      await restorePurchases();
      window.history.back();
    } catch {
      setError('Could not restore purchases. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-12 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">Go Premium</h1>
      <p className="text-slate-400 mb-8">Unlock all teacher tools and features.</p>

      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

      <div className="space-y-4 mb-8">
        {offering?.availablePackages?.map((pkg: any) => (
          <button
            key={pkg.identifier}
            onClick={() => handlePurchase(pkg)}
            disabled={purchasing}
            className="w-full min-h-[56px] bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl px-6 py-4 text-left transition-colors"
          >
            <p className="font-semibold">{pkg.product.title}</p>
            <p className="text-sm text-orange-100">
              {pkg.product.priceString} / {pkg.packageType}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={handleRestore}
        disabled={purchasing}
        className="w-full min-h-[44px] text-slate-400 hover:text-slate-200 text-sm underline disabled:opacity-50"
      >
        Restore Purchases
      </button>

      <p className="text-center text-xs text-slate-600 mt-6">
        <a href="/privacy" className="underline">Privacy Policy</a>
        {' · '}
        <a href="/terms" className="underline">Terms of Service</a>
      </p>
    </div>
  );
};

export default Paywall;
