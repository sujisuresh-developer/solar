import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createLead } from '../utils/api';
import LeadForm from '../components/LeadForm';

export default function AddLead() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await createLead(data);
      toast.success('Lead added successfully! 🌞');
      navigate('/leads');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.length) {
        errors.forEach(e => toast.error(e.msg));
      } else {
        toast.error(err.response?.data?.message || 'Failed to add lead');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/leads" style={{ fontSize: 13, color: 'var(--slate-500)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Leads
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>Add New Lead</h1>
        <p style={{ fontSize: 14, color: 'var(--slate-400)', marginTop: 3 }}>Capture a new customer inquiry</p>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 680 }}>
        {/* Pipeline steps visual */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, overflow: 'hidden', borderRadius: 8, background: 'var(--slate-50)', padding: 12, border: '1px solid var(--slate-200)' }}>
          {['New Lead', 'Contacted', 'Site Visit', 'Proposal', 'Won'].map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                flex: 1, textAlign: 'center', fontSize: 11, fontWeight: i === 0 ? 700 : 400,
                color: i === 0 ? 'var(--sun-orange)' : 'var(--slate-400)',
                padding: '4px 2px',
              }}>{s}</div>
              {i < 4 && <span style={{ color: 'var(--slate-300)', fontSize: 12 }}>›</span>}
            </div>
          ))}
        </div>

        <LeadForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
