import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface DepartmentSummary {
  departmentId: string;
  teacherCount: number;
  studentCount: number;
  subjectCount: number;
  classCount: number;
  pendingLeaves: number;
}

interface TeacherItem {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  isActive?: boolean;
  role?: string;
}

interface SubjectItem {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  teacherIds?: Array<{ _id?: string; fullName?: string; email?: string }>;
}

interface ClassItem {
  _id?: string;
  id?: string;
  name: string;
  section?: string;
  academicYear?: string;
  studentIds?: Array<{ _id?: string; fullName?: string; email?: string }>;
  teacherIds?: Array<{ _id?: string; fullName?: string; email?: string }>;
  subjectIds?: Array<{ _id?: string; name?: string; code?: string }>;
}

interface StudentItem {
  _id: string;
  fullName: string;
  email: string;
}

interface TimetableEntry {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  classId?: { name?: string; section?: string };
  subjectId?: { name?: string; code?: string };
  teacherId?: { fullName?: string };
}

interface LeaveRequestItem {
  _id: string;
  title: string;
  type: string;
  reason: string;
  status: string;
  employeeId?: {
    fullName?: string;
    email?: string;
    role?: string;
  } | null;
  createdAt?: string;
}

const HODDashboard = () => {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<DepartmentSummary>({
    departmentId: '',
    teacherCount: 0,
    studentCount: 0,
    subjectCount: 0,
    classCount: 0,
    pendingLeaves: 0,
  });
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teacherForm, setTeacherForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '' });
  const [classForm, setClassForm] = useState({ name: '', section: '', academicYear: '' });
  const [assignmentForms, setAssignmentForms] = useState<Record<string, { teacherIds: string[]; studentIds: string[]; subjectIds: string[] }>>({});
  const [studentForm, setStudentForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [timetableForm, setTimetableForm] = useState({ classId: '', subjectId: '', teacherId: '', day: 'Monday', startTime: '', endTime: '', room: '' });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, teachersRes, subjectsRes, classesRes, leaveRes, studentsRes, timetableRes] = await Promise.all([
        api.get('/hod/summary'),
        api.get('/hod/teachers'),
        api.get('/hod/subjects'),
        api.get('/hod/classes'),
        api.get('/hod/leave-requests'),
        api.get('/hod/students'),
        api.get('/hod/timetable'),
      ]);

      setSummary(summaryRes.data.summary || summary);
      setTeachers(teachersRes.data.teachers || []);
      setSubjects(subjectsRes.data.subjects || []);
      setClasses(classesRes.data.classes || []);
      setStudents(studentsRes.data.students || []);
      setTimetableEntries(timetableRes.data.entries || []);
      setLeaveRequests(leaveRes.data.requests || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load department dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTeacherSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/hod/teachers', teacherForm);
      setTeacherForm({ fullName: '', email: '', password: '', phone: '' });
      setSuccess('Teacher account created successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create teacher account');
    }
  };

  const handleSubjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/hod/subjects', subjectForm);
      setSubjectForm({ name: '', code: '' });
      setSuccess('Subject created successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleClassSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/hod/classes', classForm);
      setClassForm({ name: '', section: '', academicYear: '' });
      setSuccess('Class created successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create class');
    }
  };

  const handleStudentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/hod/students', studentForm);
      setStudentForm({ fullName: '', email: '', password: '', phone: '' });
      setSuccess('Student account created successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create student account');
    }
  };

  const handleTimetableSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/hod/timetable', timetableForm);
      setTimetableForm({ classId: '', subjectId: '', teacherId: '', day: 'Monday', startTime: '', endTime: '', room: '' });
      setSuccess('Timetable entry created successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create timetable entry');
    }
  };

  const approveLeaveRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setError('');
    setSuccess('');

    try {
      await api.put(`/hod/leave-requests/${requestId}`, { status });
      setSuccess(`Leave request ${status}.`);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update leave request');
    }
  };

  const getAssignmentForm = (classItem: ClassItem) => assignmentForms[classItem._id || classItem.id || ''] || {
    teacherIds: (classItem.teacherIds || []).map((teacher) => teacher._id).filter(Boolean) as string[],
    studentIds: (classItem.studentIds || []).map((student) => student._id).filter(Boolean) as string[],
    subjectIds: (classItem.subjectIds || []).map((subject) => subject._id).filter(Boolean) as string[],
  };

  const updateClassAssignments = async (classItem: ClassItem) => {
    const classId = classItem._id || classItem.id;
    if (!classId) return;
    setError('');
    setSuccess('');
    try {
      await api.put(`/hod/classes/${classId}/assignments`, getAssignmentForm(classItem));
      setSuccess('Class assignments updated successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update class assignments');
    }
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
    { label: 'Teachers', value: summary.teacherCount },
    { label: 'Students', value: summary.studentCount },
    { label: 'Subjects', value: summary.subjectCount },
    { label: 'Classes', value: summary.classCount },
    { label: 'Pending Leaves', value: summary.pendingLeaves },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl bg-emerald-700 p-6 text-white shadow-lg">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">HOD Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Department Management</h1>
            <p className="mt-1 text-sm text-emerald-100">Welcome, {user?.fullName || 'HOD'}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-emerald-500 bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/20"
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
            Loading department data...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-5">
              {statCards.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-800">{item.value}</h2>
                </div>
              ))}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-4">
              <form onSubmit={handleTeacherSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Create Teacher</h3>
                <div className="space-y-3">
                  <input value={teacherForm.fullName} onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Full name" />
                  <input type="email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Email" />
                  <input type="password" autoComplete="new-password" value={teacherForm.password} onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Password" />
                  <input value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Phone" />
                  <button type="submit" className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600">Add Teacher</button>
                </div>
              </form>

              <form onSubmit={handleSubjectSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Create Subject</h3>
                <div className="space-y-3">
                  <input value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Subject name" />
                  <input value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Code (e.g. DBMS)" />
                  <button type="submit" className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600">Add Subject</button>
                </div>
              </form>

              <form onSubmit={handleClassSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Create Class</h3>
                <div className="space-y-3">
                  <input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Class name" />
                  <input value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Section" />
                  <input value={classForm.academicYear} onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Academic year" />
                  <button type="submit" className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600">Add Class</button>
                </div>
              </form>

              <form onSubmit={handleStudentSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Create Student</h3>
                <div className="space-y-3">
                  <input value={studentForm.fullName} onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Full name" required />
                  <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Email" required />
                  <input type="password" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Password" required />
                  <input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Phone" />
                  <button type="submit" className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600">Add Student</button>
                </div>
              </form>

              <form onSubmit={handleTimetableSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Add Timetable Slot</h3>
                <div className="space-y-3">
                  <select value={timetableForm.classId} onChange={(e) => setTimetableForm({ ...timetableForm, classId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" required><option value="">Select class</option>{classes.map((item) => <option key={item._id || item.id} value={item._id || item.id}>{item.name} {item.section || ''}</option>)}</select>
                  <select value={timetableForm.subjectId} onChange={(e) => setTimetableForm({ ...timetableForm, subjectId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" required><option value="">Select subject</option>{subjects.map((item) => <option key={item._id || item.id} value={item._id || item.id}>{item.name}</option>)}</select>
                  <select value={timetableForm.teacherId} onChange={(e) => setTimetableForm({ ...timetableForm, teacherId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" required><option value="">Select teacher</option>{teachers.map((item) => <option key={item._id || item.id} value={item._id || item.id}>{item.fullName}</option>)}</select>
                  <select value={timetableForm.day} onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select>
                  <div className="grid grid-cols-2 gap-2"><input type="time" value={timetableForm.startTime} onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })} className="rounded-lg border border-slate-300 px-2 py-2" required /><input type="time" value={timetableForm.endTime} onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })} className="rounded-lg border border-slate-300 px-2 py-2" required /></div>
                  <input value={timetableForm.room} onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Room" />
                  <button type="submit" className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600">Add Slot</button>
                </div>
              </form>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Faculty</h3>
                <div className="space-y-3">
                  {teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <div key={teacher._id || teacher.id || teacher.email} className="rounded-lg bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-800">{teacher.fullName}</p>
                            <p className="text-sm text-slate-600">{teacher.email}</p>
                          </div>
                          <button onClick={() => deleteResource(`/hod/teachers/${teacher._id || teacher.id}`, 'teacher account')} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">Delete</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-3 text-slate-500">No teachers in this department.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Leave Approvals</h3>
                <div className="space-y-3">
                  {leaveRequests.length > 0 ? (
                    leaveRequests.map((request) => (
                      <div key={request._id} className="rounded-lg bg-amber-50 p-3 text-amber-700">
                        <p className="font-semibold">{request.title}</p>
                        <p className="text-sm">
                          {request.employeeId?.fullName || 'Employee'} • {request.type}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => approveLeaveRequest(request._id, 'approved')} className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white">Approve</button>
                          <button onClick={() => approveLeaveRequest(request._id, 'rejected')} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">Reject</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">No pending leave approvals.</div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Subjects</h3>
                <div className="space-y-3">
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <div key={subject._id || subject.id || subject.code} className="rounded-lg bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-800">{subject.name}</p>
                            <p className="text-sm text-slate-600">{subject.code}</p>
                          </div>
                          <button onClick={() => deleteResource(`/hod/subjects/${subject._id || subject.id}`, 'subject')} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">Delete</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-3 text-slate-500">No subjects found.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Classes</h3>
                <div className="space-y-3">
                  {classes.length > 0 ? (
                    classes.map((classItem) => (
                      <div key={classItem._id || classItem.id || classItem.name} className="rounded-lg bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-800">{classItem.name} {classItem.section ? `- ${classItem.section}` : ''}</p>
                            <p className="text-sm text-slate-600">{classItem.academicYear || 'Academic year not set'}</p>
                          </div>
                          <button onClick={() => deleteResource(`/hod/classes/${classItem._id || classItem.id}`, 'class')} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">Delete</button>
                        </div>
                        <div className="mt-3 grid gap-2 md:grid-cols-3">
                          <select multiple value={getAssignmentForm(classItem).teacherIds} onChange={(e) => setAssignmentForms({ ...assignmentForms, [classItem._id || classItem.id || '']: { ...getAssignmentForm(classItem), teacherIds: Array.from(e.target.selectedOptions, (option) => option.value) } })} className="rounded border border-slate-300 px-2 py-1 text-xs" size={2}>
                            {teachers.map((teacher) => <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>{teacher.fullName}</option>)}
                          </select>
                          <select multiple value={getAssignmentForm(classItem).subjectIds} onChange={(e) => setAssignmentForms({ ...assignmentForms, [classItem._id || classItem.id || '']: { ...getAssignmentForm(classItem), subjectIds: Array.from(e.target.selectedOptions, (option) => option.value) } })} className="rounded border border-slate-300 px-2 py-1 text-xs" size={2}>
                            {subjects.map((subject) => <option key={subject._id || subject.id} value={subject._id || subject.id}>{subject.name}</option>)}
                          </select>
                          <select multiple value={getAssignmentForm(classItem).studentIds} onChange={(e) => setAssignmentForms({ ...assignmentForms, [classItem._id || classItem.id || '']: { ...getAssignmentForm(classItem), studentIds: Array.from(e.target.selectedOptions, (option) => option.value) } })} className="rounded border border-slate-300 px-2 py-1 text-xs" size={2}>
                            {students.map((student) => <option key={student._id} value={student._id}>{student.fullName}</option>)}
                          </select>
                        </div>
                        <button onClick={() => updateClassAssignments(classItem)} className="mt-2 rounded bg-emerald-700 px-3 py-1 text-xs font-medium text-white">Save assignments</button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-3 text-slate-500">No classes found.</div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Students</h3>
                <div className="space-y-2">
                  {students.length ? students.map((student) => <div key={student._id} className="rounded-lg bg-slate-50 p-3"><p className="font-semibold text-slate-800">{student.fullName}</p><p className="text-sm text-slate-600">{student.email}</p></div>) : <p className="text-slate-500">No students created yet.</p>}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Timetable</h3>
                <div className="space-y-2">
                  {timetableEntries.length ? timetableEntries.map((entry) => <div key={entry._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><div><p className="font-semibold text-slate-800">{entry.day} {entry.startTime}-{entry.endTime}</p><p className="text-sm text-slate-600">{entry.classId?.name} • {entry.subjectId?.name} • {entry.teacherId?.fullName}{entry.room ? ` • Room ${entry.room}` : ''}</p></div><button onClick={() => deleteResource(`/hod/timetable/${entry._id}`, 'timetable entry')} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">Delete</button></div>) : <p className="text-slate-500">No timetable entries yet.</p>}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HODDashboard;
