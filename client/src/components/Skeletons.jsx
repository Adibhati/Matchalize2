import React from 'react';

const skeletonBase = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: '12px',
};

export const CardSkeleton = () => (
  <div style={{
    width: '97.9%', height: '97.9%',
    position: 'absolute', top: '1.05%', left: '1.05%',
    borderRadius: '28px 28px 0 0',
    display: 'flex', flexDirection: 'column',
    background: 'rgba(18, 18, 24, 0.95)',
    overflow: 'hidden',
  }}>
    <div style={{ ...skeletonBase, flex: 1, borderRadius: '28px 28px 0 0', margin: 0 }} />
  </div>
);

export const DeckSkeleton = () => (
  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <CardSkeleton />
  </div>
);

export const ProfileSkeleton = () => (
  <div style={{
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '24px', gap: '16px',
  }}>
    <div style={{ ...skeletonBase, width: '120px', height: '120px', borderRadius: '50%' }} />
    <div style={{ ...skeletonBase, width: '200px', height: '24px' }} />
    <div style={{ ...skeletonBase, width: '160px', height: '16px' }} />
    <div style={{ ...skeletonBase, width: '100%', height: '60px' }} />
    <div style={{ ...skeletonBase, width: '100%', height: '60px' }} />
  </div>
);

export const MatchListSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
        <div style={{ ...skeletonBase, width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ ...skeletonBase, width: '120px', height: '16px' }} />
          <div style={{ ...skeletonBase, width: '200px', height: '12px' }} />
        </div>
      </div>
    ))}
  </div>
);
