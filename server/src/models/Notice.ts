import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  type: 'general' | 'department' | 'subject' | 'class';
  createdBy: Types.ObjectId;
  departmentId?: Types.ObjectId;
  classId?: Types.ObjectId;
  subjectId?: Types.ObjectId;
  targetAudience?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['general', 'department', 'subject', 'class'],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    },
    targetAudience: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Notice = mongoose.model<INotice>('Notice', noticeSchema);

export default Notice;
