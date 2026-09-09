import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGrade extends Document {
  studentId: Types.ObjectId;
  subjectId: Types.ObjectId;
  teacherId?: Types.ObjectId;
  classId?: Types.ObjectId;
  examType: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const gradeSchema = new Schema<IGrade>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    examType: {
      type: String,
      required: true,
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Grade = mongoose.model<IGrade>('Grade', gradeSchema);

export default Grade;
