import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import Department from '../models/Department';
import User from '../models/User';
import ClassModel from '../models/Class';
import Subject from '../models/Subject';

dotenv.config();

const demoAccounts = [
  { role: 'admin', fullName: 'System Admin', email: 'admin@college.edu', password: 'Admin@123' },
  { role: 'hod', fullName: 'Computer Science HOD', email: 'hod@college.edu', password: 'Hod@123' },
  { role: 'teacher', fullName: 'Ava Thompson', email: 'teacher@college.edu', password: 'Teacher@123' },
  { role: 'student', fullName: 'Emma Carter', email: 'student@college.edu', password: 'Student@123' },
] as const;

const ensureDemoUser = async (
  account: (typeof demoAccounts)[number],
  departmentId?: mongoose.Types.ObjectId,
) => {
  const user = await User.findOne({ email: account.email })
    || new User({ ...account, isActive: true });

  user.fullName = account.fullName;
  user.role = account.role;
  user.password = account.password;
  user.isActive = true;

  if (departmentId) {
    user.departmentId = departmentId;
  }

  await user.save();
  return user;
};

const seedDemoData = async () => {
  await connectDB();

  const department = await Department.findOne({ code: 'CSE' })
    || await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Demo department for the college management system.',
    });

  const admin = await ensureDemoUser(demoAccounts[0]);
  const hod = await ensureDemoUser(demoAccounts[1], department._id);
  const teacher = await ensureDemoUser(demoAccounts[2], department._id);
  const student = await ensureDemoUser(demoAccounts[3], department._id);

  if (!department.hodId) {
    department.hodId = hod._id;
    await department.save();
  }

  const subject = await Subject.findOne({ code: 'DBMS' })
    || await Subject.create({
      name: 'Database Management Systems',
      code: 'DBMS',
      departmentId: department._id,
      teacherIds: [teacher._id],
    });

  const classDoc = await ClassModel.findOne({ name: 'FY-CS-A' })
    || await ClassModel.create({
      name: 'FY-CS-A',
      section: 'A',
      departmentId: department._id,
      academicYear: '2025-2026',
      teacherIds: [teacher._id],
      studentIds: [student._id],
      subjectIds: [subject._id],
    });

  if (!teacher.assignedClassIds?.some((id) => id.toString() === classDoc._id.toString())) {
    teacher.assignedClassIds = [...(teacher.assignedClassIds || []), classDoc._id];
    await teacher.save();
  }

  if (!student.assignedClassIds?.some((id) => id.toString() === classDoc._id.toString())) {
    student.assignedClassIds = [...(student.assignedClassIds || []), classDoc._id];
    await student.save();
  }

  if (!subject.classIds?.some((id) => id.toString() === classDoc._id.toString())) {
    subject.classIds = [...(subject.classIds || []), classDoc._id];
    await subject.save();
  }

  if (!classDoc.studentIds.some((id) => id.toString() === student._id.toString())) {
    classDoc.studentIds.push(student._id);
    await classDoc.save();
  }

  if (!classDoc.teacherIds.some((id) => id.toString() === teacher._id.toString())) {
    classDoc.teacherIds.push(teacher._id);
    await classDoc.save();
  }

  console.log('Demo accounts ready.');
  console.log('Admin: admin@college.edu / Admin@123');
  console.log('HOD: hod@college.edu / Hod@123');
  console.log('Teacher: teacher@college.edu / Teacher@123');
  console.log('Student: student@college.edu / Student@123');

  await mongoose.disconnect();
};

seedDemoData().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
