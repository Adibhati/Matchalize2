import React, { useState, useRef, useCallback, useMemo } from 'react';

const S = {
  row: {
    display: 'flex',
    paddingLeft: '4px', paddingRight: '4px',
  },
  bubbleWrap: {
    maxWidth: '78%', minWidth: '60px', position: 'relative',
  },
  bubble: {
    padding: '10px 14px',
    fontSize: '14px', fontWeight: '400', lineHeight: '1.45',
    wordBreak: 'break-word', fontFamily: 'Inter, sans-serif',
  },
  glassBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#f6ded3',
  },
  orangeBubble: {
    backgroundColor: '#f97316',
    color: '#fff',
    border: 'none',
    boxShadow: '0 2px 12px rgba(249,115,22,0.15)',
  },
  tail: {
    display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
    gap: '3px', marginTop: '3px',
  },
  time: {
    fontSize: '10px', fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.02em', fontWeight: 500,
  },
  replyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderLeft: '2px solid #f97316',
    borderRadius: '6px', padding: '6px 8px',
    marginBottom: '6px',
  },
  replyName: {
    fontSize: '11px', fontWeight: '600', color: '#f97316',
    fontFamily: 'Inter, sans-serif', marginBottom: '2px',
  },
  replyText: {
    fontSize: '12px', color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  reactionBadge: {
    position: 'absolute', bottom: '-6px',
    width: '24px', height: '24px', borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  image: {
    width: '100%', borderRadius: '12px',
    objectFit: 'cover', display: 'block',
  },
  deleted: {
    fontSize: '13px', fontStyle: 'italic',
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Inter, sans-serif',
  },
};

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

const MessageBubble = ({
  msg, isMe, isGrouped, isGroupEnd, isGroupStart,
  currentUserId, onLongPress, onImageTap,
}) => {
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef(null);
  const isDeleted = msg.deleted;
  const isImage = msg.type === 'image' && msg.image;
  const hasReply = msg.replyTo && !msg.replyTo.deleted;

  const formattedTime = useMemo(() => formatTime(msg.createdAt), [msg.createdAt]);

  const handlePointerDown = useCallback((e) => {
    longPressTimer.current = setTimeout(() => {
      setShowActions(true);
      onLongPress?.(msg);
    }, 500);
  }, [msg, onLongPress]);

  const handlePointerUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  const handlePointerLeave = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  const borderRadius = isMe
    ? (isGroupStart ? '18px 18px 4px 18px' : isGroupEnd ? '18px 4px 18px 18px' : '18px 4px 4px 18px')
    : (isGroupStart ? '18px 18px 18px 4px' : isGroupEnd ? '4px 18px 18px 18px' : '4px 18px 4px 18px');

  return (
    <div style={{
      ...S.row,
      justifyContent: isMe ? 'flex-end' : 'flex-start',
      paddingTop: isGrouped ? '2px' : '10px',
    }}>
      <div style={{ ...S.bubbleWrap, borderRadius }}>
        <div
          style={{
            ...S.bubble,
            ...(isMe ? S.orangeBubble : S.glassBubble),
            borderRadius,
            padding: isImage ? '4px' : '10px 14px',
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          {isDeleted ? (
            <span style={S.deleted}>This message was deleted</span>
          ) : (
            <>
              {hasReply && (
                <div style={S.replyCard}>
                  <div style={S.replyName}>
                    {msg.replyTo.sender === currentUserId ? 'You' : matchName(msg.replyTo)}
                  </div>
                  <div style={S.replyText}>
                    {msg.replyTo.type === 'image' ? '📷 Photo' : (msg.replyTo.text || '')}
                  </div>
                </div>
              )}

              {isImage && (
                <img
                  src={msg.image}
                  alt="shared"
                  style={S.image}
                  onClick={() => onImageTap?.(msg.image)}
                  loading="lazy"
                />
              )}

              {msg.text && (
                <span style={{ display: isImage ? 'block' : 'inline', padding: isImage ? '8px 4px 2px' : 0 }}>
                  {msg.text}
                </span>
              )}
            </>
          )}
        </div>

        {msg.reactions?.length > 0 && (
          <div style={{
            ...S.reactionBadge,
            [isMe ? 'left' : 'right']: '-4px',
          }}>
            {msg.reactions[0].emoji}
          </div>
        )}

        {isGroupEnd && (
          <div style={S.tail}>
            <span style={{
              ...S.time,
              color: isMe ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
            }}>
              {formattedTime}
            </span>
            {isMe && (
              <span style={{
                fontSize: '13px', lineHeight: 1,
                color: msg.readAt ? '#53bdeb' : 'rgba(255,255,255,0.4)',
              }}>
                {msg.readAt ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function matchName(replyTo) {
  if (replyTo.sender?.name) return replyTo.sender.name.split(' ')[0];
  return 'Partner';
}

export default React.memo(MessageBubble);
