import React, { useState, useRef, useEffect } from 'react';

const EMOJIS = [
  '😀','😊','😂','❤️','🔥','👍','😭','🥰','😍','😎',
  '🤔','💀','✨','🎉','👋','🙄','😴','🥺','😜','🤣',
  '😘','💕','🙏','👀','💯','🙄','😏','🤩','😋','🫠',
  '💪','🎶','☕','🍕','🌙','⭐','🦋','🌸','🎯','🚀',
  '💀','😈','👻','🤡','😈','🥶','🤯','😴','🫡','🤙',
  '💌','💋','🫶','🤙','🤝','✌️','🤘','👌','🖐️','✋',
  '👀','🧠','💎','🎬','📚','🎮','🎧','🏋️','🎪','🎨',
  '🌹','🌺','🍀','🌈','☀️','🌊','🍰','🧋','🍩','🍦',
];

const S = {
  overlay: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    zIndex: 200,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  backdrop: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 199,
  },
  sheet: {
    width: '100%', maxWidth: '480px',
    backgroundColor: '#0a0a0a',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px 16px 0 0',
    display: 'flex', flexDirection: 'column',
    maxHeight: '55vh',
    zIndex: 200,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px',
  },
  title: {
    fontSize: '14px', fontWeight: '700', color: '#f6ded3',
    fontFamily: 'Inter, sans-serif',
  },
  closeBtn: {
    width: '28px', height: '28px', borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '4px',
    padding: '0 12px 12px',
    overflowY: 'auto',
    flex: 1,
  },
  emojiBtn: {
    aspectRatio: '1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px', borderRadius: '8px',
    border: 'none', backgroundColor: 'transparent',
    cursor: 'pointer', transition: 'all 0.1s ease',
    padding: 0,
  },
};

const EmojiPicker = ({ onSelect, onClose }) => {
  const [selected, setSelected] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleSelect = (emoji) => {
    setSelected(emoji);
    onSelect(emoji);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSelected(null), 200);
  };

  return (
    <>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.overlay}>
        <div style={S.sheet}>
          <div style={S.header}>
            <span style={S.title}>Emoji</span>
            <button onClick={onClose} style={S.closeBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
          </div>
          <div style={S.grid}>
            {EMOJIS.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => handleSelect(emoji)}
                style={{
                  ...S.emojiBtn,
                  backgroundColor: selected === emoji ? 'rgba(249,115,22,0.2)' : 'transparent',
                  transform: selected === emoji ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(EmojiPicker);
