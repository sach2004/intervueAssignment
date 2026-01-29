import mongoose, { Schema } from "mongoose";
import type { IVote } from "../types/index.js";

const VoteSchema = new Schema<IVote>({
  pollId: {
    type: String,
    required: true,
    index: true,
  },
  studentSocketId: {
    type: String,
    required: true,
    index: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  selectedOption: {
    type: String,
    required: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
});

VoteSchema.index({ pollId: 1, studentSocketId: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>("Vote", VoteSchema);
