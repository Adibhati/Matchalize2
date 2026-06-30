import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useAppConfig } from '../utils/AppConfigContext';


const Onboarding = () => {
  const config = useAppConfig();
  const {
    prompts: PROMPT_BANK,
    branches: BRANCHES,
    years: YEARS,
    genders: GENDERS,
    intents: INTENTS,
    interests: INTEREST_TAGS,
    pronouns: PRONOUNS_OPTIONS,
    interestIcons: INTEREST_ICONS,
    interestIconFallbacks: INTEREST_ICON_FALLBACKS,
    constants: APP_CONSTANTS,
  } = config;

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dob: '',
    gender: '',
    pronouns: '',
    branch: '',
    year: '',
    hostel: '',
    bio: '',
    prompts: [
      ...PROMPT_BANK.sort(() => 0.5 - Math.random()).slice(0, 5).map((q) => ({ question: q, answer: '' })),
    ],
    photos: ['', '', '', ''], // inputs for URLs
    intent: [],
    interestedIn: [], // array of genders
    interests: [], // array of strings
  });

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const updatePrompt = (idx, field, val) => {
    const updated = [...formData.prompts];
    updated[idx] = { ...updated[idx], [field]: val };
    updateField('prompts', updated);
  };

  const handleInterestToggle = (interest) => {
    const current = [...formData.interests];
    if (current.includes(interest)) {
      updateField('interests', current.filter((i) => i !== interest));
    } else {
      if (current.length < APP_CONSTANTS.MAX_INTERESTS) {
        updateField('interests', [...current, interest]);
      }
    }
  };

  const handleGenderInterestToggle = (gender) => {
    const current = [...formData.interestedIn];
    if (current.includes(gender)) {
      updateField('interestedIn', current.filter((g) => g !== gender));
    } else {
      updateField('interestedIn', [...current, gender]);
    }
  };

  const getInterestIcon = (tag) => {
    const icon = INTEREST_ICONS[tag.toLowerCase()];
    if (icon) return icon;
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = ((hash << 5) - hash) + tag.charCodeAt(i);
    return INTEREST_ICON_FALLBACKS[Math.abs(hash) % INTEREST_ICON_FALLBACKS.length];
  };

  const handleImageUpload = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    try {
      const data = await api.upload(file);
      const updated = [...formData.photos];
      updated[idx] = data.url;
      updateField('photos', updated);
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
    }
  };

  const handleClearImage = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = [...formData.photos];
    updated[idx] = '';
    updateField('photos', updated);
  };

  const handleIntentToggle = (intentVal) => {
    const current = [...formData.intent];
    if (current.includes(intentVal)) {
      updateField('intent', current.filter((i) => i !== intentVal));
    } else {
      updateField('intent', [...current, intentVal]);
    }
  };

  const nextStep = () => {
    setError('');
    // Step validation checks
    if (step === 1 && (!formData.name || !formData.age)) {
      setError('Please enter your name and age');
      return;
    }
    if (step === 1 && (formData.age < APP_CONSTANTS.MIN_AGE || formData.age > APP_CONSTANTS.MAX_AGE)) {
      setError(`Age must be between ${APP_CONSTANTS.MIN_AGE} and ${APP_CONSTANTS.MAX_AGE}`);
      return;
    }
    if (step === 2 && !formData.gender) {
      setError('Please select your gender identity');
      return;
    }
    if (step === 3 && (!formData.branch || !formData.year)) {
      setError('Please enter your branch and year');
      return;
    }
    if (step === 4) {
      const activePhotos = formData.photos.filter((url) => url.trim() !== '');
      if (activePhotos.length === 0) {
        setError('Please upload at least one photo to continue');
        return;
      }
    }
    if (step === 5) {
      const activePrompts = formData.prompts.filter(p => p.answer.trim() !== '');
      if (activePrompts.length === 0) {
        setError('Please answer at least one prompt question');
        return;
      }
      if (activePrompts.length < 3) {
        setError('Please answer at least 3 prompt questions');
        return;
      }
    }
    if (step === 6 && (!formData.intent || formData.intent.length === 0)) {
      setError('Please select at least one connection intent');
      return;
    }

    if (step < 7) {
      setStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    setError('');
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const cleanedPhotos = formData.photos.filter((url) => url.trim() !== '');

    const payload = {
      ...formData,
      photos: cleanedPhotos,
      prompts: formData.prompts.filter((p) => p.answer.trim() !== ''),
    };

    try {
      const updatedUser = await api.post('/users/setup', payload);
      localStorage.setItem('matchalize_user', JSON.stringify(updatedUser));
      navigate('/discover');
    } catch (err) {
      setError(err.message || 'Setup failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#000000',
    }}>
      {/* Decorative Glow Elements */}
      <div className="glow-sphere" style={{ top: '10%', left: '-100px' }} />
      <div className="glow-sphere" style={{ bottom: '10%', right: '-100px' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 20px 12px 20px', overflow: 'hidden' }}>
        
        {/* Header & Step Segment indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '1.5px', fontFamily: 'Geist, sans-serif' }}>
              STEP {step} OF 7
            </span>
            {step > 1 && (
              <button
                onClick={prevStep}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  fontFamily: 'Geist, sans-serif',
                }}
              >
                ← BACK
              </button>
            )}
          </div>

          {/* Segmented Progress Indicators */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '4px',
                  backgroundColor: i + 1 <= step ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '2px',
                  transition: 'background-color 0.3s ease',
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '0.5px solid rgba(220, 38, 38, 0.2)',
              color: 'var(--rose)',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
              {error}
            </div>
          )}

          {/* Form Scroll Viewport */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column' }} className="step-scroll">
            
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <motion.div style={{ flex: 1 }} initial="enter" animate="center" variants={slideVariants}>
                <h2 style={stepTitleStyle}>Let's build your profile</h2>
                <p style={stepSubtitleStyle}>How should classmates address you?</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label htmlFor="name" style={labelStyle}>FIRST NAME</label>
                    <input
                      id="name"
                      type="text"
                      className="input-underline"
                      placeholder="Aditya"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="dob" style={labelStyle}>DATE OF BIRTH</label>
                    <input
                      id="dob"
                      type="date"
                      className="input-underline"
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.dob || ''}
                      onChange={(e) => {
                        const dobVal = e.target.value;
                        if (!dobVal) return;
                        
                        const birthDate = new Date(dobVal);
                        const today = new Date();
                        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                          calculatedAge--;
                        }
                        
                        setFormData(prev => ({
                          ...prev,
                          dob: dobVal,
                          age: calculatedAge
                        }));
                      }}
                    />
                    {formData.age !== '' && (
                      <div style={{ color: 'var(--primary)', fontSize: '12px', marginTop: '8px', fontWeight: '600', fontFamily: 'Geist, sans-serif' }}>
                        Calculated Age: {formData.age} years old
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Gender & Pronouns */}
            {step === 2 && (
              <motion.div style={{ flex: 1 }} initial="enter" animate="center" variants={slideVariants}>
                <h2 style={stepTitleStyle}>Gender Identity</h2>
                <p style={stepSubtitleStyle}>Select the option that represents you best.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {GENDERS.map((g) => {
                    const active = formData.gender === g;
                    return (
                      <button
                        key={g}
                        className="btn"
                        onClick={() => updateField('gender', g)}
                        style={{
                          justifyContent: 'flex-start',
                          backgroundColor: active ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)',
                          border: `0.5px solid ${active ? 'var(--primary)' : 'rgba(255,255,255,0.06)'}`,
                          color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                          borderRadius: '16px',
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: 'Geist, sans-serif',
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label style={labelStyle}>PRONOUNS (OPTIONAL)</label>
                  <div style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '8px',
                    paddingBottom: '8px',
                    marginBottom: '8px',
                  }} className="pronouns-scroll">
                    {PRONOUNS_OPTIONS.map((p) => {
                      const active = formData.pronouns === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => updateField('pronouns', p)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '99px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: active ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)',
                            border: `0.5px solid ${active ? 'var(--primary)' : 'rgba(255,255,255,0.06)'}`,
                            color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                            fontFamily: 'Geist, sans-serif',
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  {formData.pronouns && !PRONOUNS_OPTIONS.includes(formData.pronouns) && (
                    <input
                      type="text"
                      className="input-underline"
                      placeholder="Enter custom pronouns..."
                      value={formData.pronouns}
                      onChange={(e) => updateField('pronouns', e.target.value)}
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Campus Details */}
            {step === 3 && (
              <motion.div style={{ flex: 1 }} initial="enter" animate="center" variants={slideVariants}>
                <h2 style={stepTitleStyle}>Campus Details</h2>
                <p style={stepSubtitleStyle}>Help us find classmates near you.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label htmlFor="branch" style={labelStyle}>BRANCH OF STUDY</label>
                    <select
                      id="branch"
                      value={formData.branch}
                      onChange={(e) => updateField('branch', e.target.value)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '0.5px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        color: '#ffffff',
                        padding: '12px 16px',
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#000000' }}>Select Branch</option>
                      {BRANCHES.map((b) => (
                        <option key={b} value={b} style={{ backgroundColor: '#000000' }}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="year" style={labelStyle}>YEAR OF STUDY</label>
                    <select
                      id="year"
                      value={formData.year}
                      onChange={(e) => updateField('year', e.target.value)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '0.5px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        color: '#ffffff',
                        padding: '12px 16px',
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#000000' }}>Select Year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y} style={{ backgroundColor: '#000000' }}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hostel" style={labelStyle}>HOSTEL (OPTIONAL)</label>
                    <input
                      id="hostel"
                      type="text"
                      className="input-underline"
                      placeholder="Hall 4, Nilgiri, etc."
                      value={formData.hostel}
                      onChange={(e) => updateField('hostel', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Photos */}
            {step === 4 && (
              <motion.div style={{ flex: 1 }} initial="enter" animate="center" variants={slideVariants}>
                <h2 style={stepTitleStyle}>Add your photos</h2>
                <p style={stepSubtitleStyle}>Upload up to 4 photos to show your campus style (tap to upload).</p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  marginBottom: '10px',
                }}>
                  {formData.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: '140px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '0.5px solid rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {photo ? (
                        <>
                          <img
                            src={photo}
                            alt={`Upload ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            onClick={(e) => handleClearImage(e, idx)}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(0, 0, 0, 0.6)',
                              border: 'none',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              cursor: 'pointer',
                              zIndex: 10,
                            }}
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <label style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          gap: '6px',
                          margin: 0,
                        }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, idx)}
                            style={{ display: 'none' }}
                          />
                          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '24px' }}>add_a_photo</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600', fontFamily: 'Geist, sans-serif' }}>UPLOAD</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: Prompts */}
            {step === 5 && (
              <motion.div style={{ flex: 1 }} initial="enter" animate="center" variants={slideVariants}>
                <h2 style={stepTitleStyle}>Answer prompts</h2>
                <p style={stepSubtitleStyle}>Write interesting answers to stand out.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {formData.prompts.map((p, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      border: '0.5px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '24px',
                      padding: '20px',
                    }}>
                      <label style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--rose)' : idx === 2 ? 'var(--primary)' : idx === 3 ? 'var(--rose)' : 'var(--text-dim)',
                        letterSpacing: '1px',
                        marginBottom: '10px',
                        display: 'block',
                        fontFamily: 'Geist, sans-serif',
                      }}>
                        PROMPT QUESTION {idx + 1}
                      </label>
                      <div style={{ fontSize: '15px', color: '#ffffff', fontWeight: '600', marginBottom: '14px', fontFamily: 'Geist, sans-serif' }}>
                        {p.question}
                      </div>
                      <textarea
                        className="input-underline"
                        placeholder="Write your answer here..."
                        value={p.answer}
                        onChange={(e) => updatePrompt(idx, 'answer', e.target.value)}
                        rows={3}
                        style={{
                          fontSize: '16px',
                          fontFamily: 'Inter, sans-serif',
                          width: '100%',
                          resize: 'vertical',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: '0.5px solid rgba(255,255,255,0.1)',
                          color: '#ffffff',
                          outline: 'none',
                          padding: '8px 0',
                          lineHeight: '1.5',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 6: Intent & Bio */}
            {step === 6 && (
              <motion.div style={{ flex: 1 }} initial="enter" animate="center" variants={slideVariants}>
                <h2 style={stepTitleStyle}>Interests & Intent</h2>
                <p style={stepSubtitleStyle}>What are you looking for on campus?</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>CONNECTION INTENT (SELECT MULTIPLE)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {INTENTS.map((intent) => {
                        const active = formData.intent.includes(intent);
                        return (
                          <button
                            key={intent}
                            type="button"
                            onClick={() => handleIntentToggle(intent)}
                            style={{
                              flex: 1,
                              padding: '12px 0',
                              borderRadius: '16px',
                              fontSize: '13px',
                              fontWeight: '700',
                              backgroundColor: active ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)',
                              border: `0.5px solid ${active ? 'var(--primary)' : 'rgba(255,255,255,0.06)'}`,
                              color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              fontFamily: 'Geist, sans-serif',
                            }}
                          >
                            {intent === 'Dating' ? '❤️ Dating' : intent === 'Friends' ? '👋 Friends' : '📚 Study'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>INTERESTED IN (GENDER COMPATIBILITY)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {GENDERS.map((g) => {
                        const active = formData.interestedIn.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => handleGenderInterestToggle(g)}
                            style={{
                              justifyContent: 'flex-start',
                              backgroundColor: active ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)',
                              border: `0.5px solid ${active ? 'var(--primary)' : 'rgba(255,255,255,0.06)'}`,
                              color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                              borderRadius: '16px',
                              padding: '12px 16px',
                              fontSize: '13px',
                              fontWeight: '600',
                              fontFamily: 'Geist, sans-serif',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {active ? '✓' : ''} {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" style={labelStyle}>BIO (SHORT INTRO)</label>
                    <textarea
                      id="bio"
                      className="input-underline"
                      placeholder="Tell us a bit about yourself..."
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      style={{ height: '70px', resize: 'none', fontSize: '15.5px' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 7: Interests */}
            {step === 7 && (
              <motion.div style={{ flex: 1 }} initial="enter" animate="center" variants={slideVariants}>
                <h2 style={stepTitleStyle}>Choose your interests</h2>
                <p style={stepSubtitleStyle}>Select up to {APP_CONSTANTS.MAX_INTERESTS} topics that you enjoy (Chosen: {formData.interests.length}/{APP_CONSTANTS.MAX_INTERESTS}).</p>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  maxHeight: '360px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }} className="interests-scroll">
                  {INTEREST_TAGS.map((tag) => {
                    const active = formData.interests.includes(tag);
                    const icon = getInterestIcon(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleInterestToggle(tag)}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '99px',
                          fontSize: '14px',
                          fontWeight: '600',
                          backgroundColor: active ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `0.5px solid ${active ? 'var(--primary)' : 'rgba(255,255,255,0.06)'}`,
                          color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          fontFamily: 'Geist, sans-serif',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{
                          fontSize: '18px',
                          fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                          color: active ? '#f97316' : 'rgba(255,255,255,0.5)',
                        }}>
                          {icon}
                        </span>
                        {tag.toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Navigation Button */}
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button
              className="btn gradient-btn"
              onClick={nextStep}
              disabled={loading}
              style={{
                padding: '16px',
                borderRadius: '99px',
                fontFamily: 'Geist, sans-serif',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {loading ? 'CREATING ACCOUNT...' : step === 7 ? "LET'S GO!" : 'CONTINUE'}
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
  );
};

// Inline Layout Styles
const stepTitleStyle = {
  fontSize: '24px',
  fontWeight: '800',
  marginBottom: '6px',
  color: '#ffffff',
  fontFamily: 'Geist, sans-serif',
  letterSpacing: '-0.5px',
};

const stepSubtitleStyle = {
  color: 'var(--text-dim)',
  fontSize: '14px',
  marginBottom: '24px',
  fontFamily: 'Inter, sans-serif',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: 'rgba(255, 255, 255, 0.4)',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  marginBottom: '8px',
  display: 'block',
  fontFamily: 'Geist, sans-serif',
};

export default Onboarding;
