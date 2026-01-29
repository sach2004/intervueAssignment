export interface Poll {
  _id: string;
  question: string;
  options: string[];
  timer: number;
  remainingTime: number;
  status: "active" | "completed";
  results: { [key: string]: number };
}

export interface QuestionData {
  question: string;
  options: string[];
  timer: number;
}

export interface VoteData {
  option: string;
}
