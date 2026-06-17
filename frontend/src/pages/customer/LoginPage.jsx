// ─── LoginPage.jsx ────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../../store/slices/authSlice';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (!result.error) navigate(from, { replace: true });
  };

  return (
    <>
      <Helmet><title>Login — LUXE Fashion</title></Helmet>
      <div className="min-h-screen grid md:grid-cols-2">
        {/* Left — image */}
        <div className="hidden md:block relative">
          <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-end p-12">
            <div className="text-white">
              <h2 className="font-display text-4xl font-medium mb-2">Welcome Back</h2>
              <p className="text-white/70">Continue your journey with LUXE</p>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex items-center justify-center px-6 py-20 bg-white">
          <div className="w-full max-w-sm">
            <Link to="/" className="font-display text-2xl font-semibold tracking-widest text-luxe-black block mb-10 text-center">LUXE</Link>
            <h1 className="font-display text-3xl font-medium mb-2">Sign In</h1>
            <p className="text-luxe-muted text-sm mb-8">New to LUXE? <Link to="/register" className="text-luxe-black underline">Create an account</Link></p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="you@example.com" required />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="input-label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs text-luxe-muted hover:text-luxe-black transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field pr-10" placeholder="••••••••" required minLength={8} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-luxe-muted">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 mt-2">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 p-3 text-xs text-luxe-muted bg-luxe-bg-soft rounded-lg">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 opacity-70"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
  <span>Secured with 256-bit end-to-end encryption.</span>
</div>

          </div>
        </div>
      </div>
    </>
  );
}
export default LoginPage;

// ─── RegisterPage.jsx is in a separate file ───────────────────────────────────
