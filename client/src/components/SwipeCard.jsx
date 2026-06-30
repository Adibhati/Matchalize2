import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAppConfig } from '../utils/AppConfigContext';

const SwipeCard = ({ user, onSwipe, active, dragEnabled = true }) => {
  const config = useAppConfig();
  const iconMap = config.interestIcons;
  const iconFallbacks = config.interestIconFallbacks;
  const x = useMotionValue(0);
  const longPressTimer = useRef(null);
  const [preview, setPreview] = useState(null);

  const rotate = useTransform(x, [-200, 200], [-8, 8]);

  const handlePointerDown = useCallback((content) => {
    longPressTimer.current = setTimeout(() => {
      setPreview(content);
    }, 400);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const [showBottomGrad, setShowBottomGrad] = useState(false);
  const scrollRef = useRef(null);

  const dismissPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const previewHandlers = dragEnabled ? (content) => ({
    onPointerDown: () => handlePointerDown(content),
    onPointerUp: handlePointerUp,
  }) : () => ({});

  if (!user) return null;

  const mainImg = user.photos && user.photos.length > 0 ? user.photos[0] : null;
  const extraImgs = user.photos ? user.photos.slice(1) : [];
  const prompts = user.prompts || [];
  const interests = user.interests || [];

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right', user._id);
    } else if (info.offset.x < -threshold) {
      onSwipe('left', user._id);
    }
  };

  const interestIcon = (interest) => {
    const key = interest.toLowerCase().trim();
    if (iconMap[key]) return iconMap[key];
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
    }
    return iconFallbacks[Math.abs(hash) % iconFallbacks.length];
  };

  const vitals = [];
  if (user.gender) vitals.push({ icon: 'person', val: user.gender });
  if (user.pronouns) vitals.push({ icon: 'badge', val: user.pronouns });
  if (user.hostel) vitals.push({ icon: 'home', val: user.hostel });

  if (!active) return null;

  return (
    <motion.div
      drag={dragEnabled ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragDirectionLock
      style={{
        x,
        rotate,
        position: 'absolute',
        width: '97.9%',
        height: '100%',
        top: 0,
        left: '1.05%',
        zIndex: 10,
        touchAction: 'pan-y',
      }}
      onDragEnd={handleDragEnd}
      onDragStart={() => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }}
      whileDrag={{ scale: 1.02 }}
      dragElastic={0.9}
      transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.5 }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '28px 28px 0 0',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.06)',
          background: 'rgba(18, 18, 24, 0.95)',
          backdropFilter: 'blur(60px)',
          WebkitBackdropFilter: 'blur(60px)',
        }}
      >
        {dragEnabled && <></>}

        <div
          style={{
            flex: 1,
            position: 'relative',
            overflowY: preview ? 'hidden' : 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'auto',
            transform: 'translateZ(0)',
            willChange: 'scroll-position',
          }}
          className="card-scrollable"
        >
          {/* Hero Section — fills from card top to NavBar top */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '100%',
              backgroundImage: mainImg ? `url(${mainImg})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: 'rgba(18, 18, 24, 0.95)',
              cursor: dragEnabled ? 'grab' : 'default',
              borderRadius: '28px 28px 0 0',
              overflow: 'hidden',
              flexShrink: 0,
              WebkitTouchCallout: 'none',
            }}
          >
            {!mainImg && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '84px',
                fontWeight: '800',
                color: 'rgba(255,255,255,0.03)',
                fontFamily: 'Geist, sans-serif',
              }}>
                {user.name ? user.name.substring(0, 2).toUpperCase() : '??'}
              </div>
            )}

            {/* Bottom overlay: name+age, branch·year, bio */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2,
              background: 'linear-gradient(to top, #000000 0%, #000000 55%, rgba(0,0,0,0) 100%)',
              padding: '120px 20px 14px 20px',
              pointerEvents: 'none',
            }}>
              {/* Line 1: Name, age */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{
                  fontSize: '26px', fontWeight: '700', color: '#ffffff',
                  letterSpacing: '-0.02em', lineHeight: 1.15,
                  fontFamily: 'Geist, sans-serif',
                }}>
                  {user.name}
                </span>
                {user.age && (
                  <span style={{
                    fontSize: '18px', fontWeight: '400', color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.15,
                  }}>
                    {user.age}
                  </span>
                )}
              </div>

              {/* Line 2: Branch · Year */}
              {(user.branch || user.year) && (
                <div style={{ marginTop: '2px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.3px', lineHeight: 1.3,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {user.branch}
                    {user.branch && user.year && <span style={{ margin: '0 5px', color: 'rgba(255,255,255,0.25)' }}>·</span>}
                    {user.year}
                  </span>
                </div>
              )}

              {/* Line 3: Bio */}
              {user.bio && (
                <div style={{
                  marginTop: '8px',
                  borderLeft: '2px solid #f97316',
                  paddingLeft: '10px',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                }}>
                  <span style={{
                    fontSize: '13px', fontWeight: '400',
                    color: 'rgba(255,255,255,0.55)',
                    fontFamily: 'Inter, sans-serif', fontStyle: 'italic',
                    lineHeight: 1.45,
                  }}>
                    {user.bio}
                  </span>
                </div>
              )}
            </div>

            {user.isVerified && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(249, 115, 22, 0.15)',
                backdropFilter: 'blur(12px)',
                borderRadius: '20px',
                padding: '4px 10px 4px 8px',
                border: '0.5px solid rgba(249, 115, 22, 0.3)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14.4px', color: '#f97316', fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#fb923c', letterSpacing: '0.5px', fontFamily: 'Geist, sans-serif' }}>VERIFIED</span>
              </div>
            )}

          </div>

          {/* Bento Grid */}
          <div className="bento-grid">

            {/* Vitals */}
            {vitals.length > 0 && (
              <div className="bento-block glass-bento">
                <div className="bento-header" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14.4px' }}>sparkles</span>
                  VITALS
                </div>
                <div className="vital-chips">
                  {vitals.map((v, i) => (
                    <div key={i} className="vital-chip">
                      <span className="material-symbols-outlined" style={{ fontSize: '14.4px', color: '#fb923c' }}>{v.icon}</span>
                      {v.val}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Intent + Seeking */}
            <div className="bento-row">
              {user.intent && user.intent.length > 0 && (
                <div className="bento-block glass-bento bento-col-half">
                  <div className="bento-header" style={{ color: '#f97316', marginBottom: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14.4px' }}>favorite</span>
                    INTENT
                  </div>
                  <div style={{ fontSize: '14.4px', fontWeight: '600', color: '#fff', fontFamily: 'Geist, sans-serif' }}>
                    {Array.isArray(user.intent) ? user.intent.join(' / ') : user.intent}
                  </div>
                </div>
              )}
              {user.interestedIn && user.interestedIn.length > 0 && (
                <div className="bento-block glass-bento bento-col-half">
                  <div className="bento-header" style={{ color: '#f97316', marginBottom: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14.4px' }}>explore</span>
                    SEEKING
                  </div>
                  <div style={{ fontSize: '14.4px', fontWeight: '600', color: '#fff', fontFamily: 'Geist, sans-serif' }}>
                    {user.interestedIn.join(' / ')}
                  </div>
                </div>
              )}
            </div>

            {/* Interests */}
            {interests.length > 0 && (
              <div className="bento-block glass-bento">
                <div className="bento-header" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14.4px' }}>stars</span>
                  INTERESTS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {interests.map((interest, i) => (
                    <div key={i} className="gradient-border-chip">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px', marginRight: '4px', color: '#fb923c' }}>{interestIcon(interest)}</span>
                      {interest}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt 1 + Image 1 */}
            {prompts[0] && (
              <div className="bento-row" style={{ height: '220px' }}>
                  <div
                    className="bento-block glass-bento" style={{ flex: 1.3, justifyContent: 'center', background: 'linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(234,88,12,0.04) 100%)', borderColor: 'rgba(249,115,22,0.15)', position: 'relative', overflow: 'hidden', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
                    {...previewHandlers({ type: 'prompt', question: prompts[0].question, answer: prompts[0].answer })}
                  >
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.015)', pointerEvents: 'none' }} />
                  <div className="bento-header" style={{ color: '#fb923c', position: 'relative', zIndex: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14.4px', fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                    {prompts[0].question}
                  </div>
                  <div style={{ fontSize: '16.5px', color: '#fff', fontStyle: 'italic', fontWeight: '500', lineHeight: 1.4, marginTop: '8px', fontFamily: 'Inter, sans-serif', textShadow: '0 0 12px rgba(249,115,22,0.25)', position: 'relative', zIndex: 1 }}>
                    {prompts[0].answer}
                  </div>
                </div>
                {extraImgs[0] && (
                  <div
                    style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', position: 'relative', cursor: 'pointer', WebkitTouchCallout: 'none' }}
                    {...previewHandlers({ type: 'image', src: extraImgs[0] })}

                  >
                    <img src={extraImgs[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', WebkitTouchCallout: 'none' }} alt="Moment" />
                  </div>
                )}
              </div>
            )}

            {/* Prompt 2 + Image 2 */}
            {(prompts[1] || extraImgs[1]) && (
              <div className="bento-row" style={{ height: '220px' }}>
                {extraImgs[1] && (
                  <div
                    style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', position: 'relative', cursor: 'pointer', WebkitTouchCallout: 'none' }}
                    {...previewHandlers({ type: 'image', src: extraImgs[1] })}

                  >
                    <img src={extraImgs[1]} style={{ width: '100%', height: '100%', objectFit: 'cover', WebkitTouchCallout: 'none' }} alt="Moment" />
                  </div>
                )}
                {prompts[1] && (
                  <div
                    className="bento-block glass-bento" style={{ flex: 1.3, justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
                    {...previewHandlers({ type: 'prompt', question: prompts[1].question, answer: prompts[1].answer })}

                  >
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.015)', pointerEvents: 'none' }} />
                    <div className="bento-header" style={{ color: '#fb923c', position: 'relative', zIndex: 1 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14.4px', fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                      {prompts[1].question}
                    </div>
                    <div style={{ fontSize: '16.5px', color: '#fff', fontStyle: 'italic', fontWeight: '500', lineHeight: 1.4, marginTop: '8px', fontFamily: 'Inter, sans-serif', textShadow: '0 0 12px rgba(249,115,22,0.25)', position: 'relative', zIndex: 1 }}>
                      {prompts[1].answer}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prompt 3 */}
            {prompts[2] && (
              <div className="bento-block glass-bento" style={{ height: '160px', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
                {...previewHandlers({ type: 'prompt', question: prompts[2].question, answer: prompts[2].answer })}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.015)', pointerEvents: 'none' }} />
                <div className="bento-header" style={{ color: '#fb923c', position: 'relative', zIndex: 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14.4px', fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                  {prompts[2].question}
                </div>
                <div style={{ fontSize: '16.5px', color: '#fff', fontStyle: 'italic', fontWeight: '500', lineHeight: 1.4, marginTop: '8px', fontFamily: 'Inter, sans-serif', textShadow: '0 0 12px rgba(249,115,22,0.25)', position: 'relative', zIndex: 1 }}>
                  {prompts[2].answer}
                </div>
              </div>
            )}

            {/* Last image */}
            {extraImgs[2] && (
              <div
                className="bento-block" style={{ height: '220px', padding: 0, borderRadius: '20px', overflow: 'hidden', position: 'relative', cursor: 'pointer', WebkitTouchCallout: 'none' }}
                {...previewHandlers({ type: 'image', src: extraImgs[2] })}
              >
                <img src={extraImgs[2]} style={{ width: '100%', height: '100%', objectFit: 'cover', WebkitTouchCallout: 'none' }} alt="Moment" />
              </div>
            )}

            {/* Prompt 4 */}
            {prompts[3] && (
              <div className="bento-row" style={{ height: '160px' }}>
                <div
                  className="bento-block glass-bento" style={{ width: '100%', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
                  {...previewHandlers({ type: 'prompt', question: prompts[3].question, answer: prompts[3].answer })}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.015)', pointerEvents: 'none' }} />
                  <div className="bento-header" style={{ color: 'var(--primary)', position: 'relative', zIndex: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14.4px', fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                    {prompts[3].question}
                  </div>
                  <div style={{ fontSize: '16.5px', color: '#fff', fontStyle: 'italic', fontWeight: '500', lineHeight: 1.4, marginTop: '8px', fontFamily: 'Inter, sans-serif', textShadow: '0 0 12px rgba(249,115,22,0.25)', position: 'relative', zIndex: 1 }}>
                    {prompts[3].answer}
                  </div>
                </div>
              </div>
            )}

            {/* Prompt 5 */}
            {prompts[4] && (
              <div className="bento-row" style={{ height: '160px' }}>
                <div
                  className="bento-block glass-bento" style={{ width: '100%', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
                  {...previewHandlers({ type: 'prompt', question: prompts[4].question, answer: prompts[4].answer })}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.015)', pointerEvents: 'none' }} />
                  <div className="bento-header" style={{ color: 'var(--primary)', position: 'relative', zIndex: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14.4px', fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                    {prompts[4].question}
                  </div>
                  <div style={{ fontSize: '16.5px', color: '#fff', fontStyle: 'italic', fontWeight: '500', lineHeight: 1.4, marginTop: '8px', fontFamily: 'Inter, sans-serif', textShadow: '0 0 12px rgba(249,115,22,0.25)', position: 'relative', zIndex: 1 }}>
                    {prompts[4].answer}
                  </div>
                </div>
              </div>
            )}

           </div>

          {/* Bottom gradient — end of scroll content */}
          <div style={{
            height: '200px',
            marginTop: '-200px',
            background: 'linear-gradient(to top, #000000 0%, #000000 25%, transparent 100%)',
            pointerEvents: 'none',
            flexShrink: 0,
          }} />

        </div>
      </div>

      {/* Preview Overlay — persists until tap or drag dismiss */}
      <AnimatePresence>
        {preview && (
          <motion.div
            key="preview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onPointerUp={dismissPreview}
            style={{
              position: 'absolute', inset: 0, zIndex: 100,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.88)',
              touchAction: 'none',
            }}
          >
            <motion.div
              key="preview-card"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28, mass: 0.7 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100 || info.velocity.y > 600) {
                  dismissPreview();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '88%', maxWidth: '380px',
                borderRadius: '20px', overflow: 'hidden',
                background: '#000',
                border: '0.5px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                cursor: 'grab',
                ...(preview.type === 'image' ? { width: '289px', maxWidth: '85vw', aspectRatio: '3 / 4' } : {}),
              }}
            >
              {preview.type === 'image' ? (
                <img src={preview.src} style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none',
                }} alt="Preview" />
              ) : (
                <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '180px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#f97316', fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Geist, sans-serif' }}>Prompt</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{preview.question}</div>
                  <div style={{ fontSize: '24px', color: '#fff', fontStyle: 'italic', fontWeight: '500', fontFamily: 'Inter, sans-serif', lineHeight: 1.4, textShadow: '0 0 15px rgba(249,115,22,0.3)' }}>"{preview.answer}"</div>
                </div>
              )}
            </motion.div>
            <div style={{ marginTop: '24px', fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', fontFamily: 'Geist, sans-serif', textTransform: 'uppercase' }}>
              {preview.type === 'image' ? 'Drag down or tap to close' : 'Tap to close'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SwipeCard;
