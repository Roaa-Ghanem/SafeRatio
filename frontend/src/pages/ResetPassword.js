import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const uid = query.get('uid');
  const token = query.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!uid || !token) {
      setStatus('missing');
    }
  }, [uid, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('mismatch');
      return;
    }
    setStatus('submitting');
    try {
      await resetPassword(uid, token, newPassword, confirmPassword);
      setStatus('success');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'missing') {
    return (
      <div className="auth-page">
        <h2>Reset Password</h2>
        <p>Missing reset parameters.</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <h2>Reset Password</h2>
      {status === 'success' ? (
        <p>Password updated. Redirecting to home...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            New Password
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </label>
          <label>
            Confirm Password
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </label>
          <button type="submit">Reset Password</button>
        </form>
      )}
      {status === 'mismatch' && <p className="error">Passwords do not match.</p>}
      {status === 'error' && <p className="error">Failed to reset password.</p>}
      <p>
        Back to <Link to="/">home</Link>
      </p>
    </div>
  );
}
