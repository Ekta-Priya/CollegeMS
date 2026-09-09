import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface ITokenPayload {
  id: string;
  fullName: string;
  email: string;
  role: IUser['role'];
  departmentId?: string | null;
}

export const generateToken = (user: Pick<IUser, '_id' | 'fullName' | 'email' | 'role' | 'departmentId'>): string => {
  const payload: ITokenPayload = {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId?.toString() || null,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'college_management_secret', {
    expiresIn: '7d',
  });
};
