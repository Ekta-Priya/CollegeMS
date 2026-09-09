import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        fullName: string;
        email: string;
        role: 'admin' | 'hod' | 'teacher' | 'student';
        departmentId?: string | null;
      };
    }
  }
}

export {};
