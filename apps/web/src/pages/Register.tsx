import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { user, register, googleLogin, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  if (user) return <Navigate to="/customer/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="logo text-center d-block mb-8">
          <span className="logo-casa">Interior</span><span className="logo-canvas">G</span>
        </Link>
        
        <div className="auth-box">
          <h2 className="mb-6 text-center">Create an account.</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" required className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" required className="input" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" required className="input" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="auth-separator"><span>or</span></div>

          <button onClick={googleLogin} className="btn btn-secondary w-full">
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-accent font-medium">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
