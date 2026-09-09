import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  studentId: Types.ObjectId;
  classId?: Types.ObjectId;
  subjectId?: Types.ObjectId;
  teacherId?: Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;
