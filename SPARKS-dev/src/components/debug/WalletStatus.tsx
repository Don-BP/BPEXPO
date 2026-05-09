import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../context/AuthContext';
const WalletStatus = () => {
    const { sparks, tier, loading } = useWallet();
    const { user } = useAuth();

    if (!user) return null;
    if (loading) return <div className="text-xs text-gray-400">Loading Wallet...</div>;

    return (
        <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-xl border border-gray-200 z-50 text-sm">
            <h3 className="font-bold text-gray-700 border-b pb-1 mb-2">💰 Wallet Debug</h3>
            <div className="flex justify-between items-center mb-1">
                <span>Balance:</span>
                <span className="font-bold text-orange-600 text-lg">{sparks} Sparks</span>
            </div>
            <div className="flex justify-between items-center mb-2">
                <span>Tier:</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{tier}</span>
            </div>
        </div>
    );
};

export default WalletStatus;
