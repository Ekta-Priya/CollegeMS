import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import { generateToken } from '../utils/token';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const allowedRoles: UserRole[] = ['admin', 'hod', 'teacher', 'student'];

const sanitizeUser = (user: any) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  phone: user.phone,
  profilePhoto: user.profilePhoto,
  departmentId: user.departmentId?.toString?.() || null,
  assignedClassIds: user.assignedClassIds || [],
  subjectIds: user.subjectIds || [],
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, role, phone, departmentId } = req.body;

    if (!fullName || !email || !password || !role) {
      res.status(400).json({ message: 'fullName, email, password, and role are required' });
      return;
    }

    if (!allowedRoles.includes(role)) {
      res.status(400).json({ message: 'Invalid role provided' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      departmentId: departmentId || undefined,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error registering user',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error logging in',
      error: error.message,
    });
  }
};

export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { fullName, phone, profilePhoto } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (profilePhoto) user.profilePhoto = profilePhoto;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
