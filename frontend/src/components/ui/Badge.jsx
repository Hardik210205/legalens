import React from 'react';

const colorMap = {
  open: 'bg-status-open/10 text-status-open border-status-open/40',
  closed: 'bg-status-closed/10 text-status-closed border-status-closed/40',
  pending: 'bg-status-pending/10 text-status-pending border-status-pending/40',
  default: 'bg-card text-text-secondary border-border'
};

const Badge = ({ variant = 'default', className = '', children }) => {
  const color = colorMap[variant] || colorMap.default;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${color} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

