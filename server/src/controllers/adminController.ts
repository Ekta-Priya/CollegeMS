import { Response } from 'express';
import mongoose from 'mongoose';
import Department from '../models/Department';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const sanitizeDepartment = (department: any) => ({
  id: department._id.toString(),
  name: department.name,
  code: department.code,
  description: department.description,
  hodId: department.hodId ? department.hodId.toString() : null,
  isActive: department.isActive,
  createdAt: department.createdAt,
  updatedAt: department.updatedAt,
});

export const getSystemStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const [departments, hods, teachers, students, classes] = await Promise.all([
      Department.countDocuments(),
      User.countDocuments({ role: 'hod' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      (await import('../models/Class')).default.countDocuments(),
    ]);

    res.status(200).json({
      stats: {
        departments,
        hods,
        teachers,
        students,
        classes,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch system stats', error: error.message });
  }
};

export const getAllDepartments = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departments = await Department.find().populate('hodId', 'fullName email');
    res.status(200).json({ departments: departments.map(sanitizeDepartment) });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
  }
};

export const createDepartment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, code, description, hodId } = req.body;

    if (!name || !code) {
      res.status(400).json({ message: 'Department name and code are required' });
      return;
    }

    const existing = await Department.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
    if (existing) {
      res.status(409).json({ message: 'Department with that name or code already exists' });
      return;
    }

    if (hodId) {
      if (!mongoose.Types.ObjectId.isValid(hodId)) {
        res.status(400).json({ message: 'Invalid HOD selected' });
        return;
      }

      const hod = await User.findOne({ _id: hodId, role: 'hod' });
      if (!hod) {
        res.status(400).json({ message: 'Selected HOD account was not found' });
        return;
      }
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      hodId,
    });

    res.status(201).json({ message: 'Department created successfully', department: sanitizeDepartment(department) });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create department', error: error.message });
  }
};

export const updateDepartment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, description, hodId, isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      res.status(404).json({ message: 'Department not found' });
      return;
    }

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (hodId !== undefined) department.hodId = hodId;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    res.status(200).json({ message: 'Department updated successfully', department: sanitizeDepartment(department) });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update department', error: error.message });
  }
};

export const deleteDepartment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const [users, subjects, classes] = await Promise.all([
      User.countDocuments({ departmentId: id }),
      (await import('../models/Subject')).default.countDocuments({ departmentId: id }),
      (await import('../models/Class')).default.countDocuments({ departmentId: id }),
    ]);

    if (users || subjects || classes) {
      res.status(409).json({ message: 'Remove the department users, subjects, and classes before deleting it' });
      return;
    }

    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      res.status(404).json({ message: 'Department not found' });
      return;
    }

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete department', error: error.message });
  }
};

export const getHodAccounts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const hods = await User.find({ role: 'hod' }).populate('departmentId', 'name code');

    const mappedHods = hods.map((user) => {
      const department = user.departmentId as any;

      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        departmentId: department
          ? {
              id: department._id?.toString?.() || department.toString(),
              name: department.name,
              code: department.code,
            }
          : null,
        isActive: user.isActive,
        createdAt: user.createdAt,
      };
    });

    res.status(200).json({ hods: mappedHods });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch HOD accounts', error: error.message });
  }
};

export const createHodAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { fullName, email, password, phone, departmentId } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'Full name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
      res.status(400).json({ message: 'Invalid department selected' });
      return;
    }

    if (departmentId && !(await Department.exists({ _id: departmentId }))) {
      res.status(400).json({ message: 'Selected department was not found' });
      return;
    }

    const alreadyExists = await User.findOne({ email: email.toLowerCase() });
    if (alreadyExists) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: 'hod',
      phone,
      departmentId,
    });

    res.status(201).json({ message: 'HOD account created successfully', user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId?.toString() || null,
      isActive: user.isActive,
    } });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }
    res.status(500).json({ message: 'Failed to create HOD account', error: error.message });
  }
};

export const updateHodAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, phone, departmentId, isActive } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== 'hod') {
      res.status(404).json({ message: 'HOD account not found' });
      return;
    }

    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (departmentId !== undefined) user.departmentId = departmentId;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({ message: 'HOD account updated successfully', user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId?.toString() || null,
      isActive: user.isActive,
    } });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update HOD account', error: error.message });
  }
};

export const deleteHodAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const hod = await User.findOneAndDelete({ _id: id, role: 'hod' });
    if (!hod) {
      res.status(404).json({ message: 'HOD account not found' });
      return;
    }

    await Department.updateMany({ hodId: hod._id }, { $set: { hodId: null } });
    res.status(200).json({ message: 'HOD account deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete HOD account', error: error.message });
  }
};
