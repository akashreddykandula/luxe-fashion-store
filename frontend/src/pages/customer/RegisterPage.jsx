import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Check } from 'lucide-react';
import { register } from '../../store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) errs.email = 'Valid email is required';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(register({ name: form.name, email: form.email, phone: form.phone, password: form.password }));
    if (!result.error) navigate('/');
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = passwordStrength();
  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <>
      <Helmet><title>Create Account — LUXE Fashion</title></Helmet>
      <div className="min-h-screen grid md:grid-cols-2">
        {/* Left — image */}
        <div className="hidden md:block relative">
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-end p-12">
            <div className="text-white">
              <h2 className="font-display text-4xl font-medium mb-3">Join LUXE</h2>
              <ul className="space-y-2 text-white/80 text-sm">
                {['Exclusive member discounts', 'Early access to new arrivals', 'Free shipping on first order', 'Wishlist & order tracking'].map(b => (
                  <li key={b} className="flex items-center gap-2"><Check size={14} className="text-luxe-gold" />{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex items-center justify-center px-6 py-20 bg-white overflow-y-auto">
          <div className="w-full max-w-sm">
            <Link to="/" className="font-display text-2xl font-semibold tracking-widest text-luxe-black block mb-10 text-center">LUXE</Link>
            <h1 className="font-display text-3xl font-medium mb-2">Create Account</h1>
            <p className="text-luxe-muted text-sm mb-8">Already have an account? <Link to="/login" className="text-luxe-black underline">Sign in</Link></p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="Your full name"
                  required
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="input-label">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="you@example.com"
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="input-label">Phone Number <span className="font-normal normal-case tracking-normal text-luxe-muted">(optional)</span></label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="input-field"
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                />
              </div>

              <div>
                <label className="input-label">Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-luxe-muted">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-yellow-500' : strength === 3 ? 'text-blue-500' : 'text-green-500'}`}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">Confirm Password *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  placeholder="Repeat your password"
                  required
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <p className="text-xs text-luxe-muted">
                By creating an account, you agree to our{' '}
                <Link to="/terms-and-conditions" className="underline">Terms & Conditions</Link> and{' '}
                <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
              </p>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
