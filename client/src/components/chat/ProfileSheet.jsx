import React from 'react';

const S = {
  backdrop: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 400,
  },
  sheet: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    maxWidth: '480px', margin: '0 auto',
    height: '85vh',
    backgroundColor: '#000',
    borderRadius: '20px 20px 0 0',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 401,
    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  dragHandle: {
    display: 'flex', justifyContent: 'center', padding: '10px 0 4px',
    cursor: 'grab',
  },
  handleBar: {
    width: '36px', height: '4px', borderRadius: '2px',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  closeBtn: {
    position: 'absolute', top: '12px', right: '16px',
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', zIndex: 10,
  },
  photo: {
    width: '100%', aspectRatio: '390/440',
    objectFit: 'cover', display: 'block',
  },
  photoPlaceholder: {
    width: '100%', aspectRatio: '390/440',
    backgroundColor: '#1c110b',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '48px', fontWeight: '700', color: '#f97316',
    fontFamily: 'Inter, sans-serif',
  },
  scrim: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '440px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)',
    pointerEvents: 'none',
  },
  photoSection: {
    position: 'relative', width: '100%', flexShrink: 0,
  },
  nameOverlay: {
    position: 'absolute', bottom: '16px', left: '16px', right: '16px',
  },
  content: {
    flex: 1, overflowY: 'auto', padding: '0 16px 24px',
    display: 'flex', flexDirection: 'column', gap: '20px',
  },
  sectionTitle: {
    fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Inter, sans-serif', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: '8px',
  },
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px', padding: '14px 16px',
  },
  promptQ: {
    fontSize: '11px', color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Inter, sans-serif', marginBottom: '4px',
    textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 500,
  },
  promptA: {
    fontSize: '14px', color: '#fff', fontWeight: '500',
    fontFamily: 'Inter, sans-serif', lineHeight: 1.4,
  },
  tagRow: {
    display: 'flex', flexWrap: 'wrap', gap: '8px',
  },
  tag: {
    padding: '6px 14px',
    backgroundColor: 'rgba(249,115,22,0.1)',
    border: '1px solid rgba(249,115,22,0.2)',
    color: '#f97316', borderRadius: '99px',
    fontSize: '12px', fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
};

const ProfileSheet = ({ matchInfo, onClose }) => {
  if (!matchInfo) return null;

  return (
    <>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.sheet}>
        <button onClick={onClose} style={S.closeBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </button>

        <div style={S.content} className="hide-scrollbar">
          <div style={S.photoSection}>
            {matchInfo.photos?.[0] ? (
              <img src={matchInfo.photos[0]} alt={matchInfo.name} style={S.photo} />
            ) : (
              <div style={S.photoPlaceholder}>
                {matchInfo.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={S.scrim} />
            <div style={S.nameOverlay}>
              <h1 style={{
                fontSize: '20px', fontWeight: '700', color: '#fff',
                fontFamily: 'Inter, sans-serif', lineHeight: 1.2, margin: 0,
              }}>
                {matchInfo.name}{matchInfo.age ? `, ${matchInfo.age}` : ''}
              </h1>
              <p style={{
                fontSize: '14px', color: '#f97316',
                fontFamily: 'Inter, sans-serif', margin: '4px 0 0', fontWeight: 600,
              }}>
                {matchInfo.branch}{matchInfo.year ? ` · ${matchInfo.year}` : ''}
              </p>
            </div>
          </div>

          {matchInfo.bio && (
            <div>
              <p style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.9)',
                fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
              }}>
                {matchInfo.bio}
              </p>
            </div>
          )}

          {matchInfo.prompts?.length > 0 && (
            <div>
              <div style={S.sectionTitle}>Prompts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {matchInfo.prompts.map((p, i) => (
                  <div key={i} style={S.promptCard}>
                    <div style={S.promptQ}>{p.question}</div>
                    <div style={S.promptA}>{p.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchInfo.interests?.length > 0 && (
            <div>
              <div style={S.sectionTitle}>Interests</div>
              <div style={S.tagRow}>
                {matchInfo.interests.map((tag, i) => (
                  <span key={i} style={S.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
};

export default ProfileSheet;
