import { Response } from 'express';
import User from '../models/User';
import ClassModel from '../models/Class';
import Subject from '../models/Subject';
import Attendance from '../models/Attendance';
import Grade from '../models/Grade';
import Notice from '../models/Notice';
import Department from '../models/Department';
import Timetable from '../models/Timetable';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getStudentDashboard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.id;

    const student = await User.findById(studentId).populate('departmentId', 'name code');
    const classes = await ClassModel.find({ studentIds: studentId, isActive: true }).populate('subjectIds', 'name code');
    const attendance = await Attendance.find({ studentId }).lean();
    const grades = await Grade.find({ studentId }).populate('subjectId', 'name code').lean();

    res.status(200).json({
      student,
      classes,
      attendanceCount: attendance.length,
      gradeCount: grades.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
  }
};

export const getMyTimetable = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const timetable = await Timetable.find({ classId: { $in: await ClassModel.find({ studentIds: studentId, isActive: true }).distinct('_id') }, isActive: true })
      .populate('classId', 'name section academicYear')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'fullName email')
      .sort({ day: 1, startTime: 1 });

    res.status(200).json({ timetable });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch timetable', error: error.message });
  }
};

export const getMyAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const records = await Attendance.find({ studentId }).populate('subjectId', 'name code').sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const percentage = total ? Math.round((present / total) * 100) : 0;

    res.status(200).json({
      total,
      present,
      percentage,
      records,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

export const getMyGrades = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const grades = await Grade.find({ studentId }).populate('subjectId', 'name code').sort({ createdAt: -1 });
    res.status(200).json({ grades });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch grades', error: error.message });
  }
};

export const getMyNotices = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = req.user?.departmentId;
    const notices = await Notice.find({
      $or: [
        { type: 'general' },
        { type: 'department', departmentId },
        { type: 'class', classId: { $in: await ClassModel.find({ studentIds: req.user?.id }).distinct('_id') } },
      ],
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({ notices });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch notices', error: error.message });
  }
};

export const getMySubjects = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const subjects = await Subject.find({ classIds: { $in: await ClassModel.find({ studentIds: studentId }).distinct('_id') }, isActive: true })
      .populate('teacherIds', 'fullName email');

    res.status(200).json({ subjects });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: error.message });
  }
};

export const getDepartmentInfo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = req.user?.departmentId;
    if (!departmentId) {
      res.status(400).json({ message: 'Student is not assigned to a department' });
      return;
    }

    const department = await Department.findById(departmentId).populate('hodId', 'fullName email');
    res.status(200).json({ department });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch department info', error: error.message });
  }
};
