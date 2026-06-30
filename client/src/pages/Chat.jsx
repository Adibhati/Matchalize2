import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api, SOCKET_URL } from '../utils/api';

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [matchInfo, setMatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('matchalize_user') || '{}');

  const fetchMatchDetails = async () => {
    try {
      const activeMatches = await api.get('/matches');
      const currentMatch = activeMatches.find((m) => m._id === matchId);
      if (currentMatch) {
        setMatchInfo(currentMatch.user);
      }
    } catch (err) {
      console.error('Error fetching match details:', err);
    }
  };

  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  const fetchMessages = async (isInitial = false) => {
    try {
      const res = await api.get(`/messages/${matchId}?page=${isInitial ? 1 : page}&limit=50`);
      const history = res.messages || res;
      if (isInitial || page === 1) {
        setMessages(history);
      } else {
        setMessages(prev => [...history, ...prev]);
      }
      if (res.hasMore !== undefined) setHasMoreMessages(res.hasMore);
      if (isInitial) {
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    fetchMatchDetails();
    fetchMessages(true);

    const token = localStorage.getItem('matchalize_token');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join-match', matchId);
    });

    socket.on('new-message', (message) => {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('typing', ({ userId, name }) => {
      if (userId !== currentUser._id) {
        setTypingUsers(new Set([name]));
      }
    });

    socket.on('stop-typing', ({ userId }) => {
      if (userId !== currentUser._id) {
        setTypingUsers(new Set());
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    const tempId = Date.now().toString();
    const optimisticMessage = {
      _id: tempId,
      sender: currentUser._id,
      text: messageText,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const sentMessage = await api.post(`/messages/${matchId}`, { text: messageText });
      setMessages((prev) => 
        prev.map((msg) => (msg._id === tempId ? sentMessage : msg))
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: '#000000',
    }}>
      {/* Glow Atmosphere Spheres */}
      <div className="glow-sphere" style={{ top: '-100px', left: '-100px' }} />
      <div className="glow-sphere" style={{ bottom: '-100px', right: '-100px' }} />

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px 8px 20px',
        width: '100%',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {matchInfo && (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundImage: matchInfo.photos?.[0] ? `url(${matchInfo.photos[0]})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {!matchInfo.photos?.[0] && (
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#f97316' }}>
                  {matchInfo.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '34px',
              fontWeight: '800',
              color: 'var(--text)',
              letterSpacing: '-0.5px',
              textTransform: 'lowercase',
              margin: 0,
              lineHeight: '1',
            }}>
              {matchInfo ? matchInfo.name.split(' ')[0] : 'Chat'}
            </h1>
            <div style={{
              width: '108px',
              height: '4px',
              borderRadius: '2px',
              marginTop: '4px',
              background: 'linear-gradient(90deg, #f97316, #ea580c)',
            }} />
            <span style={{
              fontSize: '11px',
              color: 'var(--text-dim)',
              fontFamily: 'Inter, sans-serif',
              marginTop: '4px',
            }}>
              {matchInfo?.branch ? `${matchInfo.branch} · ${matchInfo.year || ''}` : 'Your match'}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/matches')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '0.5px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </header>

      {/* Messages area */}
      <div 
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 10,
        }}
        className="chat-messages hide-scrollbar"
      >
        {loading ? (
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            alignSelf: 'stretch',
            color: 'var(--text-dim)',
            fontSize: '14px',
            textAlign: 'center',
            gap: '10px',
            padding: '24px',
          }}>
            <span style={{ fontSize: '36px' }}>👋</span>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', fontFamily: 'Geist, sans-serif' }}>Say Hello!</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'Inter, sans-serif' }}>Break the ice by asking about their branch or prompts.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === currentUser._id;
            return (
              <div
                key={msg._id}
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                <div
                  className={isMe ? '' : 'glass-card'}
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    backgroundColor: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                    boxShadow: isMe ? '0 4px 15px rgba(249,115,22,0.25)' : 'none',
                    border: isMe ? 'none' : '0.5px solid rgba(255,255,255,0.06)',
                    color: isMe ? '#ffffff' : 'rgba(255,255,255,0.9)',
                    fontSize: '15px',
                    fontWeight: '500',
                    lineHeight: '1.45',
                    wordBreak: 'break-word',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
)}
                {typingUsers.size > 0 && (
                  <div style={{
                    padding: '8px 20px',
                    color: 'var(--text-dim)',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    fontFamily: 'Inter, sans-serif',
                    opacity: 0.8,
                  }}>
                    {Array.from(typingUsers).join(', ')} typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
      </div>

      {/* Input tray */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '16px 20px',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          borderTop: '0.5px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: '12px',
          backgroundColor: '#000000',
          zIndex: 100,
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              // Emit typing event
              if (socketRef.current?.connected) {
                socketRef.current.emit('typing', matchId);
              }
              // Clear existing timeout
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              // Stop typing after 2 seconds of inactivity
              typingTimeoutRef.current = setTimeout(() => {
                if (socketRef.current?.connected) {
                  socketRef.current.emit('stop-typing', matchId);
                }
              }, 2000);
            }}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: '20px',
              padding: '10px 16px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          className="gradient-btn"
          disabled={!inputText.trim() || sending}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'default',
            opacity: inputText.trim() ? 1 : 0.4,
            transition: 'all 0.25s ease',
            flexShrink: 0,
            boxShadow: 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ffffff', fontVariationSettings: "'FILL' 1" }}>send</span>
        </button>
      </form>
    </div>
  );
};

export default Chat;
