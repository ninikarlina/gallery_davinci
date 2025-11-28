import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  uploader: mongoose.Types.ObjectId;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IImage>({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

export const Image = mongoose.models.Image || mongoose.model<IImage>('Image', imageSchema);
