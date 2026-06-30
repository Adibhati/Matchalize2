import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAppConfig } from '../utils/AppConfigContext';
import NavBar from '../components/NavBar';

const Settings = () => {
  const config = useAppConfig();
  const GENDERS = config.genders;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Settings values
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(30);
  const [interestedIn, setInterestedIn] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('matchalize_user') || '{}');
    if (user) {
      setAgeMin(user.ageRange?.min || 18);
      setAgeMax(user.ageRange?.max || 30);
      setInterestedIn(user.interestedIn || []);
    }
  }, []);

  const handleGenderToggle = (gender) => {
    if (interestedIn.includes(gender)) {
      setInterestedIn(prev => prev.filter(g => g !== gender));
    } else {
      setInterestedIn(prev => [...prev, gender]);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const updated = await api.put('/users/profile', {
        ageRange: { min: ageMin, max: ageMax },
        interestedIn: interestedIn,
      });
      localStorage.setItem('matchalize_user', JSON.stringify(updated));
      alert('Preferences saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('matchalize_token');
      localStorage.removeItem('matchalize_user');
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete your Matchalize account? All matches and messages will be lost forever.')) {
      if (window.confirm('Please confirm one last time. This cannot be undone.')) {
        setLoading(true);
        try {
          await api.delete('/users/account');
          localStorage.removeItem('matchalize_token');
          localStorage.removeItem('matchalize_user');
          navigate('/');
        } catch (err) {
          setError(err.message || 'Failed to delete account');
          setLoading(false);
        }
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Header */}
      <header style={{
        padding: '20px 24px 10px 24px',
        borderBottom: '1px solid var(--border)',
        zIndex: 5,
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Settings</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '2px' }}>Customize your match filters.</p>
      </header>

      {/* Main Settings content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 96px 20px' }} className="settings-scrollable">
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.2)', color: 'var(--rose)', fontSize: '14px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Match Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Discovery Filters
            </h3>

            {/* Age Range Slider inputs */}
            <div>
              <label>Age Range ({ageMin} - {ageMax})</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="18"
                  max="40"
                  value={ageMin}
                  onChange={(e) => setAgeMin(Math.min(parseInt(e.target.value) || 18, ageMax))}
                  style={{ width: '80px', textAlign: 'center', padding: '8px' }}
                />
                <span style={{ color: 'var(--text-dim)' }}>to</span>
                <input
                  type="number"
                  min="18"
                  max="40"
                  value={ageMax}
                  onChange={(e) => setAgeMax(Math.max(parseInt(e.target.value) || 30, ageMin))}
                  style={{ width: '80px', textAlign: 'center', padding: '8px' }}
                />
              </div>
            </div>

            {/* Gender preferences */}
            <div>
              <label style={{ marginBottom: '10px' }}>Show Me</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {GENDERS.map((g) => {
                  const active = interestedIn.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => handleGenderToggle(g)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: active ? 'var(--surface-3)' : 'var(--surface-2)',
                        border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                        color: active ? 'var(--gold)' : 'var(--text)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{g}</span>
                      {active && <span style={{ color: 'var(--gold)' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSaveSettings} disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Saving...' : 'Save Filters'}
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Account Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Account
            </h3>

            <button className="btn btn-secondary" onClick={handleLogout} style={{ justifyContent: 'center' }}>
              🚪 Log Out
            </button>
            
            <button 
              className="btn" 
              onClick={handleDeleteAccount}
              disabled={loading}
              style={{
                justifyContent: 'center',
                backgroundColor: 'rgba(234, 88, 12, 0.05)',
                border: '1px solid rgba(234, 88, 12, 0.2)',
                color: 'var(--rose)',
              }}
            >
              ⚠️ Delete Account
            </button>
          </div>

        </div>
      </div>

      {/* Navigation bottom bar */}
      <NavBar />
    </div>
  );
};

export default Settings;
