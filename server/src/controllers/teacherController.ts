import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import ClassModel from '../models/Class';
import Attendance from '../models/Attendance';
import Grade from '../models/Grade';
import Notice from '../models/Notice';
import LeaveRequest from '../models/LeaveRequest';
import Subject from '../models/Subject';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getAssignedClasses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const classes = await ClassModel.find({ teacherIds: teacherId, isActive: true })
      .populate('studentIds', 'fullName email')
      .populate('subjectIds', 'name code');

    res.status(200).json({ classes });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch assigned classes', error: error.message });
  }
};

export const getAssignedStudents = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const { classId } = req.query;

    const filter: any = { teacherIds: teacherId, isActive: true };
    if (classId) filter._id = classId;

    const classes = await ClassModel.find(filter).populate('studentIds', 'fullName email departmentId');

    const students = classes.flatMap((cls) => cls.studentIds as any[]);
    res.status(200).json({ students });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch assigned students', error: error.message });
  }
};

export const markAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const { studentIds, classId, subjectId, date, status, notes } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !classId || !date || !status) {
      res.status(400).json({ message: 'studentIds, classId, date, and status are required' });
      return;
    }

    if (![classId, ...studentIds, subjectId].filter(Boolean).every((id) => mongoose.Types.ObjectId.isValid(id))) {
      res.status(400).json({ message: 'Class, subject, and student IDs must be valid' });
      return;
    }

    const assignedClass = await ClassModel.findOne({ _id: classId, teacherIds: teacherId, isActive: true });
    if (!assignedClass) {
      res.status(403).json({ message: 'You can only mark attendance for an assigned class' });
      return;
    }

    const assignedStudentIds = new Set(assignedClass.studentIds.map((id) => id.toString()));
    if (studentIds.some((studentId: string) => !assignedStudentIds.has(studentId))) {
      res.status(400).json({ message: 'One or more students do not belong to this class' });
      return;
    }

    if (subjectId && !assignedClass.subjectIds.some((id) => id.toString() === subjectId)) {
      res.status(400).json({ message: 'Subject does not belong to this class' });
      return;
    }

    const records = await Promise.all(
      studentIds.map(async (studentId: string) => {
        const record = await Attendance.create({
          studentId,
          classId,
          subjectId,
          teacherId,
          date: new Date(date),
          status,
          notes: notes || '',
        });

        return record;
      })
    );

    res.status(201).json({ message: 'Attendance marked successfully', records });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
};

export const getStudentAttendanceHistory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ studentId }).populate('subjectId', 'name code').sort({ date: -1 });
    res.status(200).json({ records });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch student attendance', error: error.message });
  }
};

export const addGrade = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const { studentId, subjectId, classId, examType, marksObtained, totalMarks, grade, remarks } = req.body;

    if (!studentId || !subjectId || !examType || marksObtained === undefined || totalMarks === undefined) {
      res.status(400).json({ message: 'studentId, subjectId, examType, marks, and total marks are required' });
      return;
    }

    if (![studentId, subjectId, classId].filter(Boolean).every((id) => mongoose.Types.ObjectId.isValid(id))) {
      res.status(400).json({ message: 'Student, subject, and class IDs must be valid' });
      return;
    }

    const assignedClass = classId
      ? await ClassModel.findOne({ _id: classId, teacherIds: teacherId, isActive: true })
      : null;
    if (!assignedClass) {
      res.status(403).json({ message: 'You can only add grades for an assigned class' });
      return;
    }

    if (!assignedClass.studentIds.some((id) => id.toString() === studentId)
      || !assignedClass.subjectIds.some((id) => id.toString() === subjectId)) {
      res.status(400).json({ message: 'Student and subject must belong to the selected class' });
      return;
    }

    if (Number(marksObtained) < 0 || Number(marksObtained) > Number(totalMarks) || Number(totalMarks) < 1) {
      res.status(400).json({ message: 'Marks must be between 0 and the total marks' });
      return;
    }

    const record = await Grade.create({
      studentId,
      subjectId,
      teacherId,
      classId,
      examType,
      marksObtained,
      totalMarks,
      grade: grade || 'A',
      remarks: remarks || '',
    });

    res.status(201).json({ message: 'Grade added successfully', record });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add grade', error: error.message });
  }
};

export const getStudentGrades = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const grades = await Grade.find({ studentId }).populate('subjectId', 'name code').sort({ createdAt: -1 });
    res.status(200).json({ grades });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch student grades', error: error.message });
  }
};

export const createNotice = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, type, departmentId, classId, subjectId } = req.body;

    if (!title || !content || !type) {
      res.status(400).json({ message: 'Title, content, and type are required' });
      return;
    }

    const notice = await Notice.create({
      title,
      content,
      type,
      createdBy: req.user?.id,
      departmentId,
      classId,
      subjectId,
    });

    res.status(201).json({ message: 'Notice created successfully', notice });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create notice', error: error.message });
  }
};

export const getTeacherNotices = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const notices = await Notice.find({
      $or: [
        { createdBy: teacherId },
        { type: 'general' },
        { type: 'department', departmentId: req.user?.departmentId },
      ],
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({ notices });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch notices', error: error.message });
  }
};

export const submitLeaveRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = req.user?.departmentId;
    const { type, title, reason, startDate, endDate } = req.body;

    if (!type || !title || !reason || !startDate || !endDate) {
      res.status(400).json({ message: 'Type, title, reason, start date, and end date are required' });
      return;
    }

    const request = await LeaveRequest.create({
      employeeId: req.user?.id,
      departmentId,
      type,
      title,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'pending',
    });

    res.status(201).json({ message: 'Leave request submitted successfully', request });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to submit leave request', error: error.message });
  }
};

export const getMyLeaveRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const requests = await LeaveRequest.find({ employeeId: req.user?.id }).sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
  }
};

export const getAssignedSubjects = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const subjects = await Subject.find({ teacherIds: teacherId, isActive: true }).populate('classIds', 'name section academicYear');
    res.status(200).json({ subjects });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch assigned subjects', error: error.message });
  }
};
