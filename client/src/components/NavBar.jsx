import React from 'react';
import { NavLink } from 'react-router-dom';

const ChatIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--text-dim)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const DiscoverIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--text-dim)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--text-dim)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const NavBar = () => {
  return (
    <nav className="glass-panel" style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid var(--border)',
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      paddingBottom: 'env(safe-area-inset-bottom, 2px)',
      zIndex: 100,
    }}>
      {/* 1. Chat (Left) */}
      <NavLink
        to="/matches"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        style={navLinkStyle}
      >
        {({ isActive }) => (
          <>
            <ChatIcon active={isActive} />
            <span style={labelStyle}>Chat</span>
          </>
        )}
      </NavLink>

      {/* 2. Discover (Center) */}
      <NavLink
        to="/discover"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        style={navLinkStyle}
      >
        {({ isActive }) => (
          <>
            <DiscoverIcon active={isActive} />
            <span style={labelStyle}>Discover</span>
          </>
        )}
      </NavLink>

      {/* 3. Profile (Right) */}
      <NavLink
        to="/profile"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        style={navLinkStyle}
      >
        {({ isActive }) => (
          <>
            <ProfileIcon active={isActive} />
            <span style={labelStyle}>Profile</span>
          </>
        )}
      </NavLink>

      <style>{`
        .nav-item {
          color: var(--text-dim);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .nav-item.active {
          color: var(--primary) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </nav>
  );
};

const navLinkStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  height: '100%',
  gap: '2px',
};

const labelStyle = {
  fontSize: '10px',
  fontWeight: '500',
  letterSpacing: '0.5px',
};

export default NavBar;
