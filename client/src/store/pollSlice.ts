import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { Poll } from "../types/types";

interface PollState {
  currentPoll: Poll | null;
  remainingTime: number;
  hasVoted: boolean;
  selectedOption: string | null;
}

const initialState: PollState = {
  currentPoll: null,
  remainingTime: 0,
  hasVoted: false,
  selectedOption: null,
};

const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    setPoll: (state, action: PayloadAction<Poll>) => {
      state.currentPoll = action.payload;
      state.remainingTime = action.payload.remainingTime;
      state.hasVoted = false;
      state.selectedOption = null;
    },
    updateResults: (
      state,
      action: PayloadAction<{ [key: string]: number }>,
    ) => {
      if (state.currentPoll) {
        state.currentPoll.results = action.payload;
      }
    },
    setSelectedOption: (state, action: PayloadAction<string>) => {
      state.selectedOption = action.payload;
    },
    setHasVoted: (state, action: PayloadAction<boolean>) => {
      state.hasVoted = action.payload;
    },
    decrementTimer: (state) => {
      if (state.remainingTime > 0) {
        state.remainingTime -= 1;
      }
    },
    resetPoll: (state) => {
      state.currentPoll = null;
      state.remainingTime = 0;
      state.hasVoted = false;
      state.selectedOption = null;
    },
  },
});

export const {
  setPoll,
  updateResults,
  setSelectedOption,
  setHasVoted,
  decrementTimer,
  resetPoll,
} = pollSlice.actions;

export default pollSlice.reducer;
