import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import PaymentModal from '../components/PaymentModal';
import confetti from 'canvas-confetti';
import {
  Coins,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const presetAmounts = [50, 100, 250, 500, 1000, 2000];

const PurchasePage = () => {
  const { user, updateBalanceDirectly, refreshUser } = useAuth();

  const [conversionRate, setConversionRate] = useState(10);
  const [amountInRupees, setAmountInRupees] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRate = async () => {
    try {
      const res = await api.get('/wallet/conversion-rate');
      if (res.data.success) {
        setConversionRate(res.data.pointsPerRupee);
      }
    } catch (err) {
      console.error('Failed to load conversion rate:', err);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  const numericAmount = Math.max(0, Number(amountInRupees) || 0);
  const calculatedPoints = Math.round(numericAmount * conversionRate * 100) / 100;

  const handlePaymentSuccess = (data) => {
    updateBalanceDirectly(data.newWalletBalance);
    refreshUser();

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 fill-indigo-600" />
          <span>Instant Simulated Top-Up</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Purchase Wallet Points
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Convert Rupees into wallet points to transfer to friends or spend in our ecosystem.
        </p>

        <div className="mt-6 p-4 max-w-lg mx-auto bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Official Conversion Rate
              </p>
              <p className="text-base font-extrabold text-slate-900">
                ₹1 Rupee = <span className="text-indigo-600">{conversionRate} Points</span>
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            Live
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-10 space-y-8">
        
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Enter Amount to Pay in Rupees (INR)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-2xl font-black text-slate-400">
              ₹
            </div>
            <input
              type="number"
              min="1"
              step="1"
              value={amountInRupees}
              onChange={(e) => setAmountInRupees(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-300 rounded-2xl text-2xl sm:text-3xl font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 transition-all"
              placeholder="100"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountInRupees(amt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  numericAmount === amt
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border border-indigo-100/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Points to Receive
            </span>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Calculated instantly
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tight">
              +{calculatedPoints.toLocaleString()}
            </span>
            <span className="text-base font-bold text-slate-600">Points</span>
          </div>

          <div className="pt-3 border-t border-indigo-100/60 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Payment Amount:</span>
              <span className="font-semibold text-slate-900">₹{numericAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Exchange Rate:</span>
              <span className="font-semibold text-slate-900">1 INR = {conversionRate} Points</span>
            </div>
            <div className="flex justify-between text-indigo-950 font-bold border-t border-indigo-100/60 pt-1.5">
              <span>Your New Balance after top-up:</span>
              <span className="text-indigo-600 font-extrabold">
                {((user?.walletBalance || 0) + calculatedPoints).toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={numericAmount <= 0}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-base shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group"
        >
          <CreditCard className="w-5 h-5" />
          <span>Proceed to Simulated Checkout (₹{numericAmount})</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Simulated Payment Gateway</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Instant Balance Credit</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>No Transaction Fees</span>
          </div>
        </div>

      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amountInRupees={numericAmount}
        pointsToCredit={calculatedPoints}
        conversionRate={conversionRate}
        onSuccess={handlePaymentSuccess}
      />

    </div>
  );
};

export default PurchasePage;
