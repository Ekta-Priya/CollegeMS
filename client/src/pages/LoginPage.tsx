import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { label: 'Admin', email: 'admin@college.edu', password: 'Admin@123' },
  { label: 'HOD', email: 'hod@college.edu', password: 'Hod@123' },
  { label: 'Teacher', email: 'teacher@college.edu', password: 'Teacher@123' },
  { label: 'Student', email: 'student@college.edu', password: 'Student@123' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: saveAuth } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: 'email' | 'password', value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectDemoAccount = (email: string, password: string) => {
    setError('');
    setForm({ email, password });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', form);
      const { token, user } = response.data;

      saveAuth(user, token);

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'hod') navigate('/hod');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#e2e8f0_35%,_#f8fafc_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-[32px] bg-white/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div className="rounded-[24px] bg-slate-900 p-8 text-white shadow-xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
            Portfolio Project
          </div>

          <h1 className="text-4xl font-bold leading-tight">College Management System</h1>
          <p className="mt-4 max-w-md text-slate-300">
            A full-stack role-based campus management platform for administrators, HODs, teachers, and students.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              'Admin controls',
              'HOD department management',
              'Teacher attendance & grading',
              'Student academic overview',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-6 shadow-lg ring-1 ring-slate-200 md:p-7">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Welcome back</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-800">Sign in</h2>
          </div>

          <div className="mb-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Demo logins</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  onClick={() => selectDemoAccount(account.email, account.password)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:bg-white"
                placeholder="admin@college.edu"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:bg-white"
                placeholder="********"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
