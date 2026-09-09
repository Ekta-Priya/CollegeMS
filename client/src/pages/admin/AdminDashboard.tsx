import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  hodId?: string | null;
  isActive: boolean;
}

interface HodAccount {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId?: {
    id?: string;
    name?: string;
    code?: string;
  } | null;
  isActive?: boolean;
}

interface SystemStats {
  departments: number;
  hods: number;
  teachers: number;
  students: number;
  classes: number;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    departments: 0,
    hods: 0,
    teachers: 0,
    students: 0,
    classes: 0,
  });
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [hods, setHods] = useState<HodAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState<'department' | 'hod' | null>(null);
  const [departmentForm, setDepartmentForm] = useState({ name: '', code: '', description: '', hodId: '' });
  const [hodForm, setHodForm] = useState({ fullName: '', email: '', password: '', phone: '', departmentId: '' });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, deptRes, hodsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/departments'),
        api.get('/admin/hods'),
      ]);

      setStats(statsRes.data.stats);
      setDepartments(deptRes.data.departments || []);
      setHods(hodsRes.data.hods || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDepartmentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setSuccess('');
    setSubmitting('department');

    try {
      await api.post('/admin/departments', {
        name: departmentForm.name,
        code: departmentForm.code,
        description: departmentForm.description,
        hodId: departmentForm.hodId || undefined,
      });

      setDepartmentForm({ name: '', code: '', description: '', hodId: '' });
      setSuccess('Department created successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmitting(null);
    }

    await fetchDashboardData();
  };

  const handleHodSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setSuccess('');
    setSubmitting('hod');

    try {
      await api.post('/admin/hods', {
        fullName: hodForm.fullName,
        email: hodForm.email,
        password: hodForm.password,
        phone: hodForm.phone,
        departmentId: hodForm.departmentId || undefined,
      });

      setHodForm({ fullName: '', email: '', password: '', phone: '', departmentId: '' });
      setSuccess('HOD account created successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create HOD account');
    } finally {
      setSubmitting(null);
    }

    await fetchDashboardData();
  };

  const deleteResource = async (path: string, label: string) => {
    if (!window.confirm(`Delete this ${label}? This action cannot be undone.`)) return;
    setError('');
    setSuccess('');

    try {
      await api.delete(path);
      setSuccess(`${label} deleted successfully.`);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to delete ${label}`);
    }
  };

  const statCards = [
    { label: 'Departments', value: stats.departments },
    { label: 'HODs', value: stats.hods },
    { label: 'Teachers', value: stats.teachers },
    { label: 'Students', value: stats.students },
    { label: 'Classes', value: stats.classes },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-bold">System Overview</h1>
            <p className="mt-1 text-sm text-slate-300">Welcome, {user?.fullName || 'Admin'}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-slate-600 px-4 py-2 font-medium text-slate-100 hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-md ring-1 ring-slate-200">
            Loading system data...
          </div>
        ) : (
          <>
            <section className="mb-8 grid gap-4 md:grid-cols-5">
              {statCards.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-800">{item.value}</h2>
                </div>
              ))}
            </section>

            <section className="mb-8 grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleDepartmentSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Create Department</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Department Name</label>
                    <input
                      value={departmentForm.name}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Computer Science"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Department Code</label>
                    <input
                      value={departmentForm.code}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CSE"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      value={departmentForm.description}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Department overview"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Assign HOD</label>
                    <select
                      value={departmentForm.hodId}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, hodId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select HOD (optional)</option>
                      {hods.map((hod) => (
                        <option key={hod.id} value={hod.id}>{hod.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={submitting !== null} className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                    {submitting === 'department' ? 'Saving...' : 'Save Department'}
                  </button>
                </div>
              </form>

              <form onSubmit={handleHodSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Create HOD Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                    <input
                      value={hodForm.fullName}
                      onChange={(e) => setHodForm({ ...hodForm, fullName: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dr. Asha Verma"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={hodForm.email}
                      onChange={(e) => setHodForm({ ...hodForm, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="hod@college.edu"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={hodForm.password}
                      onChange={(e) => setHodForm({ ...hodForm, password: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                    <input
                      value={hodForm.phone}
                      onChange={(e) => setHodForm({ ...hodForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
                    <select
                      value={hodForm.departmentId}
                      onChange={(e) => setHodForm({ ...hodForm, departmentId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>{department.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={submitting !== null} className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {submitting === 'hod' ? 'Creating...' : 'Create HOD'}
                  </button>
                </div>
              </form>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Department Management</h3>
                <ul className="space-y-3 text-slate-600">
                  {departments.length > 0 ? (
                    departments.map((department) => (
                      <li key={department.id} className="rounded-lg bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-800">{department.name}</p>
                            <p className="text-sm text-slate-500">{department.code}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs ${department.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {department.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button onClick={() => deleteResource(`/admin/departments/${department.id}`, 'department')} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500">
                            Delete
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-lg bg-slate-50 p-3 text-slate-500">No departments found.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">HOD Accounts</h3>
                <ul className="space-y-3 text-slate-600">
                  {hods.length > 0 ? (
                    hods.map((hod) => (
                      <li key={hod.id} className="rounded-lg bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-800">{hod.fullName}</p>
                            <p className="text-sm text-slate-500">{hod.email}</p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                            {hod.departmentId?.name || 'Unassigned'}
                          </span>
                          <button onClick={() => deleteResource(`/admin/hods/${hod.id}`, 'HOD account')} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500">
                            Delete
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-lg bg-slate-50 p-3 text-slate-500">No HOD accounts found.</li>
                  )}
                </ul>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
