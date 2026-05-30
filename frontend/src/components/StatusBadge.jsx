import React from 'react';
import { STATUS_COLORS } from '../utils/constants';

export default function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  return (
    <span
      className="badge"
      style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      {status}
    </span>
  );
}
