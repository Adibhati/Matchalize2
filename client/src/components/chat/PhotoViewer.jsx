import React, { useState } from 'react';

const S = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: '#000',
    zIndex: 500,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute', top: '16px', left: '16px',
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', zIndex: 10,
  },
  image: {
    maxWidth: '100%', maxHeight: '90vh',
    objectFit: 'contain', display: 'block',
    borderRadius: '4px',
  },
  loading: {
    width: '28px', height: '28px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTopColor: '#f97316',
    animation: 'spin 1s linear infinite',
  },
};

const PhotoViewer = ({ imageUrl, onClose }) => {
  const [loaded, setLoaded] = useState(false);

  if (!imageUrl) return null;

  return (
    <div style={S.overlay} onClick={onClose}>
      <button onClick={onClose} style={S.closeBtn}>
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
      </button>

      {!loaded && <div style={S.loading} />}

      <img
        src={imageUrl}
        alt="Full size"
        style={{
          ...S.image,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
        onLoad={() => setLoaded(true)}
        onClick={(e) => e.stopPropagation()}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PhotoViewer;
