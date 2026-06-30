import React, { useState, useRef } from 'react';

const S = {
  tray: {
    flexShrink: 0,
    padding: '8px 12px',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    zIndex: 100,
  },
  inputWrap: {
    flex: 1, height: '44px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    display: 'flex', alignItems: 'center',
    padding: '0 12px',
  },
  input: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: '#f6ded3', fontSize: '14px', fontFamily: 'Inter, sans-serif',
    lineHeight: '20px',
  },
  iconBtn: {
    width: '44px', height: '44px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0, flexShrink: 0,
    border: 'none', transition: 'all 0.15s ease',
  },
  sendBtn: {
    background: '#f97316',
    color: '#fff',
    boxShadow: '0 2px 12px rgba(249,115,22,0.3)',
  },
  attachBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.4)',
  },
  replyBar: {
    flexShrink: 0,
    padding: '8px 16px',
    backgroundColor: 'rgba(0,0,0,0.9)',
    backdropFilter: 'blur(20px)',
    display: 'flex', alignItems: 'center', gap: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  replyContent: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    borderLeft: '2px solid #f97316', borderRadius: '6px',
    padding: '6px 10px', overflow: 'hidden',
  },
  replyName: {
    fontSize: '11px', fontWeight: '600', color: '#f97316',
    fontFamily: 'Inter, sans-serif', marginBottom: '2px',
  },
  replyText: {
    fontSize: '12px', color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Inter, sans-serif',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
};

const InputTray = ({
  inputText, setInputText, onSend, onEmojiToggle, onAttach,
  replyTo, onClearReply, sending, loading,
}) => {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    onSend();
  };

  return (
    <>
      {replyTo && (
        <div style={S.replyBar}>
          <div style={S.replyContent}>
            <div style={S.replyName}>
              Replying to {replyTo.senderName || 'Partner'}
            </div>
            <div style={S.replyText}>
              {replyTo.type === 'image' ? '📷 Photo' : (replyTo.text || '')}
            </div>
          </div>
          <button
            onClick={onClearReply}
            style={{ ...S.iconBtn, width: '28px', height: '28px', color: 'rgba(255,255,255,0.4)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={S.tray}>
        <button
          type="button"
          onClick={onEmojiToggle}
          style={{ ...S.iconBtn, color: 'rgba(255,255,255,0.5)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>mood</span>
        </button>

        <div style={S.inputWrap}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Message"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            style={S.input}
          />
        </div>

        {inputText.trim() ? (
          <button
            type="submit"
            disabled={sending}
            style={{ ...S.iconBtn, ...S.sendBtn }}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: '20px',
              fontVariationSettings: "'FILL' 1",
            }}>send</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAttach}
            style={{ ...S.iconBtn, ...S.attachBtn }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>add_circle</span>
          </button>
        )}
      </form>
    </>
  );
};

export default React.memo(InputTray);
