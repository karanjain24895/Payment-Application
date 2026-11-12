import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import {
  ShieldCheck,
  Coins,
  Users,
  ArrowRightLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Search,
  History
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [currentRate, setCurrentRate] = useState(10);
  const [newRate, setNewRate] = useState('');
  const [rateDescription, setRateDescription] = useState('');
  const [updatingRate, setUpdatingRate] = useState(false);
  const [rateMessage, setRateMessage] = useState({ text: '', type: '' });

  const [transactions, setTransactions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [txnSearch, setTxnSearch] = useState('');
  const [txnFilter, setTxnFilter] = useState('ALL');
  const [loadingTxns, setLoadingTxns] = useState(true);

  const fetchAdminData = async () => {
    try {
      const rateRes = await api.get('/admin/conversion-rate');
      if (rateRes.data.success) {
        setCurrentRate(rateRes.data.conversionRate);
        setNewRate(rateRes.data.conversionRate.toString());
        setRateDescription(rateRes.data.description || '');
      }

      const statsRes = await api.get('/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      const usersRes = await api.get('/admin/users');
      if (usersRes.data.success) {
        setAllUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTxns(true);
    try {
      const res = await api.get(
        `/admin/transactions?type=${txnFilter}&search=${encodeURIComponent(txnSearch)}&limit=25`
      );
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load admin transactions:', err);
    } finally {
      setLoadingTxns(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 250);
    return () => clearTimeout(timer);
  }, [txnFilter, txnSearch]);

  const handleUpdateRate = async (e) => {
    e.preventDefault();
    const rateNum = Number(newRate);
    if (!rateNum || rateNum <= 0) {
      setRateMessage({ text: 'Please enter a valid rate greater than 0', type: 'error' });
      return;
    }

    setUpdatingRate(true);
    setRateMessage({ text: '', type: '' });

    try {
      const res = await api.put('/admin/conversion-rate', {
        pointsPerRupee: rateNum,
        description: rateDescription
      });

      if (res.data.success) {
        setCurrentRate(res.data.conversionRate);
        setRateMessage({
          text: `Conversion rate successfully updated! 1 INR now yields ${res.data.conversionRate} Points.`,
          type: 'success'
        });
        fetchAdminData();
      }
    } catch (err) {
      setRateMessage({
        text: err.response?.data?.message || err.message || 'Failed to update rate',
        type: 'error'
      });
    } finally {
      setUpdatingRate(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Management Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Configure system exchange rates, inspect platform volume, and monitor user balances.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Current Active Rate</span>
              <span className="text-lg font-black text-white">₹1 = {currentRate} pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Registered wallet holders</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total INR Revenue</span>
            <span className="text-xs font-bold">INR (₹)</span>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{stats?.totalRupeesRevenue?.toLocaleString() || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">From simulated purchases</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Circulating Points</span>
            <Coins className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalCirculatingPoints?.toLocaleString() || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Points in user wallets</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Transfers</span>
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.transfersCount || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {stats?.totalPointsTransferred?.toLocaleString() || 0} pts moved
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Manage Conversion Rate (Rupees to Wallet Points)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Set how many wallet points are credited for each 1 INR paid by customers during purchase.
          </p>

          {rateMessage.text && (
            <div
              className={`p-4 rounded-2xl mb-6 text-xs flex items-start gap-2.5 border ${
                rateMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {rateMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              )}
              <span className="font-medium">{rateMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateRate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Points per 1 Rupee (INR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                    pts / ₹1
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Calculation Preview
                </label>
                <div className="px-4 py-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-900 flex items-center justify-between">
                  <span>Pay ₹100 INR:</span>
                  <span className="text-sm font-extrabold text-indigo-700">
                    {Math.round(100 * (Number(newRate) || 0)).toLocaleString()} pts
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Rate Policy Description / Note
              </label>
              <input
                type="text"
                value={rateDescription}
                onChange={(e) => setRateDescription(e.target.value)}
                placeholder="e.g. Standard promotional exchange rate"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={updatingRate}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              {updatingRate ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Rate...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & Apply Conversion Rate
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Registered Accounts ({allUsers.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live balances and account roles for all registered members
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
                <th className="pb-3 pl-2">User Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Joined Date</th>
                <th className="pb-3 text-right pr-2">Wallet Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70">
                  <td className="py-3 pl-2 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    {u.name}
                  </td>
                  <td className="py-3 text-slate-600">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right pr-2 font-black text-indigo-600">
                    {u.walletBalance?.toLocaleString()} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Platform Transactions Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete chronological audit trail of all point movements
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={txnFilter}
              onChange={(e) => setTxnFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Types</option>
              <option value="PURCHASE">Purchases Only</option>
              <option value="TRANSFER">Transfers Only</option>
            </select>

            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                placeholder="Search ref or note..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingTxns ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading audit trail...</div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">No transactions recorded yet.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                  <th className="pb-3 pl-2">Reference ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Sender / Buyer</th>
                  <th className="pb-3">Recipient</th>
                  <th className="pb-3">Rupees / Rate</th>
                  <th className="pb-3 text-right pr-2">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-50/70">
                    <td className="py-3 pl-2 font-mono font-bold text-slate-700 text-[11px]">
                      {txn.referenceId}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          txn.type === 'PURCHASE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-800 font-medium">
                      {txn.sender?.name || txn.sender?.email || 'N/A'}
                    </td>
                    <td className="py-3 text-slate-800 font-medium">
                      {txn.recipient ? (txn.recipient.name || txn.recipient.email) : '—'}
                    </td>
                    <td className="py-3 text-slate-500 text-[11px]">
                      {txn.amountInRupees > 0 ? `₹${txn.amountInRupees} (@${txn.conversionRate}pts/₹)` : '—'}
                    </td>
                    <td className="py-3 text-right pr-2 font-black text-indigo-600">
                      {txn.points?.toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
