import React from 'react';

const S = {
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    gap: '10px',
    zIndex: 50,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  backBtn: {
    width: '34px', height: '34px', borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0, flexShrink: 0,
    color: 'rgba(255,255,255,0.6)',
  },
  profile: {
    display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0,
    cursor: 'pointer',
  },
  avatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    backgroundSize: 'cover', backgroundPosition: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: '10px', height: '10px', borderRadius: '50%',
    border: '2px solid #000',
  },
  nameText: {
    fontSize: '16px', fontWeight: '700', color: '#fff',
    fontFamily: 'Inter, sans-serif', lineHeight: 1.2,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  infoText: {
    fontSize: '11px', color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Inter, sans-serif', marginTop: '1px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    letterSpacing: '0.02em', fontWeight: 500,
  },
  menuBtn: {
    width: '34px', height: '34px', borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0, flexShrink: 0,
    color: 'rgba(255,255,255,0.5)',
  },
  menuDropdown: {
    position: 'absolute', top: '50px', right: '12px',
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '6px 0',
    minWidth: '180px', zIndex: 200,
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', cursor: 'pointer',
    fontSize: '14px', fontFamily: 'Inter, sans-serif',
    color: '#f6ded3', transition: 'background 0.15s',
    border: 'none', background: 'none', width: '100%', textAlign: 'left',
  },
};

const ChatHeader = ({ matchInfo, isOnline, lastActive, onBack, onViewProfile, onUnmatch }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const lastSeenText = React.useMemo(() => {
    if (!lastActive) return 'Offline';
    const diff = Date.now() - new Date(lastActive).getTime();
    if (diff < 120000) return 'Online';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [lastActive]);

  const partnerFirstName = matchInfo?.name?.split(' ')[0] || 'Chat';

  return (
    <header style={S.header}>
      <button onClick={onBack} style={S.backBtn}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
      </button>

      <div onClick={onViewProfile} style={S.profile}>
        <div style={{
          ...S.avatar,
          backgroundImage: matchInfo?.photos?.[0] ? `url(${matchInfo.photos[0]})` : 'none',
        }}>
          {!matchInfo?.photos?.[0] && (
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#f97316' }}>
              {partnerFirstName[0]?.toUpperCase()}
            </span>
          )}
          <div style={{
            ...S.onlineDot,
            backgroundColor: isOnline ? '#22c55e' : '#666',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.nameText}>{partnerFirstName}</div>
          <div style={S.infoText}>
            {isOnline ? (
              <span style={{ color: '#22c55e' }}>Online</span>
            ) : (
              lastSeenText
            )}
            {matchInfo?.branch && ` · ${matchInfo.branch.split(' ')[0]}`}
            {matchInfo?.year && ` · ${matchInfo.year}`}
          </div>
        </div>
      </div>

      <div ref={menuRef} style={{ position: 'relative' }}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={S.menuBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
        </button>

        {menuOpen && (
          <div style={S.menuDropdown}>
            <button
              style={S.menuItem}
              onClick={() => { setMenuOpen(false); onViewProfile(); }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#f97316' }}>person</span>
              View Profile
            </button>
            <button
              style={{ ...S.menuItem, color: '#ef4444' }}
              onClick={() => { setMenuOpen(false); onUnmatch(); }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>heart_broken</span>
              Unmatch
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default React.memo(ChatHeader);
