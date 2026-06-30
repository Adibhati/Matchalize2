import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api, SOCKET_URL } from '../utils/api';

import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import InputTray from '../components/chat/InputTray';
import EmojiPicker from '../components/chat/EmojiPicker';
import ProfileSheet from '../components/chat/ProfileSheet';
import PhotoViewer from '../components/chat/PhotoViewer';
import AttachMenu from '../components/chat/AttachMenu';
import DateSeparator from '../components/chat/DateSeparator';
import TypingIndicator from '../components/chat/TypingIndicator';
import ScrollToBottom from '../components/chat/ScrollToBottom';
import { ActionMenu, ReactPicker } from '../components/chat/ActionMenu';

const ICEBREAKERS = [
  "What's your branch? How do you like it so far?",
  "Best chai spot on campus?",
  "What's the most interesting thing you've learned this semester?",
  "Favourite way to procrastinate before exams?",
  "What's your 3 AM scroll-of-shame content?",
];

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [matchInfo, setMatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [photoViewerUrl, setPhotoViewerUrl] = useState(null);

  const [replyTo, setReplyTo] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [reactPicker, setReactPicker] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const isPaginationLoad = useRef(false);
  const scrollRafRef = useRef(null);

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('matchalize_user') || '{}'), []);

  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    }, 50);
  }, []);

  const fetchMatchDetails = async () => {
    try {
      const activeMatches = await api.get('/matches');
      const currentMatch = activeMatches.find((m) => m._id === matchId);
      if (currentMatch) setMatchInfo(currentMatch.user);
    } catch (err) {
      console.error('Error fetching match details:', err);
    }
  };

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
      if (isInitial) scrollToBottom(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
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

    socket.on('messages-read', () => {
      setMessages(prev => prev.map(msg => {
        if (msg.sender === currentUser._id && !msg.readAt) {
          return { ...msg, readAt: new Date().toISOString() };
        }
        return msg;
      }));
    });

    socket.on('reaction-update', ({ msgId, reactions }) => {
      setMessages(prev => prev.map(msg =>
        msg._id === msgId ? { ...msg, reactions } : msg
      ));
    });

    socket.on('message-deleted', ({ msgId }) => {
      setMessages(prev => prev.map(msg =>
        msg._id === msgId ? { ...msg, deleted: true, text: '', image: '' } : msg
      ));
    });

    socket.on('online-update', ({ userId: uid, online, lastActive: la }) => {
      if (uid !== currentUser._id) {
        setIsOnline(online);
        setLastActive(la);
      }
    });

    socket.on('online-status', ({ userId: uid, online, lastActive: la }) => {
      if (uid !== currentUser._id) {
        setIsOnline(online);
        setLastActive(la);
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [matchId]);

  useEffect(() => {
    if (!isPaginationLoad.current) {
      scrollToBottom(messages.length <= 10);
    }
    isPaginationLoad.current = false;
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom(false);
  }, [loading]);

  const handleScroll = useCallback(() => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      const el = messagesContainerRef.current;
      if (!el) { scrollRafRef.current = null; return; }
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distanceFromBottom > 200);
      if (el.scrollTop < 50 && hasMoreMessages && !loading) {
        isPaginationLoad.current = true;
        setPage(prev => prev + 1);
      }
      scrollRafRef.current = null;
    });
  }, [hasMoreMessages, loading]);

  useEffect(() => {
    if (page > 1) fetchMessages(false);
  }, [page]);

  const markAsRead = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('read-messages', { matchId });
    }
  }, [matchId]);

  useEffect(() => {
    markAsRead();
  }, [messages.length, markAsRead]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const optimisticMessage = {
      _id: tempId, sender: currentUser._id, text: messageText,
      createdAt: new Date().toISOString(), _pending: true, reactions: [],
      type: 'text', replyTo: replyTo ? {
        _id: replyTo._id, text: replyTo.text, sender: currentUser._id,
        type: replyTo.type, image: replyTo.image,
      } : null,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    const currentReply = replyTo;
    setReplyTo(null);

    try {
      const body = { text: messageText };
      if (currentReply) body.replyTo = currentReply._id;
      const sentMessage = await api.post(`/messages/${matchId}`, body);

      setMessages(prev => {
        const alreadyAdded = prev.some(m => m._id === sentMessage._id);
        if (alreadyAdded) return prev.filter(m => m._id !== tempId);
        return prev.map(msg => msg._id === tempId ? sentMessage : msg);
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async (file) => {
    setSending(true);
    try {
      const uploadRes = await api.upload(file);
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const optimisticMessage = {
        _id: tempId, sender: currentUser._id, text: '',
        image: uploadRes.url, type: 'image',
        createdAt: new Date().toISOString(), _pending: true, reactions: [],
      };
      setMessages(prev => [...prev, optimisticMessage]);

      const sentMessage = await api.post(`/messages/${matchId}`, {
        type: 'image', image: uploadRes.url,
      });

      setMessages(prev => {
        const alreadyAdded = prev.some(m => m._id === sentMessage._id);
        if (alreadyAdded) return prev.filter(m => m._id !== tempId);
        return prev.map(msg => msg._id === tempId ? sentMessage : msg);
      });
    } catch (err) {
      console.error('Failed to send image:', err);
    } finally {
      setSending(false);
    }
  };

  const handleReact = async (msgId, emoji) => {
    try {
      await api.post(`/messages/${matchId}/reaction`, { msgId, emoji });
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await api.delete(`/messages/${matchId}/${msgId}`);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleLongPress = useCallback((msg) => {
    setActionMenu({ msg, position: { x: 100, y: window.innerHeight / 2 } });
  }, []);

  const handleAction = (actionId, msg) => {
    setActionMenu(null);
    switch (actionId) {
      case 'copy':
        navigator.clipboard?.writeText(msg.text || '');
        break;
      case 'reply':
        setReplyTo({
          _id: msg._id, text: msg.text, type: msg.type,
          image: msg.image, senderName: msg.sender === currentUser._id ? 'You' : (matchInfo?.name?.split(' ')[0] || 'Partner'),
        });
        break;
      case 'react':
        setReactPicker({ msgId: msg._id });
        break;
      case 'delete':
        handleDelete(msg._id);
        break;
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInputText(prev => prev + emoji);
  };

  const handleUnmatch = async () => {
    if (window.confirm('Are you sure you want to unmatch? This cannot be undone.')) {
      try {
        await api.delete(`/matches/${matchId}`);
        navigate('/matches');
      } catch (err) {
        console.error('Unmatch failed:', err);
      }
    }
  };

  const renderMessages = useMemo(() => {
    const elements = [];

    messages.forEach((msg, idx) => {
      const prevMsg = idx > 0 ? messages[idx - 1] : null;
      const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
      const isMe = msg.sender === currentUser._id;

      const showDate = !prevMsg ||
        new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
      if (showDate) {
        elements.push(<DateSeparator key={`date-${msg._id}`} dateStr={msg.createdAt} />);
      }

      const grouped = prevMsg &&
        msg.sender === prevMsg.sender &&
        (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) < 60000 &&
        !showDate;
      const groupStart = !grouped;
      const groupEnd = !nextMsg || nextMsg.sender !== msg.sender ||
        (new Date(nextMsg.createdAt) - new Date(msg.createdAt)) > 60000;

      elements.push(
        <MessageBubble
          key={msg._id}
          msg={msg}
          isMe={isMe}
          isGrouped={grouped}
          isGroupStart={groupStart}
          isGroupEnd={groupEnd}
          currentUserId={currentUser._id}
          onLongPress={handleLongPress}
          onImageTap={setPhotoViewerUrl}
        />
      );
    });

    return elements;
  }, [messages, currentUser._id, handleLongPress]);

  return (
    <div style={{
      height: '100dvh',
      display: 'flex', flexDirection: 'column',
      backgroundColor: '#000', overflow: 'hidden',
    }}>
      <ChatHeader
        matchInfo={matchInfo}
        isOnline={isOnline}
        lastActive={lastActive}
        onBack={() => navigate('/matches')}
        onViewProfile={() => setShowProfile(true)}
        onUnmatch={handleUnmatch}
      />

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1, minHeight: 0, overflowY: 'auto',
          padding: '0 12px 16px',
          display: 'flex', flexDirection: 'column',
        }}
        className="hide-scrollbar"
      >
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.08)',
              borderTopColor: '#f97316',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', gap: '16px', padding: '24px',
          }}>
            {matchInfo && (
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                backgroundImage: matchInfo.photos?.[0] ? `url(${matchInfo.photos[0]})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(249,115,22,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!matchInfo.photos?.[0] && (
                  <span style={{ fontSize: '28px', fontWeight: '700', color: '#f97316' }}>
                    {matchInfo.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            )}
            <div>
              <h3 style={{
                fontSize: '18px', fontWeight: '700', color: '#fff',
                fontFamily: 'Inter, sans-serif', margin: '0 0 4px',
              }}>
                You matched with {matchInfo?.name?.split(' ')[0] || 'them'}!
              </h3>
              <p style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.4)',
                fontFamily: 'Inter, sans-serif', margin: 0, lineHeight: 1.5,
              }}>
                Start a conversation — say something about their prompts or interests.
              </p>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '8px',
              width: '100%', maxWidth: '320px', marginTop: '4px',
            }}>
              <span style={{
                fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.25)',
                fontFamily: 'Inter, sans-serif', textTransform: 'uppercase',
                letterSpacing: '0.08em', textAlign: 'left',
              }}>
                Ice breakers
              </span>
              {ICEBREAKERS.map((text, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(text)}
                  style={{
                    padding: '10px 14px', borderRadius: '12px',
                    border: '1px solid rgba(249,115,22,0.2)',
                    background: 'rgba(249,115,22,0.06)',
                    color: '#f97316', fontSize: '13px', fontWeight: '500',
                    fontFamily: 'Inter, sans-serif', textAlign: 'left',
                    cursor: 'pointer', lineHeight: 1.4, transition: 'all 0.15s ease',
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {renderMessages}
            {typingUsers.size > 0 && <TypingIndicator />}
            <div ref={messagesEndRef} style={{ flexShrink: 0, height: '1px' }} />
          </>
        )}
      </div>

      <ScrollToBottom
        visible={showScrollBtn}
        onClick={() => { scrollToBottom(true); setShowScrollBtn(false); }}
      />

      <InputTray
        inputText={inputText}
        setInputText={setInputText}
        onSend={handleSend}
        onEmojiToggle={() => setShowEmoji(!showEmoji)}
        onAttach={() => setShowAttach(true)}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        sending={sending}
        loading={loading}
      />

      {showEmoji && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmoji(false)}
        />
      )}

      {showProfile && (
        <ProfileSheet
          matchInfo={matchInfo}
          onClose={() => setShowProfile(false)}
        />
      )}

      {photoViewerUrl && (
        <PhotoViewer
          imageUrl={photoViewerUrl}
          onClose={() => setPhotoViewerUrl(null)}
        />
      )}

      {showAttach && (
        <AttachMenu
          onSelect={handleSendImage}
          onClose={() => setShowAttach(false)}
        />
      )}

      {actionMenu && (
        <ActionMenu
          msg={actionMenu.msg}
          position={actionMenu.position}
          isMe={actionMenu.msg.sender === currentUser._id}
          onAction={handleAction}
          onClose={() => setActionMenu(null)}
        />
      )}

      {reactPicker && (
        <ReactPicker
          onSelect={(emoji) => handleReact(reactPicker.msgId, emoji)}
          onClose={() => setReactPicker(null)}
        />
      )}
    </div>
  );
};

export default Chat;
