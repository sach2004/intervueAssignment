import mongoose, { Schema } from "mongoose";
import type { IStudent } from "../types/index.js";

const StudentSchema = new Schema<IStudent>({
  socketId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  voted: {
    type: Boolean,
    default: false,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Student = mongoose.model<IStudent>("Student", StudentSchema);
