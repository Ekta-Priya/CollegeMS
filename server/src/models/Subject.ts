import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  departmentId: Types.ObjectId;
  teacherIds: Types.ObjectId[];
  classIds: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    teacherIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    classIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Class',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Subject = mongoose.model<ISubject>('Subject', subjectSchema);

export default Subject;
