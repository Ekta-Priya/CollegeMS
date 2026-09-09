import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'hod' | 'teacher' | 'student';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  profilePhoto?: string;
  departmentId?: Types.ObjectId;
  assignedClassIds?: Types.ObjectId[];
  subjectIds?: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'hod', 'teacher', 'student'],
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedClassIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Class',
    }],
    subjectIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
