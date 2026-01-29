import type { HydratedDocument } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { IPoll } from "../types/index.js";

const PollSchema = new Schema<IPoll>({
  question: {
    type: String,
    required: [true, "Cannot proceed without Question"],
    minlength: [5, "Question must be atleast 5 characters"],
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr: string[]) => arr.length >= 2 && arr.length <= 4,
      message: "Poll must have 2-4 options",
    },
  },
  timer: {
    type: Number,
    required: true,
    min: [10, "Timer must be at least 10 seconds"],
    max: [60, "Timer cannot exceed 60 seconds"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
  results: {
    type: Map,
    of: Number,
    default: () => new Map(),
  },
});

PollSchema.pre("validate", function (this: HydratedDocument<IPoll>) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(this.createdAt.getTime() + this.timer * 1000);
  }

  if (this.isNew && this.results.size === 0) {
    this.options.forEach((option: string) => {
      this.results.set(option, 0);
    });
  }
});

PollSchema.methods.getRemainingTime = function (
  this: HydratedDocument<IPoll>,
): number {
  const now = Date.now();
  const expiresAt = this.expiresAt.getTime();
  return Math.max(0, Math.floor((expiresAt - now) / 1000));
};

PollSchema.methods.hasExpired = function (
  this: HydratedDocument<IPoll>,
): boolean {
  return Date.now() >= this.expiresAt.getTime();
};

export const Poll = mongoose.model<IPoll>("Poll", PollSchema);
