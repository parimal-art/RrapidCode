import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { registerUser } from '../authslice.js';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, UserPlus, Check, X, AlertCircle } from 'lucide-react';

// 1. Updated Schema: Only requires 8 characters
const SignupSchema = z
  .object({
    FirstName: z.string().min(3, 'Name must be at least 3 characters'),
    emailId: z.string().email('Invalid email address'),
    password: z.string().min(8, 'At least 8 characters required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

function Rule({ passed, text }) {
  return (
    <div className={`flex items-center gap-2 text-[13px] transition-colors ${passed ? 'text-emerald-400' : 'text-slate-500'}`}>
      {passed ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
      {text}
    </div>
  );
}

// 2. Simplified UI: Just shows the single 8-character rule
function PasswordRequirement({ password }) {
  if (!password) return null;

  return (
    <div className="mt-3">
      <Rule passed={password.length >= 8} text="Min 8 characters" />
    </div>
  );
}

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error: authError } = useSelector((state) => state.auth);

  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [watchedPass, setWatchedPass] = useState('');
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  const passwordValue = watch('password', '');
  useEffect(() => { setWatchedPass(passwordValue || ''); }, [passwordValue]);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!authError) { setServerError(''); return; }
    const msg = String(authError).toLowerCase();
    if (
      msg.includes('duplicate') ||
      msg.includes('already exists') ||
      msg.includes('unique') ||
      msg.includes('e11000') 
    ) {
      setServerError('An account with this email already exists. Please login instead.');
    } else {
      setServerError(authError);
    }
  }, [authError]);

  const onSubmit = (data) => {
    setServerError('');
    delete data.confirmPassword;
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#060712] via-[#071023] to-[#05060a] px-4 py-10">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
            Rapid Code
          </h1>
          <p className="text-slate-500 text-sm mt-2">Create your account</p>
        </div>

        {serverError && (
          <div className="mb-5 flex items-start gap-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span>{serverError}</span>
              {serverError.includes('already exists') && (
                <span>
                  {' '}
                  <Link to="/login" className="underline text-cyan-400 hover:text-cyan-300 font-medium">
                    Click here to login →
                  </Link>
                </span>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              {...register('FirstName')}
              placeholder="John Doe"
              className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition ${errors.FirstName ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'}`}
            />
            {errors.FirstName && <p className="text-rose-400 text-xs mt-1.5">⚠ {errors.FirstName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              {...register('emailId')}
              type="email"
              placeholder="you@example.com"
              onChange={() => setServerError('')}
              className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition ${errors.emailId || serverError ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'}`}
            />
            {errors.emailId && <p className="text-rose-400 text-xs mt-1.5">⚠ {errors.emailId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="Create a password (min 8 characters)"
                className={`w-full px-4 py-3 pr-11 rounded-xl bg-slate-800 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition ${errors.password ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'}`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Replaced the complex bar with the simple single rule */}
            <PasswordRequirement password={watchedPass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className={`w-full px-4 py-3 pr-11 rounded-xl bg-slate-800 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition ${errors.confirmPassword ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1.5">⚠ {errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/30">
            {loading ? <span className="loading loading-spinner loading-sm"></span> : <><UserPlus className="w-4 h-4" /> Create Account</>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;