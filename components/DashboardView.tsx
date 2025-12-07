import React from 'react';
import { AuditSummary, AgingCategory } from '../types';
import { formatCurrency } from '../utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Wallet, Users } from 'lucide-react';

interface DashboardViewProps {
  summary: AuditSummary;
}

const DashboardView: React.FC<DashboardViewProps> = ({ summary }) => {
  const agingData = Object.entries(summary.agingProfile).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit Dashboard</h2>
          <p className="text-slate-500">Accounts Receivable Overview & Risk Assessment</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
          As of Date: 31 Dec 2023
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Receivable" 
          value={formatCurrency(summary.totalReceivable)} 
          subtext="Gross exposure before allowance"
          icon={Wallet}
          color="bg-blue-600"
        />
        <StatCard 
          title="Bad Debt Potential" 
          value={formatCurrency(summary.badDebtPotential)} 
          subtext="Overdue > 90 days"
          icon={AlertTriangle}
          color="bg-red-600"
        />
        <StatCard 
          title="Net Exposure" 
          value={formatCurrency(summary.netExposure)} 
          subtext="Outstanding balance"
          icon={TrendingUp}
          color="bg-indigo-600"
        />
        <StatCard 
          title="Top 5 Debtors" 
          value={formatCurrency(summary.topDebtors.reduce((acc, curr) => acc + curr.amount, 0))} 
          subtext="Concentration risk"
          icon={Users}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aging Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Aging Profile</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Debtors Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Risk Concentration (Top Debtors)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.topDebtors}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
