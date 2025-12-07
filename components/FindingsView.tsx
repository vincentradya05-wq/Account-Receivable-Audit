import React, { useState } from 'react';
import { InvoiceRow, AgingCategory } from '../types';
import { formatCurrency } from '../utils';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface FindingsViewProps {
  data: InvoiceRow[];
}

const FindingsView: React.FC<FindingsViewProps> = ({ data }) => {
  const [filter, setFilter] = useState<'ALL' | 'HIGH_RISK' | 'NO_REPLY'>('ALL');

  const filteredData = data.filter(row => {
    if (filter === 'HIGH_RISK') return row.Days_Overdue > 90;
    if (filter === 'NO_REPLY') return row.Status_Konfirmasi.toLowerCase().includes('no reply');
    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('confirmed')) return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium border border-green-200">Confirmed</span>;
    if (s.includes('no reply')) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium border border-red-200">No Reply</span>;
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium border border-yellow-200">{status}</span>;
  };

  const getRiskLevel = (row: InvoiceRow) => {
    if (row.Days_Overdue > 90) return <span className="text-red-600 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> High</span>;
    if (row.Days_Overdue > 60) return <span className="text-orange-600 font-medium flex items-center gap-1"><HelpCircle className="w-3 h-3"/> Medium</span>;
    return <span className="text-slate-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Low</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit Findings & Data Tape</h2>
          <p className="text-slate-500">Substantive testing population details</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            All Data
          </button>
          <button 
             onClick={() => setFilter('HIGH_RISK')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'HIGH_RISK' ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:text-slate-900'}`}
          >
            High Risk (>90 Days)
          </button>
          <button 
             onClick={() => setFilter('NO_REPLY')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'NO_REPLY' ? 'bg-orange-50 text-orange-700' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Confirm: No Reply
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Invoice No</th>
                <th className="px-6 py-4 text-right">Amount (IDR)</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-center">Overdue (Days)</th>
                <th className="px-6 py-4">Confirm Status</th>
                <th className="px-6 py-4">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.Nama_Pelanggan}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{row.No_Invoice}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700">{formatCurrency(row.Jumlah_Tagihan)}</td>
                  <td className="px-6 py-4 text-slate-500">{row.Tanggal_Jatuh_Tempo}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${row.Days_Overdue > 90 ? 'text-red-600' : 'text-slate-600'}`}>
                      {row.Days_Overdue}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(row.Status_Konfirmasi)}</td>
                  <td className="px-6 py-4">{getRiskLevel(row)}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No records found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between">
          <span>Showing {filteredData.length} records</span>
          <span>Total Population: {data.length} records</span>
        </div>
      </div>
    </div>
  );
};

export default FindingsView;
