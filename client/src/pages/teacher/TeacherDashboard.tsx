import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface AssignedClass {
  _id: string;
  name: string;
  section?: string;
  academicYear?: string;
  studentIds?: Array<{ _id: string; fullName: string; email: string }>;
  subjectIds?: Array<{ _id: string; name: string; code: string }>;
}

interface SubjectItem {
  _id: string;
  name: string;
  code: string;
  classIds?: Array<{ _id: string; name: string; section?: string }>;
}

interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  type: string;
  createdAt?: string;
}

interface LeaveRequestItem {
  _id: string;
  title: string;
  type: string;
  reason: string;
  status: string;
  createdAt?: string;
}

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState<AssignedClass[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', type: 'general' });
  const [leaveForm, setLeaveForm] = useState({ type: 'teacher', title: '', reason: '', startDate: '', endDate: '' });
  const [attendanceForm, setAttendanceForm] = useState({ classId: '', subjectId: '', studentIds: [] as string[], date: '', status: 'present', notes: '' });
  const [gradeForm, setGradeForm] = useState({ studentId: '', subjectId: '', classId: '', examType: 'Midterm', marksObtained: '', totalMarks: '', grade: 'A', remarks: '' });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get('/teacher/classes'),
        api.get('/teacher/subjects'),
        api.get('/teacher/notices'),
        api.get('/teacher/leave-requests'),
      ]);

      const [classesRes, subjectsRes, noticesRes, leaveRes] = results;
      if (classesRes.status === 'fulfilled') setClasses(classesRes.value.data.classes || []);
      if (subjectsRes.status === 'fulfilled') setSubjects(subjectsRes.value.data.subjects || []);
      if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value.data.notices || []);
      if (leaveRes.status === 'fulfilled') setLeaveRequests(leaveRes.value.data.requests || []);

      const failedRequest = results.find((result) => result.status === 'rejected');
      if (failedRequest?.status === 'rejected') {
        setError(failedRequest.reason?.response?.data?.message || 'Some teacher data could not be loaded');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load teacher dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNoticeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/teacher/notices', noticeForm);
      setNoticeForm({ title: '', content: '', type: 'general' });
      setSuccess('Notice posted successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create notice');
    }
  };

  const handleLeaveSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/teacher/leave-requests', leaveForm);
      setLeaveForm({ type: 'teacher', title: '', reason: '', startDate: '', endDate: '' });
      setSuccess('Leave request submitted successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleAttendanceSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/teacher/attendance', {
        studentIds: attendanceForm.studentIds,
        classId: attendanceForm.classId,
        subjectId: attendanceForm.subjectId,
        date: attendanceForm.date,
        status: attendanceForm.status,
        notes: attendanceForm.notes,
      });

      setAttendanceForm({ classId: '', subjectId: '', studentIds: [], date: '', status: 'present', notes: '' });
      setSuccess('Attendance marked successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleGradeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/teacher/grades', {
        ...gradeForm,
        marksObtained: Number(gradeForm.marksObtained),
        totalMarks: Number(gradeForm.totalMarks),
      });

      setGradeForm({ studentId: '', subjectId: '', classId: '', examType: 'Midterm', marksObtained: '', totalMarks: '', grade: 'A', remarks: '' });
      setSuccess('Grade added successfully.');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add grade');
    }
  };

  const totalStudents = classes.reduce((sum, item) => sum + (item.studentIds?.length || 0), 0);
  const selectedAttendanceClass = classes.find((item) => item._id === attendanceForm.classId);
  const selectedGradeClass = classes.find((item) => item._id === gradeForm.classId);

  const statCards = [
    { label: 'Classes', value: classes.length },
    { label: 'Students', value: totalStudents },
    { label: 'Subjects', value: subjects.length },
    { label: 'Announcements', value: notices.length },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl bg-violet-700 p-6 text-white shadow-lg">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-100">Teacher Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Classroom Management</h1>
            <p className="mt-1 text-sm text-violet-100">Welcome, {user?.fullName || 'Teacher'}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-violet-400 bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/20"
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
            Loading classroom data...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              {statCards.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-800">{item.value}</h2>
                </div>
              ))}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleAttendanceSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Mark Attendance</h3>
                <div className="space-y-3">
                  <select value={attendanceForm.classId} onChange={(e) => setAttendanceForm({ ...attendanceForm, classId: e.target.value, subjectId: '', studentIds: [] })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Select class</option>
                    {classes.map((classItem) => <option key={classItem._id} value={classItem._id}>{classItem.name} {classItem.section ? `- ${classItem.section}` : ''}</option>)}
                  </select>
                  <select value={attendanceForm.subjectId} onChange={(e) => setAttendanceForm({ ...attendanceForm, subjectId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Select subject (optional)</option>
                    {(selectedAttendanceClass?.subjectIds || []).map((subject) => <option key={subject._id} value={subject._id}>{subject.name} ({subject.code})</option>)}
                  </select>
                  <select multiple value={attendanceForm.studentIds} onChange={(e) => setAttendanceForm({ ...attendanceForm, studentIds: Array.from(e.target.selectedOptions, (option) => option.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2" size={Math.min(selectedAttendanceClass?.studentIds?.length || 3, 5)}>
                    {(selectedAttendanceClass?.studentIds || []).map((student) => <option key={student._id} value={student._id}>{student.fullName} ({student.email})</option>)}
                  </select>
                  <input type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <select value={attendanceForm.status} onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                  <textarea value={attendanceForm.notes} onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Notes" rows={2} />
                  <button type="submit" className="w-full rounded-lg bg-violet-700 px-4 py-2 font-medium text-white hover:bg-violet-600">Submit Attendance</button>
                </div>
              </form>

              <form onSubmit={handleGradeSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Add Grade</h3>
                <div className="space-y-3">
                  <select value={gradeForm.classId} onChange={(e) => setGradeForm({ ...gradeForm, classId: e.target.value, studentId: '', subjectId: '' })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Select class</option>
                    {classes.map((classItem) => <option key={classItem._id} value={classItem._id}>{classItem.name} {classItem.section ? `- ${classItem.section}` : ''}</option>)}
                  </select>
                  <select value={gradeForm.studentId} onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Select student</option>
                    {(selectedGradeClass?.studentIds || []).map((student) => <option key={student._id} value={student._id}>{student.fullName} ({student.email})</option>)}
                  </select>
                  <select value={gradeForm.subjectId} onChange={(e) => setGradeForm({ ...gradeForm, subjectId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Select subject</option>
                    {(selectedGradeClass?.subjectIds || []).map((subject) => <option key={subject._id} value={subject._id}>{subject.name} ({subject.code})</option>)}
                  </select>
                  <input value={gradeForm.examType} onChange={(e) => setGradeForm({ ...gradeForm, examType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Exam type" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={gradeForm.marksObtained} onChange={(e) => setGradeForm({ ...gradeForm, marksObtained: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Marks" />
                    <input type="number" value={gradeForm.totalMarks} onChange={(e) => setGradeForm({ ...gradeForm, totalMarks: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Total" />
                  </div>
                  <input value={gradeForm.grade} onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Grade" />
                  <textarea value={gradeForm.remarks} onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Remarks" rows={2} />
                  <button type="submit" className="w-full rounded-lg bg-violet-700 px-4 py-2 font-medium text-white hover:bg-violet-600">Save Grade</button>
                </div>
              </form>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleNoticeSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Post Announcement</h3>
                <div className="space-y-3">
                  <input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Title" />
                  <textarea value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Content" rows={3} />
                  <select value={noticeForm.type} onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="general">General</option>
                    <option value="department">Department</option>
                    <option value="class">Class</option>
                  </select>
                  <button type="submit" className="w-full rounded-lg bg-violet-700 px-4 py-2 font-medium text-white hover:bg-violet-600">Post Notice</button>
                </div>
              </form>

              <form onSubmit={handleLeaveSubmit} className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Submit Leave Request</h3>
                <div className="space-y-3">
                  <select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="teacher">Teacher</option>
                    <option value="timetable">Timetable</option>
                    <option value="course">Course</option>
                  </select>
                  <input value={leaveForm.title} onChange={(e) => setLeaveForm({ ...leaveForm, title: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Leave title" />
                  <textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Reason" rows={3} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                    <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-violet-700 px-4 py-2 font-medium text-white hover:bg-violet-600">Submit Leave</button>
                </div>
              </form>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Assigned Classes</h3>
                <div className="space-y-3">
                  {classes.length > 0 ? (
                    classes.map((classItem) => (
                      <div key={classItem._id} className="rounded-lg bg-slate-50 p-3">
                        <p className="font-semibold text-slate-800">
                          {classItem.name} {classItem.section ? `• ${classItem.section}` : ''}
                        </p>
                        <p className="text-sm text-slate-600">
                          {classItem.studentIds?.length || 0} students • {classItem.subjectIds?.length || 0} subjects
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-3 text-slate-500">No assigned classes.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Announcements</h3>
                <div className="space-y-3">
                  {notices.length > 0 ? (
                    notices.map((notice) => (
                      <div key={notice._id} className="rounded-lg bg-violet-50 p-3 text-violet-700">
                        <p className="font-semibold">{notice.title}</p>
                        <p className="text-sm">{notice.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-violet-50 p-3 text-violet-700">No announcements yet.</div>
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
                      <div key={subject._id} className="rounded-lg bg-slate-50 p-3">
                        <p className="font-semibold text-slate-800">{subject.name}</p>
                        <p className="text-sm text-slate-600">{subject.code}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-3 text-slate-500">No assigned subjects.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">My Leave Requests</h3>
                <div className="space-y-3">
                  {leaveRequests.length > 0 ? (
                    leaveRequests.map((request) => (
                      <div key={request._id} className="rounded-lg bg-amber-50 p-3 text-amber-700">
                        <p className="font-semibold">{request.title}</p>
                        <p className="text-sm">{request.type}</p>
                        <p className="mt-1 text-xs">Status: {request.status}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-amber-50 p-3 text-amber-700">No leave requests submitted.</div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
