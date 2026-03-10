import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, authLoading, authError, clearAuthError } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    if (location.state?.registered) {
      setInfoMessage('Registration successful. Please log in.');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    setInfoMessage('');
    await login(email.trim(), password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="max-w-md w-full card p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-50">LegalLens</h1>
          <p className="text-sm text-slate-400 mt-1">
            AI-native legal operations workspace
          </p>
        </div>

        <h2 className="text-lg font-medium text-slate-100 mb-4">Sign in</h2>

        {infoMessage && (
          <div className="mb-3 rounded-md bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 px-3 py-2 text-sm">
            {infoMessage}
          </div>
        )}

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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={authLoading}
          >
            {authLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400 text-center">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-primary-400 hover:text-primary-300"
          >
            Create workspace
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

