import type { Document } from "mongoose";

export interface IPoll extends Document {
  question: string;
  options: string[];
  timer: number;
  createdAt: Date;
  expiresAt: Date;
  status: "active" | "completed";
  results: Map<string, number>;
  getRemainingTime(): number;
  hasExpired(): boolean;
}

export interface IVote extends Document {
  pollId: string;
  studentSocketId: string;
  studentName: string;
  selectedOption: string;
  votedAt: Date;
}

export interface IStudent extends Document {
  socketId: string;
  name: string;
  voted: boolean;
  joinedAt: Date;
}

export interface QuestionData {
  question: string;
  options: string[];
  timer: number;
}

export interface VoteData {
  option: string;
}

export interface StudentNameData {
  name: string;
}
