import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { confirmEmail } from '../services/authService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ConfirmEmail() {
  const query = useQuery();
  const uid = query.get('uid');
  const token = query.get('token');
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    if (!uid || !token) {
      setStatus('error');
      setMessage('Missing verification parameters.');
      return;
    }

    confirmEmail(uid, token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.detail || 'Email confirmed successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed.');
      });
  }, [uid, token]);

  return (
    <div className="auth-page">
      <h2>Email Verification</h2>
      <p>{message}</p>
      {status === 'success' ? (
        <p>
          You can now <Link to="/">return to the site</Link> and log in.
        </p>
      ) : null}
    </div>
  );
}
