import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_CHART_COLORS = {
  'New Lead': '#3B82F6',
  'Contacted': '#F59E0B',
  'Site Visit Scheduled': '#10B981',
  'Proposal Sent': '#8B5CF6',
  'Won': '#22C55E',
  'Lost': '#EF4444',
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Syne', color: accent || 'var(--deep-navy)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ color: 'var(--slate-400)', fontSize: 15 }}>Loading dashboard...</div>
    </div>
  );

  if (!data) return <div style={{ padding: 32 }}>Failed to load dashboard.</div>;

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#0f172a 0%,#1e40af 100%)",
          borderRadius: "24px",
          padding: "32px",
          color: "white",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "8px",
          }}
        >
          Welcome Back 👋
        </h1>

        <p
          style={{
            opacity: 0.8,
            fontSize: "15px",
            marginBottom: "24px",
          }}
        >
          Monitor your solar leads, conversions and sales
          performance in one place.
        </p>

        <Link
          to="/leads/new"
          className="btn"
          style={{
            background: "white",
            color: "#0f172a",
            fontWeight: "600",
          }}
        >
          + Add New Lead
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Leads" value={data.totalLeads} />
        <StatCard label="Won Leads" value={data.wonLeads} accent="var(--green-success)" />
        <StatCard label="Conversion Rate" value={`${data.conversionRate}%`} sub="(Won / Total)" accent="var(--sun-gold)" />
        <StatCard
          label="Active Pipeline"
          value={data.statusBreakdown.filter(s => !['Won', 'Lost'].includes(s.status)).reduce((a, b) => a + b.count, 0)}
          sub="Excluding Won/Lost"
          accent="var(--solar-blue)"
        />
      </div>

      {/* Chart + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Bar Chart */}
        <div
          className="card"
          style={{
            background: "#fff",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Leads by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.statusBreakdown} barSize={28}>
              <XAxis dataKey="status" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => v === 'Site Visit Scheduled' ? 'Site Visit' : v === 'Proposal Sent' ? 'Proposal' : v}
              />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid var(--slate-200)', fontSize: 13 }}
                cursor={{ fill: 'var(--slate-100)' }}
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {data.statusBreakdown.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status] || '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline status breakdown */}
        <div
          className="card"
          style={{
            background: "#fff",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Pipeline Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.statusBreakdown.map(({ status, count }) => {
              const pct = data.totalLeads > 0 ? Math.round((count / data.totalLeads) * 100) : 0;
              const color = STATUS_CHART_COLORS[status] || '#94A3B8';
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{status}</span>
                    <span style={{ color: 'var(--slate-500)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 7, background: 'var(--slate-100)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Leads</h3>
          <Link to="/leads" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Location</th><th>Property</th><th>System</th><th>Status</th><th>Added</th>
              </tr>
            </thead>
            <tbody>
              {data.recentLeads.map(lead => (
                <tr key={lead._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--deep-navy)' }}>{lead.fullName}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{lead.email}</div>
                  </td>
                  <td>{lead.location}</td>
                  <td>{lead.propertyType}</td>
                  <td>{lead.systemSize} kW</td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td style={{ color: 'var(--slate-400)', fontSize: 13 }}>
                    {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
