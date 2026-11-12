import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import confetti from 'canvas-confetti';
import {
  X,
  ArrowRightLeft,
  Coins,
  Send,
  AlertCircle,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

const TransferModal = ({ isOpen, onClose, preselectedUser = null, allUsers = [], onSuccess }) => {
  const { user, updateBalanceDirectly } = useAuth();
  const [recipientId, setRecipientId] = useState('');
  const [points, setPoints] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (preselectedUser) {
      setRecipientId(preselectedUser._id || preselectedUser.id);
    } else if (allUsers.length > 0 && !recipientId) {
      setRecipientId(allUsers[0]._id || allUsers[0].id);
    }
  }, [preselectedUser, allUsers, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessData(null);
      setPoints('');
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numericPoints = Number(points) || 0;
  const currentBalance = user?.walletBalance || 0;
  const remainingBalance = currentBalance - numericPoints;
  const isInsufficient = numericPoints > currentBalance;
  const isInvalid = numericPoints <= 0 || isInsufficient || !recipientId;

  const selectedRecipient = allUsers.find(
    (u) => (u._id || u.id) === recipientId
  ) || preselectedUser;

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (isInvalid) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/wallet/transfer', {
        recipientId,
        points: numericPoints,
        note
      });

      if (res.data.success) {
        updateBalanceDirectly(res.data.newWalletBalance);
        setSuccessData(res.data);
        
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (_) {}

        if (onSuccess) {
          onSuccess(res.data);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Transfer failed. Please check your points balance.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPercent = (percent) => {
    const calculated = Math.floor(currentBalance * percent);
    if (calculated > 0) {
      setPoints(calculated.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transition-all">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Transfer Wallet Points</h3>
              <p className="text-xs text-slate-500">Send points instantly to any registered user</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {successData ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">Transfer Successful!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                {successData.message}
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Reference ID:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {successData.transaction?.referenceId}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Recipient:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedRecipient?.name} ({selectedRecipient?.email})
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Points Transferred:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    {numericPoints.toLocaleString()} pts
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-700 font-medium">
                  <span>Updated Wallet Balance:</span>
                  <span className="font-bold text-indigo-600">
                    {successData.newWalletBalance?.toLocaleString()} pts
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setSuccessData(null);
                    setPoints('');
                    setNote('');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  Send Another
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTransfer} className="space-y-4">
              
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Recipient
                </label>
                {allUsers.length > 0 ? (
                  <div className="relative">
                    <select
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      required
                    >
                      <option value="" disabled>Choose a registered user...</option>
                      {allUsers.map((u) => {
                        const uid = u._id || u.id;
                        return (
                          <option key={uid} value={uid}>
                            {u.name} ({u.email})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No other registered users found yet.
                  </div>
                )}
                {selectedRecipient && (
                  <p className="mt-1 text-xs text-indigo-600 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Sending to: <span className="font-semibold">{selectedRecipient.name}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Points Amount
                  </label>
                  <span className="text-xs text-slate-500">
                    Available: <strong className="text-indigo-600 font-extrabold">{currentBalance.toLocaleString()} pts</strong>
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Coins className="w-4 h-4 text-amber-500" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={currentBalance}
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="Enter points to transfer"
                    className={`w-full pl-10 pr-16 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none transition-all ${
                      isInsufficient
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                    }`}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400 uppercase">
                    PTS
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(0.25)}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(0.5)}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(0.75)}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(1.0)}
                    className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                  >
                    MAX
                  </button>
                </div>

                {isInsufficient && (
                  <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> You cannot transfer more than your current balance ({currentBalance} pts)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Optional Note
                </label>
                <input
                  type="text"
                  maxLength="100"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Lunch split, Project reward, Birthday gift..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              {numericPoints > 0 && !isInsufficient && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <div className="flex justify-between text-indigo-950 font-medium">
                    <span>Points to be deducted:</span>
                    <span className="font-bold text-rose-600">-{numericPoints.toLocaleString()} pts</span>
                  </div>
                  <div className="flex justify-between text-indigo-950 font-medium">
                    <span>Balance after transfer:</span>
                    <span className="font-extrabold text-indigo-700">{remainingBalance.toLocaleString()} pts</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isInvalid}
                  className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 ${
                    loading || isInvalid
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Points Now
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default TransferModal;
