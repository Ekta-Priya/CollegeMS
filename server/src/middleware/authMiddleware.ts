import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token missing' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'college_management_secret'
    ) as {
      id: string;
      fullName: string;
      email: string;
      role: UserRole;
      departmentId?: string | null;
    };

    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'User not found or inactive' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId?.toString() || null,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
