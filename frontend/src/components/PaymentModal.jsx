import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Coins,
  Lock
} from 'lucide-react';
import api from '../api/axiosClient';

const PaymentModal = ({ isOpen, onClose, amountInRupees, pointsToCredit, onSuccess }) => {
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [simulateSuccess, setSimulateSuccess] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMessage('');
    setResult(null);

    setTimeout(async () => {
      try {
        const res = await api.post('/wallet/purchase', {
          amountInRupees,
          paymentMethod: method === 'UPI' ? 'UPI' : method === 'CARD' ? 'CARD' : 'NET_BANKING',
          simulateSuccess
        });

        if (res.data.success) {
          setResult({ status: 'SUCCESS', data: res.data });
          if (onSuccess) {
            onSuccess(res.data);
          }
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Payment simulation failed.';
        setErrorMessage(msg);
        setResult({ status: 'FAILED', message: msg });
      } finally {
        setProcessing(false);
      }
    }, 1200);
  };

  const handleClose = () => {
    setResult(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 transition-all">
        
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                  Simulated Gateway
                </p>
                <h3 className="text-base font-bold text-white">PayFlow Secure Checkout</h3>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={processing}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-300 block font-medium">Paying Amount</span>
              <span className="text-2xl font-extrabold text-white tracking-tight">₹{amountInRupees}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-indigo-200 block font-medium">You Receive</span>
              <span className="text-base font-bold text-amber-300 flex items-center justify-end gap-1">
                <Coins className="w-4 h-4" />
                +{pointsToCredit} pts
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {result ? (
            <div className="text-center py-4 space-y-4">
              {result.status === 'SUCCESS' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900">Payment Successful!</h4>
                    <p className="text-sm text-slate-600 mt-1 max-w-xs mx-auto">
                      ₹{amountInRupees} paid. <strong className="text-indigo-600">{pointsToCredit} points</strong> have been credited to your wallet balance.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-left text-xs font-mono text-slate-600 space-y-1 border border-slate-200">
                    <div className="flex justify-between">
                      <span>Txn Ref:</span>
                      <span className="font-bold">{result.data.transaction?.referenceId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Ref:</span>
                      <span className="font-bold">{result.data.transaction?.paymentReference}</span>
                    </div>
                    <div className="flex justify-between text-indigo-700 font-sans font-bold border-t border-slate-200 pt-1">
                      <span>New Wallet Balance:</span>
                      <span>{result.data.newWalletBalance} pts</span>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all"
                  >
                    View Wallet & Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900">Payment Failed</h4>
                    <p className="text-sm text-rose-600 mt-1 max-w-xs mx-auto font-medium">
                      {errorMessage || 'Simulated transaction could not be processed.'}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Your bank account was not debited and no points were added.
                  </p>
                  <button
                    onClick={() => {
                      setResult(null);
                      setSimulateSuccess(true);
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      method === 'UPI'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-xs">UPI App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('CARD')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      method === 'CARD'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('NET_BANKING')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      method === 'NET_BANKING'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs">NetBanking</span>
                  </button>
                </div>
              </div>

              {method === 'UPI' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    required
                  />
                  <div className="flex gap-2 pt-1 text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200">GPay</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200">PhonePe</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Paytm</span>
                  </div>
                </div>
              )}

              {method === 'CARD' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        defaultValue="999"
                        maxLength="3"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'NET_BANKING' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Choose Your Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-950 block">Testing Simulation Mode</span>
                  <span className="text-[11px] text-amber-800">
                    {simulateSuccess ? 'Simulating success response' : 'Simulating bank decline/failure'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateSuccess}
                    onChange={(e) => setSimulateSuccess(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting to Payment Gateway...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Pay ₹{amountInRupees} & Get {pointsToCredit} Points
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>256-Bit Encrypted Simulated Transaction</span>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
