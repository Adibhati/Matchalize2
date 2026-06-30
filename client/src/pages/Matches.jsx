import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import NavBar from '../components/NavBar';
import { MatchListSkeleton } from '../components/Skeletons';

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchMatches = async () => {
    try {
      const data = await api.get(`/matches?page=${page}&limit=20`);
      const list = data.matches || data;
      if (page === 1) {
        setMatches(list);
      } else {
        setMatches(prev => [...prev, ...list]);
      }
      if (data.hasMore !== undefined) setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleUnmatch = async (matchId, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to unmatch with ${name}?`)) {
      try {
        await api.delete(`/matches/${matchId}`);
        setMatches(prev => prev.filter(m => m._id !== matchId));
      } catch (err) {
        alert(err.message || 'Could not unmatch');
      }
    }
  };

  // Split matches into "New Matches" (no messages exchanged yet) and "Conversations" (messages exists)
  const newMatches = matches.filter((m) => !m.lastMessage);
  const activeChats = matches.filter((m) => m.lastMessage);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: '#000000',
    }}>
      {/* Decorative Glow Elements */}
      <div className="glow-sphere" style={{ top: '20%', right: '-120px' }} />
      <div className="glow-sphere" style={{ bottom: '20%', left: '-120px' }} />

      {/* Header */}
      <header style={{
        padding: '24px 20px 12px 20px',
        zIndex: 5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', fontFamily: 'Geist, sans-serif' }}>Messages</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>Your campus connections</p>
        </div>
      </header>

      {/* Main Messages Content scrollable container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px 20px', zIndex: 10 }} className="matches-scrollable hide-scrollbar">
        {loading ? (
          <MatchListSkeleton />
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--rose)', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>⚠️ {error}</div>
        ) : matches.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70%',
            padding: '24px',
            textAlign: 'center',
            gap: '16px',
          }}>
            <span style={{ fontSize: '48px' }}>⚡️</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', fontFamily: 'Geist, sans-serif' }}>No connections yet</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: '1.5', fontFamily: 'Inter, sans-serif' }}>
              Keep swiping on classmate profiles. When they like you back, you'll see them listed here to start talking!
            </p>
            <button className="btn gradient-btn" style={{ width: 'auto', padding: '12px 24px', borderRadius: '99px', fontSize: '12px', fontFamily: 'Geist, sans-serif' }} onClick={() => navigate('/discover')}>
              START SWIPING
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* New Matches horizontal scroll */}
            {newMatches.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={sectionLabelStyle}>NEW MATCHES</h2>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', fontFamily: 'Geist, sans-serif' }}>{newMatches.length} NEW</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none' }} className="scrollbar-hide">
                  {newMatches.map((match) => {
                    const { user } = match;
                    const mainPhoto = user.photos && user.photos.length > 0 ? user.photos[0] : null;
                    return (
                      <div
                        key={match._id}
                        onClick={() => navigate(`/chat/${match._id}`)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }}
                      >
                        {/* Glowing Avatar */}
                        <div className="unread-glow" style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden' }}>
                          <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: '2px solid #000000',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            backgroundImage: mainPhoto ? `url(${mainPhoto})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {!mainPhoto && (
                              <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', fontFamily: 'Geist, sans-serif' }}>
                                {user.name.substring(0, 1).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', fontFamily: 'Geist, sans-serif' }}>
                          {user.name.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conversations list */}
            {activeChats.length > 0 && (
              <div>
                <h2 style={{ ...sectionLabelStyle, marginBottom: '12px' }}>CONVERSATIONS</h2>
                <div className="glass-card" style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '0.5px solid rgba(255,255,255,0.06)',
                }}>
                  {activeChats.map((match, idx) => {
                    const { user, lastMessage } = match;
                    const mainPhoto = user.photos && user.photos.length > 0 ? user.photos[0] : null;
                    
                    return (
                      <div
                        key={match._id}
                        onClick={() => navigate(`/chat/${match._id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px',
                          borderBottom: idx < activeChats.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
                          cursor: 'pointer',
                          gap: '14px',
                          transition: 'background-color 0.2s ease',
                          position: 'relative',
                        }}
                        className="convo-item"
                      >
                        {/* Profile Avatar */}
                        <div style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          backgroundImage: mainPhoto ? `url(${mainPhoto})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          border: '0.5px solid rgba(255,255,255,0.08)',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}>
                          {!mainPhoto && (
                            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', fontFamily: 'Geist, sans-serif' }}>
                              {user.name.substring(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Last Message and Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', fontFamily: 'Geist, sans-serif', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {user.name}
                            </h3>
                            <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
                              {formatTime(lastMessage ? lastMessage.createdAt : match.updatedAt)}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <p style={{
                              fontSize: '13px',
                              color: 'var(--text-dim)',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              marginRight: '12px',
                              fontFamily: 'Inter, sans-serif',
                            }}>
                              {lastMessage ? lastMessage.text : ''}
                            </p>
                            
                            <button
                              onClick={(e) => handleUnmatch(match._id, user.name, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.3)',
                                fontSize: '11px',
                                cursor: 'pointer',
                                padding: '4px',
                              }}
                              title="Unmatch"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Style block for hover effects */}
      <style>{`
        .convo-item:active {
          background-color: rgba(255, 255, 255, 0.04);
        }
      `}</style>

      {/* Navigation bottom bar */}
      <NavBar />
    </div>
  );
};

const sectionLabelStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: 'var(--text-dim)',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  fontFamily: 'Geist, sans-serif',
};

export default Matches;
