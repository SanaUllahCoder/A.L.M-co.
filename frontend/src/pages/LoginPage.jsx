import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import { COMPANY_NAME } from '../config/brand.js';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <div className="art-glow" />
        <div className="login-brand">
          <span className="brand-mark">ALM</span><span>{COMPANY_NAME}</span>
        </div>
        <div className="art-copy">
          <span className="eyebrow light-eyebrow">YOUR DISTRIBUTION, MADE SIMPLE</span>
          <h1>Good business<br />starts with a<br /><em>beautifully</em> clear<br />invoice.</h1>
          <p>Official distributor of Jhonson White, Becute and MMadam.</p>
        </div>
        <div className="art-footer">COSMETICS DISTRIBUTION · PAKISTAN</div>
      </div>
      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your desk</h2>
          <p className="form-subtitle">Enter your administrator credentials to continue.</p>
          {error && <div className="error-banner">{error}</div>}
          <label>
            Email address
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@yourbusiness.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>
          <button className="primary-button login-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}<ArrowRight size={17} />
          </button>
          <p className="login-foot">Secure administrator access</p>
        </form>
      </div>
    </div>
  );
}
