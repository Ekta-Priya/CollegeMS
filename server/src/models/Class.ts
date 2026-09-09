import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClass extends Document {
  name: string;
  section?: string;
  departmentId: Types.ObjectId;
  academicYear: string;
  studentIds: Types.ObjectId[];
  teacherIds: Types.ObjectId[];
  subjectIds: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
      default: '',
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    studentIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    teacherIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
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

const ClassModel = mongoose.model<IClass>('Class', classSchema);

export default ClassModel;
