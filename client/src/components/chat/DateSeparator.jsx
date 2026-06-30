import React from 'react';

const DateSeparator = ({ dateStr }) => {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today - msgDay) / 86400000);

  let label;
  if (diffDays === 0) label = 'Today';
  else if (diffDays === 1) label = 'Yesterday';
  else label = d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', padding: '12px 0 4px',
    }}>
      <span style={{
        fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em',
        padding: '4px 12px', borderRadius: '99px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {label}
      </span>
    </div>
  );
};

export default DateSeparator;
