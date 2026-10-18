import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalView,
    setAuthModalView,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccess(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (authModalView === 'login') {
        await loginWithEmail(email, password);
      } else if (authModalView === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!phone.trim()) throw new Error('Please enter your phone number.');
        await registerWithEmail(email, password, name, phone);
      } else if (authModalView === 'forgot-password') {
        await resetPassword(email);
        setSuccess('Password reset link sent to your email. Check your inbox!');
      }
    } catch (err: any) {
      let msg = err.message || 'An error occurred. Please try again.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect email or password.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try signing in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => setAuthModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-md w-full bg-[#181a20] rounded-2xl border border-stone-800 shadow-2xl p-6 sm:p-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <picture>
            <source srcSet="/images/dragon_wok_logo.webp" type="image/webp" />
            <img
              src="/images/dragon_wok_logo.jpg"
              alt="Dragon Wok"
              className="w-10 h-10 rounded-full border border-amber-500/40 object-cover"
            />
          </picture>
          <div>
            <h3 className="font-serif-brand text-xl font-bold text-white tracking-wider">
              DRAGON WOK
            </h3>
            <p className="text-xs text-stone-400">
              {authModalView === 'login' && 'Sign in to access your orders & favorites'}
              {authModalView === 'register' && 'Create your Dragon Wok customer account'}
              {authModalView === 'forgot-password' && 'Reset your account password'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        {authModalView !== 'forgot-password' && (
          <div className="flex rounded-lg bg-stone-900 p-1 mb-6 border border-stone-800">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setAuthModalView('login');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                authModalView === 'login'
                  ? 'bg-[#991b1b] text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setAuthModalView('register');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                authModalView === 'register'
                  ? 'bg-[#991b1b] text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {authModalView === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ali Ahmed"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0310 1234567"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {authModalView !== 'forgot-password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-stone-300">
                  Password
                </label>
                {authModalView === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setAuthModalView('forgot-password');
                    }}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-lg text-sm font-semibold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {authModalView === 'login' && 'Sign In'}
                  {authModalView === 'register' && 'Create Account'}
                  {authModalView === 'forgot-password' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {authModalView === 'forgot-password' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setAuthModalView('login');
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Divider */}
        {authModalView !== 'forgot-password' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#181a20] px-3 text-stone-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 rounded-lg text-sm font-medium text-stone-200 transition-all flex items-center justify-center gap-3 shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
