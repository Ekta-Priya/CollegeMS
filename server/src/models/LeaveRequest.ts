import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILeaveRequest extends Document {
  employeeId: Types.ObjectId;
  departmentId?: Types.ObjectId;
  type: 'teacher' | 'timetable' | 'course';
  title: string;
  reason: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: Types.ObjectId;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    type: {
      type: String,
      enum: ['teacher', 'timetable', 'course'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    comments: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;
