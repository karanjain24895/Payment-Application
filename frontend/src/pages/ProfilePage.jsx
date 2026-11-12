import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import {
  History,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data.success) {
        setProfileData(res.data.profile);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/wallet/transactions?type=${activeTab}&search=${encodeURIComponent(search)}&page=${page}&limit=${pageSize}`
      );
      if (res.data.success) {
        setTransactions(res.data.transactions);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 200);
    return () => clearTimeout(timer);
  }, [activeTab, search, page]);

  const stats = profileData?.stats || {};
  const currentBalance = user?.walletBalance || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {user?.role === 'admin' ? 'Administrator' : 'Verified Member'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
                {user?.phoneNumber && (
                  <span className="flex items-center gap-1 border-l border-slate-200 pl-2">
                    <Phone className="w-3 h-3" /> {user.phoneNumber}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Wallet Balance
              </p>
              <p className="text-2xl font-black text-indigo-950">
                {currentBalance.toLocaleString()} <span className="text-xs font-bold text-amber-600">PTS</span>
              </p>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <PlusCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Points Bought</span>
            </div>
            <p className="text-xl font-black text-slate-900">
              +{stats.totalPointsPurchased?.toLocaleString() || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ₹{stats.totalRupeesSpent?.toLocaleString() || 0} spent in INR
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Points Sent</span>
            </div>
            <p className="text-xl font-black text-slate-900">
              -{stats.totalPointsSent?.toLocaleString() || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Across {stats.transfersSentCount || 0} transfers
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Points Received</span>
            </div>
            <p className="text-xl font-black text-slate-900">
              +{stats.totalPointsReceived?.toLocaleString() || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Across {stats.transfersReceivedCount || 0} transfers
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Activity Count</span>
            </div>
            <p className="text-xl font-black text-slate-900">
              {(stats.purchasesCount || 0) + (stats.transfersSentCount || 0) + (stats.transfersReceivedCount || 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Total transaction logs
            </p>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Transaction History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed ledger of all your point purchases and transfers
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ref ID or note..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All History' },
            { id: 'PURCHASE', label: 'Purchases (INR → Points)' },
            { id: 'SENT', label: 'Sent to Others' },
            { id: 'RECEIVED', label: 'Received from Others' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-medium">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-14 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No transactions found</p>
              <p className="text-xs text-slate-500 mt-1">
                {search ? 'Try clearing the search filter' : 'Your transaction activity will appear here.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Type / Reference</th>
                  <th className="pb-3">Counterparty / Note</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => {
                  const isSent = txn.type === 'TRANSFER' && txn.sender?._id === user?._id;
                  const isReceived = txn.type === 'TRANSFER' && txn.recipient?._id === user?._id;
                  const isPurchase = txn.type === 'PURCHASE';

                  let badgeColor = '';
                  let typeLabel = '';
                  let partyText = '';

                  if (isPurchase) {
                    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    typeLabel = 'Point Purchase';
                    partyText = `Paid ₹${txn.amountInRupees} via ${txn.paymentMethod}`;
                  } else if (isSent) {
                    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                    typeLabel = 'Transfer Out';
                    partyText = `To: ${txn.recipient?.name || txn.recipient?.email || 'User'}`;
                  } else if (isReceived) {
                    badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    typeLabel = 'Transfer In';
                    partyText = `From: ${txn.sender?.name || txn.sender?.email || 'User'}`;
                  }

                  return (
                    <tr
                      key={txn._id}
                      onClick={() => setSelectedTxn(txn)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${badgeColor}`}>
                            {typeLabel}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px] group-hover:text-indigo-600 transition-colors">
                            {txn.referenceId}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <p className="font-semibold text-slate-800">{partyText}</p>
                        {txn.note && (
                          <p className="text-[11px] text-slate-400 italic">"{txn.note}"</p>
                        )}
                      </td>

                      <td className="py-3.5 text-slate-500 text-[11px]">
                        {new Date(txn.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="py-3.5">
                        {txn.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-right pr-2">
                        <span
                          className={`font-black text-sm ${
                            isSent ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {isSent ? '-' : '+'}{txn.points?.toLocaleString()} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Transaction Receipt</h3>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="text-center py-2">
              <span className="text-3xl font-black text-slate-900">
                {selectedTxn.points?.toLocaleString()} pts
              </span>
              <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                {selectedTxn.type}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2 font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-bold text-slate-800">{selectedTxn.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-emerald-600">{selectedTxn.status}</span>
              </div>
              {selectedTxn.amountInRupees > 0 && (
                <div className="flex justify-between">
                  <span>INR Paid:</span>
                  <span className="font-bold">₹{selectedTxn.amountInRupees}</span>
                </div>
              )}
              {selectedTxn.conversionRate > 0 && (
                <div className="flex justify-between">
                  <span>Applied Rate:</span>
                  <span className="font-bold">{selectedTxn.conversionRate} pts/₹</span>
                </div>
              )}
              {selectedTxn.sender && (
                <div className="flex justify-between">
                  <span>Sender:</span>
                  <span className="font-bold">{selectedTxn.sender.name || selectedTxn.sender.email}</span>
                </div>
              )}
              {selectedTxn.recipient && (
                <div className="flex justify-between">
                  <span>Recipient:</span>
                  <span className="font-bold">{selectedTxn.recipient.name || selectedTxn.recipient.email}</span>
                </div>
              )}
              {selectedTxn.note && (
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span>Note:</span>
                  <span className="font-sans italic">{selectedTxn.note}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-400">
                <span>Timestamp:</span>
                <span>{new Date(selectedTxn.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTxn(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
