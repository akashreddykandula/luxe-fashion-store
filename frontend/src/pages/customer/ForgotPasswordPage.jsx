import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Forgot Password — LUXE Fashion</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-luxe-bg-soft px-4">
        <div className="bg-white p-10 w-full max-w-md">
          <Link to="/" className="font-display text-2xl font-semibold tracking-widest text-luxe-black block mb-10 text-center">LUXE</Link>

          {sent ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-medium mb-3">Check Your Email</h1>
              <p className="text-luxe-muted text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>. The link expires in 15 minutes.
              </p>
              <p className="text-xs text-luxe-muted mb-6">
                Didn't receive it? Check your spam folder, or{' '}
                <button onClick={() => setSent(false)} className="underline text-luxe-black">try again</button>.
              </p>
              <Link to="/login" className="btn-outline w-full justify-center">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-medium mb-2">Forgot Password</h1>
              <p className="text-luxe-muted text-sm mb-8">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxe-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-xs text-luxe-muted hover:text-luxe-black transition-colors">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
