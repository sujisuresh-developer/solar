import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getLeads, deleteLead, updateLeadStatus, updateLead, getLocations } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import LeadForm from '../components/LeadForm';
import { STATUSES } from '../utils/constants';
import { format } from 'date-fns';

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  // Filters
  const [filters, setFilters] = useState({ status: '', location: '', startDate: '', endDate: '', search: '' });

  // Modals
  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [statusLead, setStatusLead] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.location) params.location = filters.location;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.search) params.search = filters.search;

    getLeads(params)
      .then(r => { setLeads(r.data.leads); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to fetch leads'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => {
    getLocations().then(r => setLocations(r.data.locations)).catch(() => {});
  }, []);

  const handleDelete = async () => {
    try {
      await deleteLead(deleteId);
      toast.success('Lead deleted');
      setDeleteId(null);
      fetchLeads();
    } catch { toast.error('Failed to delete lead'); }
  };

  const handleStatusUpdate = async (newStatus) => {
    setSaving(true);
    try {
      await updateLeadStatus(statusLead._id, newStatus);
      toast.success('Status updated');
      setStatusLead(null);
      fetchLeads();
    } catch { toast.error('Failed to update status'); }
    setSaving(false);
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      await updateLead(editLead._id, data);
      toast.success('Lead updated!');
      setEditLead(null);
      fetchLeads();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update';
      toast.error(msg);
    }
    setSaving(false);
  };

  const clearFilters = () => setFilters({ status: '', location: '', startDate: '', endDate: '', search: '' });

  const inputStyle = {
    padding: '8px 12px', border: '1.5px solid var(--slate-200)', borderRadius: 8,
    fontSize: 13, color: 'var(--deep-navy)', background: 'white', fontFamily: 'DM Sans', outline: 'none',
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>All Leads</h1>
          <p style={{ fontSize: 14, color: 'var(--slate-400)', marginTop: 3 }}>{total} total leads</p>
        </div>
        <Link to="/leads/new" className="btn btn-primary">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <input
            style={{ ...inputStyle, width: 200 }}
            placeholder="🔍 Search name, email, phone..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
          <select style={{ ...inputStyle, width: 170 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select style={{ ...inputStyle, width: 150 }} value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}>
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--slate-500)' }}>From</span>
            <input type="date" style={inputStyle} value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
            <span style={{ fontSize: 12, color: 'var(--slate-500)' }}>To</span>
            <input type="date" style={inputStyle} value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          {(filters.status || filters.location || filters.startDate || filters.endDate || filters.search) && (
            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate-400)' }}>Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>☀️</div>
              <p style={{ marginTop: 8, fontWeight: 600 }}>No leads found</p>
              <p style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 4 }}>Try adjusting your filters or add a new lead.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Lead</th><th>Phone</th><th>Location</th><th>Property</th><th>Size</th><th>Source</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--deep-navy)' }}>{lead.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{lead.email}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{lead.phone}</td>
                    <td>{lead.location}</td>
                    <td><span style={{ fontSize: 13 }}>{lead.propertyType}</span></td>
                    <td>{lead.systemSize} kW</td>
                    <td style={{ fontSize: 13, color: 'var(--slate-500)' }}>{lead.source}</td>
                    <td><StatusBadge status={lead.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>
                      {format(new Date(lead.createdAt), 'dd MMM yy')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn-icon" title="View" onClick={() => setViewLead(lead)}>
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button className="btn-icon" title="Edit" onClick={() => setEditLead(lead)}>
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn-icon" title="Update Status" onClick={() => setStatusLead(lead)} style={{ color: 'var(--sun-gold)' }}>
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        </button>
                        <button className="btn-icon" title="Delete" onClick={() => setDeleteId(lead._id)} style={{ color: 'var(--red-danger)' }}>
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewLead && (
        <div className="modal-backdrop" onClick={() => setViewLead(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lead Details</h2>
              <button className="btn-icon" onClick={() => setViewLead(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['Full Name', viewLead.fullName],
                  ['Phone', viewLead.phone],
                  ['Email', viewLead.email],
                  ['Location', viewLead.location],
                  ['Property Type', viewLead.propertyType],
                  ['System Size', `${viewLead.systemSize} kW`],
                  ['Source', viewLead.source],
                  ['Status', null],
                  ['Added On', format(new Date(viewLead.createdAt), 'dd MMM yyyy, hh:mm a')],
                  ['Last Updated', format(new Date(viewLead.updatedAt), 'dd MMM yyyy, hh:mm a')],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-400)', marginBottom: 3 }}>{label}</div>
                    {label === 'Status' ? <StatusBadge status={viewLead.status} /> : <div style={{ fontSize: 14, fontWeight: 500 }}>{val}</div>}
                  </div>
                ))}
                {viewLead.notes && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-400)', marginBottom: 3 }}>Notes</div>
                    <div style={{ fontSize: 14, color: 'var(--slate-600)' }}>{viewLead.notes}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewLead(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setEditLead(viewLead); setViewLead(null); }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editLead && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Lead</h2>
              <button className="btn-icon" onClick={() => setEditLead(null)}>✕</button>
            </div>
            <div className="modal-body">
              <LeadForm initialData={editLead} onSubmit={handleEdit} onCancel={() => setEditLead(null)} loading={saving} />
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {statusLead && (
        <div className="modal-backdrop" onClick={() => setStatusLead(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Status</h2>
              <button className="btn-icon" onClick={() => setStatusLead(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--slate-600)', marginBottom: 16 }}>
                Select a new status for <strong>{statusLead.fullName}</strong>:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STATUSES.map(s => (
                  <button
                    key={s}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'space-between', fontWeight: s === statusLead.status ? 700 : 400, background: s === statusLead.status ? 'var(--slate-100)' : '' }}
                    onClick={() => handleStatusUpdate(s)}
                    disabled={saving}
                  >
                    {s}
                    {s === statusLead.status && <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>Current</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Lead</h2>
              <button className="btn-icon" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--slate-600)' }}>Are you sure you want to delete this lead? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
