import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { api, SOCKET_URL } from '../utils/api';
import { triggerHaptic } from '../utils/haptics';
import SwipeCard from '../components/SwipeCard';
import NavBar from '../components/NavBar';
import { DeckSkeleton } from '../components/Skeletons';

const Discover = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('matchalize_user') || '{}'), []);
  const socketRef = useRef(null);

  const fetchDeck = async (resetSwipes = false) => {
    setLoading(true);
    setError('');
    try {
      const url = resetSwipes ? '/discover?reset=true' : '/discover';
      const data = await api.get(url);
      setUsers(data.users || data);
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      setError('Could not load classmate deck');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('matchalize_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected for notifications');
    });

    socket.on('match-notification', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'match',
        message: `You matched with ${data.name || 'a classmate'}!`,
        time: 'Just now',
        read: false,
      }, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('new-message-notification', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'message',
        message: `${data.fromName || 'Someone'}: ${data.preview || 'sent a message'}`,
        time: 'Just now',
        read: false,
      }, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleSwipe = async (direction, targetId) => {
    triggerHaptic('swipe');

    setCurrentIndex(prev => prev + 1);

    try {
      if (direction === 'right') {
        const res = await api.post(`/discover/like/${targetId}`);
        if (res.matched) {
          triggerHaptic('match');
          setMatchData({
            matchId: res.matchId,
            matchedUser: res.user,
          });
        }
      } else if (direction === 'super') {
        const res = await api.post(`/discover/superlike/${targetId}`);
        if (res.matched) {
          setMatchData({
            matchId: res.matchId,
            matchedUser: res.user,
          });
        }
      } else {
        await api.post(`/discover/pass/${targetId}`);
      }
    } catch (err) {
      console.error('Error recording swipe:', err);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Top Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px 8px 20px',
        width: '100%',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '38px',
            fontWeight: '800',
            color: 'var(--text)',
            letterSpacing: '-0.5px',
            textTransform: 'lowercase',
            margin: 0,
            lineHeight: '1',
          }}>matchalize</h1>
          <div style={{
            width: '108px',
            height: '4px',
            borderRadius: '2px',
            marginTop: '4px',
            background: 'linear-gradient(90deg, #f97316, #ea580c)',
          }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '0.5px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              padding: 0,
              position: 'relative',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                minWidth: '16px',
                height: '16px',
                borderRadius: '8px',
                background: '#f97316',
                fontSize: '9px',
                fontWeight: '700',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>
          <button
            onClick={() => navigate('/matches')}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '0.5px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Notifications Dropdown Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: '52px',
              right: '16px',
              width: '290px',
              backgroundColor: 'rgba(20, 20, 28, 0.95)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              zIndex: 150,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: 'var(--text-dim)', fontFamily: 'Geist, sans-serif' }}>NOTIFICATIONS</span>
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  setUnreadCount(0);
                }}
                style={{ background: 'none', border: 'none', color: '#fb923c', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Geist, sans-serif' }}
              >
                Mark all read
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: n.read ? 'transparent' : 'rgba(249, 115, 22, 0.04)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'rgba(249, 115, 22, 0.15)'}`,
                  fontSize: '12px',
                }}>
                  <div style={{ color: 'var(--text)', fontWeight: '500', lineHeight: '1.4' }}>{n.message}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '10px', marginTop: '4px' }}>{n.time}</div>
                </div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Main deck area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', margin: '0 8px' }}>
        {loading ? (
          <DeckSkeleton />
        ) : error ? (
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '40px', textAlign: 'center', gap: '20px' }}>
            <span style={{ fontSize: '40px' }}>⚠️</span>
            <p style={{ color: 'var(--text-dim)' }}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchDeck}>Try Again</button>
          </div>
        ) : users.length === 0 || currentIndex >= users.length ? (
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '40px', textAlign: 'center', gap: '20px' }}>
            <span style={{ fontSize: '64px' }}>🏜️</span>
            <h3 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'Geist, sans-serif' }}>That's everyone!</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: '1.5', fontFamily: 'Inter, sans-serif' }}>
              You've swiped on all currently onboarded classmates. Check back later or tell your campus friends to join!
            </p>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => fetchDeck(true)}>Refresh Deck</button>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {users.slice(currentIndex, currentIndex + 2).reverse().map((user, idx) => {
              const sliceLen = users.slice(currentIndex, currentIndex + 2).length;
              const absoluteIndex = currentIndex + (sliceLen - 1 - idx);
              const isActive = absoluteIndex === currentIndex;
              return (
                <SwipeCard
                  key={`${user._id}-${absoluteIndex}`}
                  user={user}
                  onSwipe={handleSwipe}
                  active={isActive}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation bottom bar */}
      <NavBar />

      {/* Match Overlay Modal */}
      <AnimatePresence>
        {matchData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(6,6,8,0.95)',
              backdropFilter: 'blur(30px)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '60px 24px 40px 24px',
              alignItems: 'center',
            }}
          >
            <div />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
              <motion.h1
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                style={{
                  fontSize: '40px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  fontFamily: 'Geist, sans-serif',
                }}
              >
                IT'S A MATCH!
              </motion.h1>

              <p style={{ color: 'var(--text-dim)', fontSize: '16px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                You and {matchData.matchedUser.name} have liked each other.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '40px 0', position: 'relative' }}>
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: '3px solid #f97316',
                  boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)',
                  backgroundImage: currentUser.photos && currentUser.photos.length > 0 ? `url(${currentUser.photos[0]})` : 'none',
                  backgroundColor: 'var(--surface-2)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />

                <div style={{ position: 'absolute', zIndex: 10, animation: 'heartbeat 1.2s infinite' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#f97316" stroke="#ea580c" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>

                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: '3px solid #f97316',
                  boxShadow: '0 0 30px rgba(234, 88, 12, 0.3)',
                  backgroundImage: matchData.matchedUser.photos && matchData.matchedUser.photos.length > 0 ? `url(${matchData.matchedUser.photos[0]})` : 'none',
                  backgroundColor: 'var(--surface-2)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const id = matchData.matchId;
                  setMatchData(null);
                  navigate(`/chat/${id}`);
                }}
              >
                Send a Message
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setMatchData(null)}
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Discover;
