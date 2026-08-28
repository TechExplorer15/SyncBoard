/**
 * Register page — name + email + password form.
 * Redirects to dashboard on success.
 */
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    const result = await register({ name, email, password });
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard', { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 selection:bg-brand-500 selection:text-white relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-2xl items-center justify-center mb-6 shadow-xl shadow-brand-500/20 ring-1 ring-white/50">
            <span className="text-white font-bold text-2xl tracking-tighter">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Start organizing your work in seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 ring-1 ring-gray-900/5 p-8 space-y-5">
          {error && (
            <div className="bg-red-50/80 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              autoFocus
              className="bg-white"
            />

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-white"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-white"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm transition-all active:scale-[0.98] mt-2">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm font-medium text-gray-500 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 hover:text-brand-600 transition-colors underline decoration-gray-300 hover:decoration-brand-600 underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
