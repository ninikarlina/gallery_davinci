import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  pages: number;
  downloads: number;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>({
  author: {
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
    required: true,
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
  pages: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

export const Book = mongoose.models.Book || mongoose.model<IBook>('Book', bookSchema);
