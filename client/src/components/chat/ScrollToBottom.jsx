import React from 'react';

const ScrollToBottom = React.memo(({ visible, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', bottom: '90px', left: '50%',
        transform: 'translateX(-50%)',
        width: '36px', height: '36px', borderRadius: '50%',
        backgroundColor: 'rgba(249,115,22,0.9)',
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 100,
        boxShadow: '0 2px 12px rgba(249,115,22,0.4)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff' }}>
        keyboard_arrow_down
      </span>
    </button>
  );
});

export default ScrollToBottom;
