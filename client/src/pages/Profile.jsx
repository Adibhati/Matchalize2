import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAppConfig } from '../utils/AppConfigContext';
import NavBar from '../components/NavBar';
import SwipeCard from '../components/SwipeCard';
import { ProfileSkeleton } from '../components/Skeletons';

const Profile = () => {
  const config = useAppConfig();
  const INTEREST_TAGS = config.interests;
  const PROMPT_BANK = config.prompts;
  const BRANCHES = config.branches;
  const YEARS = config.years;
  const MAX_INTERESTS = config.constants.MAX_INTERESTS;

  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Editable fields
  const [bio, setBio] = useState('');
  const [hostel, setHostel] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [prompts, setPrompts] = useState([
    { question: PROMPT_BANK[0], answer: '' },
    { question: PROMPT_BANK[1], answer: '' },
    { question: PROMPT_BANK[2], answer: '' }
  ]);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/users/profile');
      setProfile(data);
      
      // Initialize edit fields
      setBio(data.bio || '');
      setHostel(data.hostel || '');
      setBranch(data.branch || '');
      setYear(data.year || '');
      setSelectedInterests(data.interests || []);
      
      // If prompts exist, map them, otherwise initialize defaults
      if (data.prompts && data.prompts.length > 0) {
        // Pad to ensure at least 3 prompts are visible/editable
        const pList = [...data.prompts];
        while (pList.length < 3) {
          pList.push({ question: PROMPT_BANK[pList.length], answer: '' });
        }
        setPrompts(pList);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve profile info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInterestToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < MAX_INTERESTS) {
        setSelectedInterests(prev => [...prev, interest]);
      }
    }
  };

  const handlePromptChange = (idx, key, val) => {
    setPrompts(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: val };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    // Filter prompts containing responses
    const filteredPrompts = prompts.filter(p => p.answer.trim() !== '');

    try {
      const updated = await api.put('/users/profile', {
        bio,
        hostel,
        branch,
        year,
        interests: selectedInterests,
        prompts: filteredPrompts
      });
      setProfile(updated);
      localStorage.setItem('matchalize_user', JSON.stringify(updated));
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <ProfileSkeleton />
        <NavBar />
      </div>
    );
  }

  const hasPhoto = profile?.photos && profile.photos.length > 0;

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
            fontSize: '34px',
            fontWeight: '800',
            color: 'var(--text)',
            letterSpacing: '-0.5px',
            textTransform: 'lowercase',
            margin: 0,
            lineHeight: '1',
          }}>your profile</h1>
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
            className="btn"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            style={{
              width: 'auto',
              padding: '8px 16px',
              fontSize: '13px',
              backgroundColor: isEditing ? 'var(--primary-glow)' : 'var(--surface-2)',
              border: `1px solid ${isEditing ? 'var(--primary)' : 'var(--border)'}`,
              color: isEditing ? 'var(--primary)' : 'var(--text)',
            }}
          >
            {saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
          </button>
          {!isEditing && (
            <button
              onClick={() => navigate('/settings')}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          )}
        </div>
      </header>

      {isEditing ? (
        /* EDIT PROFILE VIEW */
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 96px 20px' }} className="profile-scrollable">
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.2)', color: 'var(--rose)', fontSize: '14.4px', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Bio Field */}
            <div>
              <label>About Me / Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={4}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  color: 'var(--text)',
                  padding: '12px 16px',
                  fontSize: '14.4px',
                  fontFamily: 'inherit',
                  resize: 'none',
                }}
              />
            </div>

            {/* Hostel Residence Field */}
            <div>
              <label>Hostel / Residence Hall</label>
              <input
                type="text"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                placeholder="e.g. Alien Hall, Hostel 4"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  color: 'var(--text)',
                  padding: '12px 16px',
                  fontSize: '14.4px',
                }}
              />
            </div>

            {/* Branch & Year Fields */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label>Branch of Study</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    color: 'var(--text)',
                    padding: '12px 16px',
                    fontSize: '14.4px',
                  }}
                >
                  <option value="" style={{ backgroundColor: '#000000' }}>Select Branch</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b} style={{ backgroundColor: '#000000' }}>{b}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Year of Study</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    color: 'var(--text)',
                    padding: '12px 16px',
                    fontSize: '14.4px',
                  }}
                >
                  <option value="" style={{ backgroundColor: '#000000' }}>Select Year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y} style={{ backgroundColor: '#000000' }}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prompts Section */}
            <div>
              <label>Profile Prompts</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {prompts.map((p, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '16px',
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                      {p.question}
                    </span>
                    <input
                      type="text"
                      value={p.answer}
                      onChange={(e) => {
                        const updated = [...prompts];
                        updated[idx].answer = e.target.value;
                        setPrompts(updated);
                      }}
                      placeholder="Write your answer..."
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        color: 'var(--text)',
                        padding: '10px 14px',
                        fontSize: '14.4px',
                        marginTop: '6px',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Interests Section */}
            <div>
              <label>Interests / Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {INTEREST_TAGS.map((tag) => {
                  const active = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (active) {
                          setSelectedInterests(prev => prev.filter(t => t !== tag));
                        } else {
                          setSelectedInterests(prev => [...prev, tag]);
                        }
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '99px',
                        fontSize: '12.4px',
                        backgroundColor: active ? 'var(--primary-glow)' : 'var(--surface-2)',
                        border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                        color: active ? 'var(--primary)' : 'var(--text)',
                        cursor: 'pointer',
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave}>
              Save Profile Changes
            </button>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* READ-ONLY VIEW (Preview mode matches Discover deck exactly) */
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', paddingBottom: '60px' }}>
          <SwipeCard
            user={profile}
            active={true}
            onSwipe={() => {}}
            dragEnabled={false}
          />
        </div>
      )}

      {/* Navigation bottom bar */}
      <NavBar />
    </div>
  );
};

export default Profile;
