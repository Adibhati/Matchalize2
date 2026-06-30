import React from 'react';

const S = {
  backdrop: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 300,
  },
  menu: {
    position: 'fixed',
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '6px 0',
    minWidth: '160px',
    zIndex: 301,
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', cursor: 'pointer',
    fontSize: '14px', fontFamily: 'Inter, sans-serif',
    color: '#f6ded3', transition: 'background 0.1s',
    border: 'none', background: 'none', width: '100%', textAlign: 'left',
  },
};

const ACTIONS = [
  { id: 'copy', icon: 'content_copy', label: 'Copy', color: '#f6ded3' },
  { id: 'reply', icon: 'reply', label: 'Reply', color: '#f6ded3' },
  { id: 'react', icon: 'favorite', label: 'React', color: '#f6ded3' },
];

const REACTION_EMOJIS = ['❤️', '😂', '🔥', '👍', '😮', '😢'];

const ActionMenu = ({ msg, position, isMe, onAction, onClose }) => {
  if (!msg || !position) return null;

  const items = isMe
    ? [...ACTIONS, { id: 'delete', icon: 'delete', label: 'Delete', color: '#ef4444' }]
    : ACTIONS;

  return (
    <>
      <div style={S.backdrop} onClick={onClose} />
      <div style={{
        ...S.menu,
        top: `${Math.min(position.y, window.innerHeight - 250)}px`,
        left: `${Math.min(position.x, window.innerWidth - 180)}px`,
      }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onAction(item.id, msg)}
            style={{
              ...S.item,
              color: item.color,
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

const ReactPicker = ({ onSelect, onClose }) => (
  <>
    <div style={S.backdrop} onClick={onClose} />
    <div style={{
      position: 'fixed',
      bottom: '100px', left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: '6px',
      backgroundColor: '#1a1a1a', borderRadius: '24px',
      padding: '8px 12px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      zIndex: 301,
    }}>
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => { onSelect(emoji); onClose(); }}
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', border: 'none', backgroundColor: 'transparent',
            cursor: 'pointer', transition: 'transform 0.1s',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          {emoji}
        </button>
      ))}
    </div>
  </>
);

export { ActionMenu, ReactPicker };
