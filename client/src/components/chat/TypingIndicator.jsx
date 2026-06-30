import React from 'react';

const TypingIndicator = () => (
  <div style={{
    display: 'flex', justifyContent: 'flex-start',
    paddingLeft: '4px', paddingTop: '6px',
  }}>
    <div style={{
      padding: '12px 16px',
      borderRadius: '18px 18px 18px 4px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', gap: '4px',
    }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: '6px', height: '6px', borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.35)',
          animation: `dotPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
    <style>{`
      @keyframes dotPulse {
        0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
        40% { opacity: 1; transform: scale(1); }
      }
    `}</style>
  </div>
);

export default TypingIndicator;
