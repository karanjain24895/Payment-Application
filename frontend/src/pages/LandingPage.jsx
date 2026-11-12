import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import TransferModal from '../components/TransferModal';
import {
  ArrowRightLeft,
  PlusCircle,
  History,
  Search,
  Users,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Coins,
  RefreshCw,
  Clock
} from 'lucide-react';

const LandingPage = () => {
  const { user, refreshUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [conversionRate, setConversionRate] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedUserForTransfer, setSelectedUserForTransfer] = useState(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get(`/users?search=${encodeURIComponent(searchQuery)}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load registered users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const rateRes = await api.get('/wallet/conversion-rate');
      if (rateRes.data.success) {
        setConversionRate(rateRes.data.pointsPerRupee);
      }

      const txnRes = await api.get('/wallet/transactions?limit=5');
      if (txnRes.data.success) {
        setRecentTransactions(txnRes.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenTransfer = (targetUser = null) => {
    setSelectedUserForTransfer(targetUser);
    setTransferModalOpen(true);
  };

  const handleTransferSuccess = () => {
    fetchUsers();
    fetchDashboardData();
    refreshUser();
  };

  const rupeeEquivalent = user?.walletBalance && conversionRate > 0
    ? (user.walletBalance / conversionRate).toFixed(2)
    : '0.00';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-2xl shadow-indigo-950/20 border border-indigo-700/40">
        
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -top-10 w-60 h-60 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Welcome back, {user?.name}!</span>
            </div>

            <div className="pt-1">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-300">
                Current Wallet Points
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  {user?.walletBalance?.toLocaleString() || 0}
                </h1>
                <span className="text-lg font-bold text-amber-400">POINTS</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-indigo-200 flex items-center gap-2">
              <span>Approx. monetary value:</span>
              <strong className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">
                ₹{rupeeEquivalent} INR
              </strong>
              <span className="text-[11px] text-indigo-300">(@ {conversionRate} pts / ₹1)</span>
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-wrap sm:flex-nowrap gap-3 justify-start lg:justify-end">
            <button
              onClick={() => handleOpenTransfer(null)}
              className="flex-1 sm:flex-none px-5 py-3.5 rounded-2xl bg-white text-indigo-950 font-extrabold text-sm shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-600 group-hover:rotate-180 transition-transform duration-300" />
              Transfer Points
            </button>

            <Link
              to="/purchase"
              className="flex-1 sm:flex-none px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Buy Points
            </Link>

            <button
              onClick={() => {
                refreshUser();
                fetchDashboardData();
                fetchUsers();
              }}
              title="Refresh wallet balance"
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Registered Users Directory</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select any user below to send wallet points immediately
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div className="mt-4">
              {loadingUsers ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 font-medium">Finding registered users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No other registered users found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchQuery ? 'Try a different search query' : 'Invite friends or register a second test account!'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {users.map((otherUser) => {
                    const uid = otherUser._id || otherUser.id;
                    const initial = otherUser.name?.charAt(0).toUpperCase() || 'U';
                    const joinDate = otherUser.createdAt
                      ? new Date(otherUser.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Recently';

                    return (
                      <div
                        key={uid}
                        className="py-3.5 px-3 rounded-2xl hover:bg-slate-50/80 transition-all flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">
                              {otherUser.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {otherUser.email}
                            </p>
                            <span className="text-[10px] text-slate-400 inline-flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" /> Joined {joinDate}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenTransfer(otherUser)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Transfer</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800">
                Active Exchange Rate
              </span>
              <Coins className="w-4 h-4 text-amber-600" />
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-950">₹1 INR</span>
              <span className="text-sm font-bold text-amber-700">=</span>
              <span className="text-2xl font-black text-indigo-700">{conversionRate} Points</span>
            </div>

            <p className="text-xs text-amber-900/80 leading-relaxed">
              Managed in real-time by the Administrator. Purchase points instantly using mock UPI or Cards.
            </p>

            <Link
              to="/purchase"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 underline underline-offset-4"
            >
              Calculate & Buy Points &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
              </div>
              <Link
                to="/profile"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                View All
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No transactions yet. Send points to friends or buy some!
              </p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((txn) => {
                  const isSent = txn.type === 'TRANSFER' && txn.sender?._id === user?._id;
                  const isReceived = txn.type === 'TRANSFER' && txn.recipient?._id === user?._id;
                  const isPurchase = txn.type === 'PURCHASE';

                  let title = '';
                  let subtitle = '';
                  let pointsPrefix = '';
                  let pointsClass = '';

                  if (isPurchase) {
                    title = 'Purchased Points';
                    subtitle = `₹${txn.amountInRupees} via ${txn.paymentMethod}`;
                    pointsPrefix = '+';
                    pointsClass = 'text-emerald-600';
                  } else if (isSent) {
                    title = `Sent to ${txn.recipient?.name || 'User'}`;
                    subtitle = txn.note ? `"${txn.note}"` : 'Direct transfer';
                    pointsPrefix = '-';
                    pointsClass = 'text-rose-600';
                  } else if (isReceived) {
                    title = `Received from ${txn.sender?.name || 'User'}`;
                    subtitle = txn.note ? `"${txn.note}"` : 'Direct transfer';
                    pointsPrefix = '+';
                    pointsClass = 'text-emerald-600';
                  }

                  return (
                    <div
                      key={txn._id}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isPurchase
                              ? 'bg-emerald-100 text-emerald-700'
                              : isSent
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {isPurchase ? (
                            <PlusCircle className="w-3.5 h-3.5" />
                          ) : isSent ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`font-extrabold ${pointsClass}`}>
                          {pointsPrefix}{txn.points} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        preselectedUser={selectedUserForTransfer}
        allUsers={users}
        onSuccess={handleTransferSuccess}
      />

    </div>
  );
};

export default LandingPage;
