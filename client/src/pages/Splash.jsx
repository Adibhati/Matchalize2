import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Splash = () => {
  const navigate = useNavigate();
  const bgRef = useRef(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.preload = 'auto';
    video.style.cssText = `
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; pointer-events: none; z-index: 0;
    `;

    const source = document.createElement('source');
    source.src = '/splash-bg.mp4';
    source.type = 'video/mp4';
    video.appendChild(source);

    const inject = () => {
      if (bgRef.current && !video.parentNode) {
        bgRef.current.appendChild(video);
      }
    };

    video.addEventListener('playing', inject, { once: true });
    video.load();
    video.play().catch(() => {});

    const retry = () => { if (video.paused) video.play().catch(() => {}); };
    document.addEventListener('touchstart', retry, { once: true });
    document.addEventListener('click', retry, { once: true });

    return () => {
      video.pause();
      if (video.parentNode) video.parentNode.removeChild(video);
      video.removeAttribute('src');
      video.load();
    };
  }, []);

  return (
    <motion.div
      animate={exiting ? { opacity: 0, scale: 0.96, y: -15 } : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={() => {
        if (exiting) navigate('/auth');
      }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000000',
      }}
    >
      {/* Container where the in-memory video gets injected once playing */}
      <div ref={bgRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }} />

      {/* Dark Gradient behind content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: `
          linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.9) 100%),
          linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)
        `,
      }} />

      {/* Animated Orange Glow Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 1,
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,88,12,0.25) 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 1,
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.06, 0.12, 0.06],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        style={{
          position: 'absolute',
          top: '30%',
          right: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 1,
        }}
      />

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 24px 40px 24px',
      }}>
        {/* Logo + Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '20px',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'inline-block' }}>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '56px',
              fontWeight: '800',
              color: '#F3F4F6',
              letterSpacing: '-0.5px',
              textTransform: 'lowercase',
              margin: 0,
              lineHeight: '1',
            }}>
              matchalize
            </h1>
            <div style={{
              height: '5px',
              borderRadius: '3px',
              marginTop: '8px',
              width: '59%',
              background: 'linear-gradient(90deg, #f97316, #ea580c)',
              boxShadow: '0 0 12px rgba(249,115,22,0.3)',
            }} />
          </div>

          {/* Tagline */}
          <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '18px',
            fontWeight: '500',
            letterSpacing: '1px',
            textAlign: 'center',
            fontStyle: 'italic',
            marginTop: '32px',
            fontFamily: 'Inter, sans-serif',
          }}>
            Your Campus. Your People.
          </p>
        </motion.div>

        {/* Bottom: CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          {/* Main CTA Button */}
          <button
            className="btn btn-primary glow-pulse"
            onClick={() => setExiting(true)}
            style={{
              padding: '18px 24px',
              borderRadius: '99px',
              fontSize: '15px',
              fontWeight: '700',
              fontFamily: 'Geist, sans-serif',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 8px 32px -8px rgba(249,115,22,0.4), 0 0 0 0.5px rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 40px -8px rgba(249,115,22,0.6), 0 0 0 0.5px rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(249,115,22,0.4), 0 0 0 0.5px rgba(255,255,255,0.1)';
            }}
          >
            Enter Your Campus
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          {/* Terms text */}
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '11px',
            textAlign: 'center',
            lineHeight: '1.4',
            fontFamily: 'Inter, sans-serif',
            marginTop: '4px',
          }}>
            By signing in, you agree to our Terms and verify that you are currently enrolled in an academic institution.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Splash;
