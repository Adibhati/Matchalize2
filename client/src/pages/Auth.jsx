import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('EMAIL'); // EMAIL or OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const otpInputRef = useRef(null);

  // Focus OTP input when entering OTP step
  useEffect(() => {
    if (step === 'OTP' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Handle countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/send-otp', { email });
      setStep('OTP');
      setTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/auth/verify-otp', { email, otp: otpValue || otp });
      localStorage.setItem('matchalize_token', data.token);
      localStorage.setItem('matchalize_user', JSON.stringify(data.user));

      if (data.user.isOnboarded) {
        navigate('/discover');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code');
      setOtp(''); // clear on error
      if (otpInputRef.current) otpInputRef.current.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 6) {
      setOtp(val);
      if (val.length === 6) {
        handleVerifyOTP(val);
      }
    }
  };

  const handleResend = async () => {
    if (timer > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      setTimer(60);
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 20px',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#000000',
    }}>
      {/* Glow Spheres for Atmospheric Visual Depth */}
      <div className="glow-sphere" style={{ top: '-100px', right: '-100px' }} />
      <div className="glow-sphere" style={{ bottom: '-100px', left: '-100px' }} />

      <div style={{ zIndex: 10, width: '100%' }}>
        {/* Back navigation button */}
        <button 
          onClick={() => step === 'OTP' ? setStep('EMAIL') : navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '8px 0',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'Geist, sans-serif',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          BACK
        </button>

        {/* Glass Card Panel */}
        <div className="glass-card" style={{
          borderRadius: '32px',
          padding: '28px 24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
        }}>
          {/* Subtle text shine effect */}
          <div className="academic-shine" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

          {step === 'EMAIL' ? (
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '28px' }}>school</span>
                <h1 style={{ fontSize: '22px', fontWeight: '800', tracking: '-0.5px', color: '#ffffff', fontFamily: 'Geist, sans-serif' }}>
                  ELITE CAMPUS
                </h1>
              </div>
              
              <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: '#ffffff', fontFamily: 'Geist, sans-serif', letterSpacing: '-0.5px' }}>
                Campus Connect
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.5', fontFamily: 'Inter, sans-serif' }}>
                Verify your university email to join classmates nearby.
              </p>

              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label htmlFor="email" style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'block',
                    fontFamily: 'Geist, sans-serif',
                  }}>ACADEMIC EMAIL</label>
                  
                  <div style={{ position: 'relative' }}>
                    <input
                      id="email"
                      type="email"
                      className="input-underline"
                      placeholder="name@college.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                      right: '0px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--primary)',
                      opacity: 0.7,
                      fontSize: '18px',
                    }}>
                      verified_user
                    </span>
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>
                    Must end in .ac.in or authorized domain
                  </p>
                </div>

                {error && (
                  <div style={{ color: 'var(--rose)', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={`btn gradient-btn ${email ? '' : 'btn-disabled'}`}
                  disabled={!email || loading}
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
                  {loading ? 'SENDING...' : 'SEND VERIFICATION CODE'}
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </button>
              </form>
            </div>
          ) : (
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '28px' }}>lock</span>
                <h1 style={{ fontSize: '22px', fontWeight: '800', tracking: '-0.5px', color: '#ffffff', fontFamily: 'Geist, sans-serif' }}>
                  VERIFICATION
                </h1>
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: '#ffffff', fontFamily: 'Geist, sans-serif', letterSpacing: '-0.5px' }}>
                Verify it's you
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.5', fontFamily: 'Inter, sans-serif' }}>
                Enter the 6-digit code sent to <strong style={{ color: '#ffffff' }}>{email}</strong>
              </p>

              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <input
                  ref={otpInputRef}
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '56px',
                    opacity: 0,
                    zIndex: 2,
                    cursor: 'default',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', zIndex: 1 }}>
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const char = otp[idx] || '';
                    const isFocused = otp.length === idx;
                    return (
                      <div
                        key={idx}
                        className="otp-input"
                        style={{
                          flex: 1,
                          border: isFocused ? '1px solid var(--primary) !important' : '',
                          boxShadow: isFocused ? '0 4px 12px -2px rgba(249, 115, 22, 0.3) !important' : '',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Geist, sans-serif',
                        }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div style={{ color: 'var(--rose)', fontSize: '13px', fontWeight: '500', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                  {error}
                </div>
              )}

              <button
                onClick={() => handleVerifyOTP()}
                className={`btn gradient-btn ${otp.length === 6 ? '' : 'btn-disabled'}`}
                disabled={otp.length < 6 || loading}
                style={{
                  padding: '16px',
                  borderRadius: '99px',
                  fontFamily: 'Geist, sans-serif',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '8px',
                }}
              >
                {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
          )}

          {/* Footer details links */}
          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1.5px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
            zIndex: 2,
          }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Campus Security Authorized Access Only</p>
          </div>
        </div>
      </div>

      {/* Resend SMS OTP Block */}
      {step === 'OTP' && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '13px',
          marginTop: '20px',
          zIndex: 10,
          fontFamily: 'Inter, sans-serif',
        }}>
          <span style={{ color: 'var(--text-dim)' }}>Didn't receive code?</span>
          <button
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: timer > 0 ? 'var(--text-dim)' : 'var(--primary)',
              fontWeight: '700',
              cursor: timer > 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Geist, sans-serif',
            }}
            disabled={timer > 0 || loading}
          >
            {timer > 0 ? `RESEND IN ${timer}S` : 'RESEND CODE'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;
