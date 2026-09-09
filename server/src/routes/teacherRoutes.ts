import { Router } from 'express';
import {
  getAssignedClasses,
  getAssignedStudents,
  markAttendance,
  getStudentAttendanceHistory,
  addGrade,
  getStudentGrades,
  createNotice,
  getTeacherNotices,
  submitLeaveRequest,
  getMyLeaveRequests,
  getAssignedSubjects,
} from '../controllers/teacherController';
import { authorizeRoles, protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect, authorizeRoles('teacher'));

router.get('/classes', getAssignedClasses);
router.get('/students', getAssignedStudents);
router.post('/attendance', markAttendance);
router.get('/attendance/:studentId', getStudentAttendanceHistory);

router.post('/grades', addGrade);
router.get('/grades/:studentId', getStudentGrades);

router.get('/subjects', getAssignedSubjects);
router.post('/notices', createNotice);
router.get('/notices', getTeacherNotices);

router.post('/leave-requests', submitLeaveRequest);
router.get('/leave-requests', getMyLeaveRequests);

export default router;
