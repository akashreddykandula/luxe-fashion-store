import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Reset Password — LUXE Fashion</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-luxe-bg-soft px-4">
        <div className="bg-white p-10 w-full max-w-md">
          <Link to="/" className="font-display text-2xl font-semibold tracking-widest block mb-10 text-center">LUXE</Link>

          {success ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-medium mb-3">Password Reset!</h1>
              <p className="text-luxe-muted text-sm mb-6">Your password has been updated. Redirecting to login...</p>
              <Link to="/login" className="btn-primary w-full justify-center">Go to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-medium mb-2">Reset Password</h1>
              <p className="text-luxe-muted text-sm mb-8">Create a new strong password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="input-field pr-10"
                      placeholder="Min. 8 characters"
                      required minLength={8}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-luxe-muted">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="input-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="input-field"
                    placeholder="Repeat new password"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
