import React, { useState, useEffect } from 'react';
import { PROPERTY_TYPES, SOURCES } from '../utils/constants';

const INITIAL = {
  fullName: '', phone: '', email: '', location: '',
  propertyType: '', systemSize: '', source: '', notes: '',
};

function validate(form) {
  const errs = {};
  if (!form.fullName.trim()) errs.fullName = 'Full name is required';
  if (!form.phone.trim()) errs.phone = 'Phone number is required';
  else if (!/^\d{10}$/.test(form.phone.trim())) errs.phone = 'Phone must be exactly 10 digits';
  if (!form.email.trim()) errs.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email address';
  if (!form.location.trim()) errs.location = 'Location/City is required';
  if (!form.propertyType) errs.propertyType = 'Property type is required';
  if (!form.systemSize) errs.systemSize = 'System size is required';
  else if (Number(form.systemSize) < 1 || Number(form.systemSize) > 100) errs.systemSize = 'Must be between 1 and 100 kW';
  if (!form.source) errs.source = 'Source is required';
  return errs;
}

export default function LeadForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        location: initialData.location || '',
        propertyType: initialData.propertyType || '',
        systemSize: initialData.systemSize ?? '',
        source: initialData.source || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, systemSize: Number(form.systemSize) });
  };

  const field = (name, label, required = true) => (
    <div className="form-group">
      <label className="form-label">{label}{required && <span className="required">*</span>}</label>
      <input
        className={`form-input${errors[name] ? ' error' : ''}`}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        autoComplete="off"
      />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {field('fullName', 'Full Name')}

        <div style={grid2}>
          {field('phone', 'Phone Number')}
          {field('email', 'Email Address')}
        </div>

        <div style={grid2}>
          {field('location', 'Location / City')}
          <div className="form-group">
            <label className="form-label">Property Type<span className="required">*</span></label>
            <select
              className={`form-select${errors.propertyType ? ' error' : ''}`}
              name="propertyType"
              value={form.propertyType}
              onChange={handleChange}
            >
              <option value="">Select type...</option>
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.propertyType && <span className="form-error">{errors.propertyType}</span>}
          </div>
        </div>

        <div style={grid2}>
          <div className="form-group">
            <label className="form-label">System Size (kW)<span className="required">*</span></label>
            <input
              className={`form-input${errors.systemSize ? ' error' : ''}`}
              name="systemSize"
              type="number"
              min="1" max="100" step="0.5"
              value={form.systemSize}
              onChange={handleChange}
              placeholder="e.g. 10"
            />
            {errors.systemSize && <span className="form-error">{errors.systemSize}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Lead Source<span className="required">*</span></label>
            <select
              className={`form-select${errors.source ? ' error' : ''}`}
              name="source"
              value={form.source}
              onChange={handleChange}
            >
              <option value="">Select source...</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.source && <span className="form-error">{errors.source}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes <span style={{ fontWeight: 400, color: 'var(--slate-400)' }}>(optional)</span></label>
          <textarea
            className="form-textarea"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any additional notes..."
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      <div className="modal-footer" style={{ margin: '20px -24px -20px', borderRadius: '0 0 12px 12px' }}>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Lead' : 'Add Lead'}
        </button>
      </div>
    </form>
  );
}
