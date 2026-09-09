import { Response } from 'express';
import User from '../models/User';
import Department from '../models/Department';
import Subject from '../models/Subject';
import ClassModel from '../models/Class';
import LeaveRequest from '../models/LeaveRequest';
import Attendance from '../models/Attendance';
import Grade from '../models/Grade';
import Timetable from '../models/Timetable';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const getDepartmentScope = (req: AuthenticatedRequest) => {
  if (!req.user?.departmentId) return null;
  return req.user.departmentId;
};

export const getDepartmentSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const [teacherCount, studentCount, subjectCount, classCount, leaveRequests] = await Promise.all([
      User.countDocuments({ role: 'teacher', departmentId, isActive: true }),
      User.countDocuments({ role: 'student', departmentId, isActive: true }),
      Subject.countDocuments({ departmentId, isActive: true }),
      ClassModel.countDocuments({ departmentId, isActive: true }),
      LeaveRequest.countDocuments({ departmentId, status: 'pending' }),
    ]);

    res.status(200).json({
      summary: {
        departmentId,
        teacherCount,
        studentCount,
        subjectCount,
        classCount,
        pendingLeaves: leaveRequests,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch department summary', error: error.message });
  }
};

export const getDepartmentTeachers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const teachers = await User.find({ role: 'teacher', departmentId }).select('-password');
    res.status(200).json({ teachers });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch department teachers', error: error.message });
  }
};

export const createTeacherAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'Full name, email, and password are required' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ message: 'Teacher with this email already exists' });
      return;
    }

    const teacher = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: 'teacher',
      phone,
      departmentId,
    });

    res.status(201).json({ message: 'Teacher account created successfully', teacher: {
      id: teacher._id.toString(),
      fullName: teacher.fullName,
      email: teacher.email,
      role: teacher.role,
      departmentId: teacher.departmentId?.toString(),
      isActive: teacher.isActive,
    } });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create teacher account', error: error.message });
  }
};

export const getDepartmentStudents = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const students = await User.find({ role: 'student', departmentId }).select('-password');
    res.status(200).json({ students });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch department students', error: error.message });
  }
};

export const createStudentAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    const { fullName, email, password, phone } = req.body;
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }
    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'Full name, email, and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }
    if (await User.exists({ email: email.trim().toLowerCase() })) {
      res.status(409).json({ message: 'A user with this email already exists' });
      return;
    }

    const student = await User.create({ fullName, email: email.trim().toLowerCase(), password, phone, role: 'student', departmentId });
    res.status(201).json({
      message: 'Student account created successfully',
      student: { id: student._id.toString(), fullName: student.fullName, email: student.email, role: student.role, departmentId: departmentId.toString(), isActive: student.isActive },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create student account', error: error.message });
  }
};

export const updateTeacherAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const { id } = req.params;
    const { fullName, phone, isActive } = req.body;

    const teacher = await User.findOne({ _id: id, role: 'teacher', departmentId });
    if (!teacher) {
      res.status(404).json({ message: 'Teacher not found in your department' });
      return;
    }

    if (fullName) teacher.fullName = fullName;
    if (phone !== undefined) teacher.phone = phone;
    if (isActive !== undefined) teacher.isActive = isActive;

    await teacher.save();

    res.status(200).json({ message: 'Teacher updated successfully', teacher: {
      id: teacher._id.toString(),
      fullName: teacher.fullName,
      email: teacher.email,
      role: teacher.role,
      departmentId: teacher.departmentId?.toString(),
      isActive: teacher.isActive,
    } });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update teacher account', error: error.message });
  }
};

export const deleteTeacherAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const teacher = await User.findOneAndDelete({ _id: req.params.id, role: 'teacher', departmentId });
    if (!teacher) {
      res.status(404).json({ message: 'Teacher not found in your department' });
      return;
    }

    await Promise.all([
      ClassModel.updateMany({ departmentId }, { $pull: { teacherIds: teacher._id } }),
      Subject.updateMany({ departmentId }, { $pull: { teacherIds: teacher._id } }),
      Attendance.deleteMany({ teacherId: teacher._id }),
      Grade.deleteMany({ teacherId: teacher._id }),
    ]);
    res.status(200).json({ message: 'Teacher account deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete teacher account', error: error.message });
  }
};

export const createSubject = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const { name, code } = req.body;
    if (!name || !code) {
      res.status(400).json({ message: 'Subject name and code are required' });
      return;
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      departmentId,
    });

    res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create subject', error: error.message });
  }
};

export const getDepartmentSubjects = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const subjects = await Subject.find({ departmentId }).populate('teacherIds', 'fullName email');
    res.status(200).json({ subjects });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: error.message });
  }
};

export const deleteSubject = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, departmentId });
    if (!subject) {
      res.status(404).json({ message: 'Subject not found in your department' });
      return;
    }

    await ClassModel.updateMany({ departmentId }, { $pull: { subjectIds: subject._id } });
    await Grade.deleteMany({ subjectId: subject._id });
    await Attendance.deleteMany({ subjectId: subject._id });
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete subject', error: error.message });
  }
};

export const createClass = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const { name, section, academicYear } = req.body;
    if (!name || !academicYear) {
      res.status(400).json({ message: 'Class name and academic year are required' });
      return;
    }

    const classDoc = await ClassModel.create({
      name,
      section,
      departmentId,
      academicYear,
    });

    res.status(201).json({ message: 'Class created successfully', class: classDoc });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create class', error: error.message });
  }
};

