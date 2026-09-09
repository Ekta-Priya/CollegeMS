import { Router } from 'express';
import {
  getStudentDashboard,
  getMyTimetable,
  getMyAttendance,
  getMyGrades,
  getMyNotices,
  getMySubjects,
  getDepartmentInfo,
} from '../controllers/studentController';
import { authorizeRoles, protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect, authorizeRoles('student'));

router.get('/dashboard', getStudentDashboard);
router.get('/timetable', getMyTimetable);
router.get('/attendance', getMyAttendance);
router.get('/grades', getMyGrades);
router.get('/notices', getMyNotices);
router.get('/subjects', getMySubjects);
router.get('/department', getDepartmentInfo);

export default router;
