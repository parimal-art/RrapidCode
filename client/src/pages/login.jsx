import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { loginUser } from '../authslice';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const LoginSchema = z.object({
  emailId: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error: authError } = useSelector((state) => state.auth);
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!authError) { setServerError(''); return; }
    const msg = String(authError).toLowerCase();
    if (msg.includes('user not found') || msg.includes('not found')) {
      setServerError('No account found with this email. Please sign up first.');
    } else {
      setServerError('Incorrect email or password. Please try again.');
    }
  }, [authError]);

  const onSubmit = (data) => {
    setServerError('');
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#060712] via-[#071023] to-[#05060a] px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
            Rapid Code
          </h1>
          <p className="text-slate-500 text-sm mt-2">Sign in to continue coding</p>
        </div>

        {serverError && (
          <div className="mb-5 flex items-start gap-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                placeholder="Enter your password"
                onChange={() => setServerError('')}
                className={`w-full px-4 py-3 pr-11 rounded-xl bg-slate-800 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition ${errors.password || serverError ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'}`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-400 text-xs mt-1.5">⚠ {errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/30">
            {loading ? <span className="loading loading-spinner loading-sm"></span> : <><LogIn className="w-4 h-4" /> Sign In</>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <button onClick={() => navigate('/signup')} className="text-cyan-400 hover:text-cyan-300 font-medium transition" type="button">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;