export const getDepartmentClasses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const classes = await ClassModel.find({ departmentId }).populate('studentIds', 'fullName email').populate('teacherIds', 'fullName email');
    res.status(200).json({ classes });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch classes', error: error.message });
  }
};

export const updateClassAssignments = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    const { teacherIds = [], studentIds = [], subjectIds = [] } = req.body;
    const allIds = [...teacherIds, ...studentIds, ...subjectIds];

    if (![...new Set(allIds)].every((id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id))) {
      res.status(400).json({ message: 'Assignments contain an invalid ID' });
      return;
    }

    const [teachers, students, subjects, classDoc] = await Promise.all([
      User.find({ _id: { $in: teacherIds }, role: 'teacher', departmentId }),
      User.find({ _id: { $in: studentIds }, role: 'student', departmentId }),
      Subject.find({ _id: { $in: subjectIds }, departmentId }),
      ClassModel.findOne({ _id: req.params.id, departmentId }),
    ]);

    if (!classDoc || teachers.length !== teacherIds.length || students.length !== studentIds.length || subjects.length !== subjectIds.length) {
      res.status(400).json({ message: 'One or more selected records do not belong to this department' });
      return;
    }

    classDoc.teacherIds = teacherIds;
    classDoc.studentIds = studentIds;
    classDoc.subjectIds = subjectIds;
    await classDoc.save();

    await Promise.all([
      Subject.updateMany({ departmentId }, { $pull: { classIds: classDoc._id } }),
      Subject.updateMany({ _id: { $in: subjectIds } }, { $addToSet: { classIds: classDoc._id, teacherIds: { $each: teacherIds } } }),
      User.updateMany({ role: 'teacher', departmentId }, { $pull: { assignedClassIds: classDoc._id } }),
      User.updateMany({ _id: { $in: teacherIds } }, { $addToSet: { assignedClassIds: classDoc._id } }),
      User.updateMany({ role: 'student', departmentId }, { $pull: { assignedClassIds: classDoc._id } }),
      User.updateMany({ _id: { $in: studentIds } }, { $addToSet: { assignedClassIds: classDoc._id } }),
    ]);

    res.status(200).json({ message: 'Class assignments updated successfully', class: classDoc });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update class assignments', error: error.message });
  }
};

export const deleteClass = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    const classDoc = await ClassModel.findOneAndDelete({ _id: req.params.id, departmentId });
    if (!classDoc) {
      res.status(404).json({ message: 'Class not found in your department' });
      return;
    }

    await Promise.all([
      User.updateMany({ departmentId }, { $pull: { assignedClassIds: classDoc._id } }),
      Subject.updateMany({ departmentId }, { $pull: { classIds: classDoc._id } }),
      Attendance.deleteMany({ classId: classDoc._id }),
      Grade.deleteMany({ classId: classDoc._id }),
    ]);
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete class', error: error.message });
  }
};

export const createTimetableEntry = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    const { classId, subjectId, teacherId, day, startTime, endTime, room } = req.body;
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }
    if (!classId || !subjectId || !teacherId || !day || !startTime || !endTime) {
      res.status(400).json({ message: 'Class, subject, teacher, day, start time, and end time are required' });
      return;
    }

    const [classDoc, subject, teacher] = await Promise.all([
      ClassModel.findOne({ _id: classId, departmentId, isActive: true }),
      Subject.findOne({ _id: subjectId, departmentId, isActive: true }),
      User.findOne({ _id: teacherId, departmentId, role: 'teacher', isActive: true }),
    ]);
    if (!classDoc || !subject || !teacher || !classDoc.subjectIds.some((id) => id.toString() === subjectId) || !classDoc.teacherIds.some((id) => id.toString() === teacherId)) {
      res.status(400).json({ message: 'Selected class, subject, and teacher must belong to this department and class' });
      return;
    }

    const entry = await Timetable.create({ departmentId, classId, subjectId, teacherId, day, startTime, endTime, room });
    res.status(201).json({ message: 'Timetable entry created successfully', entry });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create timetable entry', error: error.message });
  }
};

export const getDepartmentTimetable = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    const entries = await Timetable.find({ departmentId, isActive: true })
      .populate('classId', 'name section academicYear')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'fullName email')
      .sort({ day: 1, startTime: 1 });
    res.status(200).json({ entries });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch timetable', error: error.message });
  }
};

export const deleteTimetableEntry = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const entry = await Timetable.findOneAndDelete({ _id: req.params.id, departmentId: getDepartmentScope(req) });
    if (!entry) {
      res.status(404).json({ message: 'Timetable entry not found' });
      return;
    }
    res.status(200).json({ message: 'Timetable entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete timetable entry', error: error.message });
  }
};

export const getPendingLeaveRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const requests = await LeaveRequest.find({ departmentId, status: 'pending' }).populate('employeeId', 'fullName email role');
    res.status(200).json({ requests });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch pending leave requests', error: error.message });
  }
};

export const reviewLeaveRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = getDepartmentScope(req);
    if (!departmentId) {
      res.status(400).json({ message: 'HOD is not assigned to a department' });
      return;
    }

    const { id } = req.params;
    const { status, comments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Status must be approved or rejected' });
      return;
    }

    const request = await LeaveRequest.findOne({ _id: id, departmentId });
    if (!request) {
      res.status(404).json({ message: 'Leave request not found in your department' });
      return;
    }

    request.status = status;
    request.comments = comments || '';
    request.approvedBy = req.user?.id as any;
    await request.save();

    res.status(200).json({ message: `Leave request ${status}`, request });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to review leave request', error: error.message });
  }
};
