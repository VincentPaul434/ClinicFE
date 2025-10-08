import React, { useState, useEffect } from 'react';
import './ResetPassword.css';

const ResetPassword = ({ onBack }) => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
    else setStatus({ type: 'error', text: 'Invalid or missing reset token.' });
  }, []);

  const validatePassword = (val) =>
    /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(val); // >=8 chars, letters & numbers

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    if (!token) {
      setStatus({ type: 'error', text: 'Missing token.' });
      return;
    }
    if (!password || !confirm) {
      setStatus({ type: 'error', text: 'Fill in all fields.' });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (!validatePassword(password)) {
      setStatus({
        type: 'error',
        text: 'Password must be 8+ chars and include a number.'
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (res.ok) {
        setStatus({
          type: 'success',
          text: (data && (data.message || data.status)) || 'Password reset successful. You may now log in.'
        });
        setPassword('');
        setConfirm('');
      } else {
        setStatus({
          type: 'error',
          text: (data && (data.error || data.message)) || 'Reset failed. Try again.'
        });
      }
    } catch {
      setStatus({ type: 'error', text: 'Network error. Try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-wrapper">
      <div className="fp-card">
        <h2 className="fp-title">Reset Password</h2>
        <p className="fp-sub">
          Enter a new password for your account.
        </p>

        {status.text && (
          <div className={`fp-alert ${status.type === 'error' ? 'fp-alert-error' : 'fp-alert-success'}`}>
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label className="fp-label" htmlFor="password">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className="fp-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                disabled={isLoading || !token}
                required
              />
              <button
                type="button"
                style={{
                  position:'absolute', right:8, top:8, background:'none', border:'none',
                  fontSize:'.7rem', cursor:'pointer', color:'#3174f3'
                }}
                onClick={() => setShowPw(p => !p)}
                disabled={isLoading}
              >
                {showPw ? 'HIDE' : 'SHOW'}
              </button>
            </div>

          <label className="fp-label" htmlFor="confirm">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                className="fp-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                disabled={isLoading || !token}
                required
              />
              <button
                type="button"
                style={{
                  position:'absolute', right:8, top:8, background:'none', border:'none',
                  fontSize:'.7rem', cursor:'pointer', color:'#3174f3'
                }}
                onClick={() => setShowConfirm(c => !c)}
                disabled={isLoading}
              >
                {showConfirm ? 'HIDE' : 'SHOW'}
              </button>
            </div>

          <button
            type="submit"
            className="fp-btn-primary"
            disabled={isLoading || !token}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <button
          type="button"
            className="fp-btn-link"
            onClick={onBack}
            disabled={isLoading}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;