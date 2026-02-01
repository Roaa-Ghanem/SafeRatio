import React, { useState } from 'react';
import { sendPasswordReset } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await sendPasswordReset(email);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="auth-page">
      <h2>Forgot Password</h2>
      {status === 'sent' ? (
        <p>If the account exists, a password reset email was sent.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit">Send Reset Email</button>
        </form>
      )}
      {status === 'error' && <p className="error">Failed to send reset email.</p>}
    </div>
  );
}
