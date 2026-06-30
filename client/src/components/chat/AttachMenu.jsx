import React, { useRef } from 'react';

const S = {
  backdrop: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 300,
  },
  sheet: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    maxWidth: '480px', margin: '0 auto',
    backgroundColor: '#1a1a1a',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px 16px 0 0',
    padding: '8px 0',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    zIndex: 301,
  },
  item: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 20px', cursor: 'pointer',
    fontSize: '15px', fontFamily: 'Inter, sans-serif',
    color: '#f6ded3', transition: 'background 0.1s',
    border: 'none', background: 'none', width: '100%', textAlign: 'left',
  },
  cancel: {
    display: 'block', padding: '14px', cursor: 'pointer',
    fontSize: '15px', fontFamily: 'Inter, sans-serif',
    color: 'rgba(255,255,255,0.4)', textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    marginTop: '4px',
    border: 'none', background: 'none', width: '100%',
  },
};

const AttachMenu = ({ onSelect, onClose }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (type) => {
    if (type === 'gallery') {
      fileInputRef.current?.click();
    } else if (type === 'camera') {
      cameraInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelect(file);
      onClose();
    }
    e.target.value = '';
  };

  return (
    <>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.sheet}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button
          style={S.item}
          onClick={() => handleFileSelect('gallery')}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#f97316' }}>photo_library</span>
          Gallery
        </button>
        <button
          style={S.item}
          onClick={() => handleFileSelect('camera')}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#f97316' }}>photo_camera</span>
          Camera
        </button>

        <button style={S.cancel} onClick={onClose}>Cancel</button>
      </div>
    </>
  );
};

export default AttachMenu;
