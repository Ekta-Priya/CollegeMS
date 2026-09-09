import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface TimetableClass {
  _id: string;
  name: string;
  section?: string;
  academicYear?: string;
  subjectIds?: Array<{ _id: string; name: string; code: string }>;
  teacherIds?: Array<{ _id: string; fullName: string; email: string }>;
}

interface AttendanceRecord {
  _id: string;
  status: string;
  date?: string;
  subjectId?: { name?: string; code?: string } | null;
}

interface GradeRecord {
  _id: string;
  grade?: string;
  examType?: string;
  marksObtained?: number;
  totalMarks?: number;
  subjectId?: { name?: string; code?: string } | null;
}

interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  type: string;
}

interface DepartmentInfo {
  name?: string;
  code?: string;
  hodId?: { fullName?: string; email?: string } | null;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [timetable, setTimetable] = useState<TimetableClass[]>([]);
  const [attendance, setAttendance] = useState<{ percentage: number; total: number; present: number; records: AttendanceRecord[] }>({
    percentage: 0,
    total: 0,
    present: 0,
    records: [],
  });
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [department, setDepartment] = useState<DepartmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          api.get('/student/timetable'),
          api.get('/student/attendance'),
          api.get('/student/grades'),
          api.get('/student/notices'),
          api.get('/student/department'),
        ]);

        const [timetableRes, attendanceRes, gradesRes, noticesRes, departmentRes] = results;
        if (timetableRes.status === 'fulfilled') setTimetable(timetableRes.value.data.timetable || []);
        if (attendanceRes.status === 'fulfilled') setAttendance(attendanceRes.value.data || { percentage: 0, total: 0, present: 0, records: [] });
        if (gradesRes.status === 'fulfilled') setGrades(gradesRes.value.data.grades || []);
        if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value.data.notices || []);
        if (departmentRes.status === 'fulfilled') setDepartment(departmentRes.value.data.department || null);

        const failedRequest = results.find((result) => result.status === 'rejected');
        if (failedRequest?.status === 'rejected') {
          setError(failedRequest.reason?.response?.data?.message || 'Some academic data could not be loaded');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load student dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Attendance', value: `${attendance.percentage}%` },
    { label: 'Subjects', value: timetable.reduce((total, cls) => total + (cls.subjectIds?.length || 0), 0) },
    { label: 'Grades', value: grades.length },
    { label: 'Notices', value: notices.length },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl bg-sky-700 p-6 text-white shadow-lg">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Student Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">My Academic Overview</h1>
            <p className="mt-1 text-sm text-sky-100">Welcome, {user?.fullName || 'Student'}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-sky-400 bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/20"
          >
            Logout
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-md ring-1 ring-slate-200">
            Loading academic data...
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
              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Timetable</h3>
                <div className="space-y-3">
                  {timetable.length > 0 ? (
                    timetable.map((classItem) => (
                      <div key={classItem._id} className="rounded-lg bg-slate-50 p-3">
                        <p className="font-semibold text-slate-800">{classItem.name}</p>
                        <p className="text-sm text-slate-600">
                          {classItem.subjectIds?.map((s) => s.name).join(', ') || 'No subjects assigned'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-3 text-slate-500">No timetable data available.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Announcements</h3>
                <div className="space-y-3">
                  {notices.length > 0 ? (
                    notices.map((notice) => (
                      <div key={notice._id} className="rounded-lg bg-sky-50 p-3 text-sky-700">
                        <p className="font-semibold">{notice.title}</p>
                        <p className="text-sm">{notice.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-sky-50 p-3 text-sky-700">No announcements yet.</div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Attendance Summary</h3>
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-slate-800">{attendance.present}/{attendance.total} present</p>
                  <p className="text-sm text-slate-600">Overall attendance: {attendance.percentage}%</p>
                  {attendance.records.slice(0, 3).map((record) => (
                    <div key={record._id} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      {record.subjectId?.name || 'Subject'} • {record.status}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h3 className="mb-4 text-xl font-semibold text-slate-800">Department Info</h3>
                <div className="space-y-3">
                  {department ? (
                    <>
                      <p className="font-semibold text-slate-800">{department.name} ({department.code})</p>
                      <p className="text-sm text-slate-600">
                        HOD: {department.hodId?.fullName || 'Not assigned'}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-500">No department information available.</p>
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

export default StudentDashboard;
