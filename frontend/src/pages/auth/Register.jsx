import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register, authLoading, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    await register(email.trim(), password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="max-w-md w-full card p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-50">LegalLens</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create an AI-native legal workspace
          </p>
        </div>

        <h2 className="text-lg font-medium text-slate-100 mb-4">
          Create workspace
        </h2>

        {authError && (
          <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/40 text-red-200 px-3 py-2 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@firm.com"
              className="w-full"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Strong password"
              className="w-full"
            />
          </div>
          <div>
            <label className="label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={authLoading}
          >
            {authLoading ? 'Creating workspace...' : 'Create workspace'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

