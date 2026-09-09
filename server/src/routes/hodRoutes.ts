import { Router } from 'express';
import {
  getDepartmentSummary,
  getDepartmentTeachers,
  createTeacherAccount,
  updateTeacherAccount,
  deleteTeacherAccount,
  createSubject,
  getDepartmentSubjects,
  deleteSubject,
  createClass,
  getDepartmentClasses,
  getDepartmentStudents,
  createStudentAccount,
  updateClassAssignments,
  createTimetableEntry,
  getDepartmentTimetable,
  deleteTimetableEntry,
  deleteClass,
  getPendingLeaveRequests,
  reviewLeaveRequest,
} from '../controllers/hodController';
import { authorizeRoles, protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect, authorizeRoles('hod'));

router.get('/summary', getDepartmentSummary);
router.get('/teachers', getDepartmentTeachers);
router.post('/teachers', createTeacherAccount);
router.put('/teachers/:id', updateTeacherAccount);
router.delete('/teachers/:id', deleteTeacherAccount);

router.get('/subjects', getDepartmentSubjects);
router.post('/subjects', createSubject);
router.delete('/subjects/:id', deleteSubject);

router.get('/classes', getDepartmentClasses);
router.post('/classes', createClass);
router.get('/students', getDepartmentStudents);
router.post('/students', createStudentAccount);
router.put('/classes/:id/assignments', updateClassAssignments);
router.get('/timetable', getDepartmentTimetable);
router.post('/timetable', createTimetableEntry);
router.delete('/timetable/:id', deleteTimetableEntry);
router.delete('/classes/:id', deleteClass);

router.get('/leave-requests', getPendingLeaveRequests);
router.put('/leave-requests/:id', reviewLeaveRequest);

export default router;
