import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { decrementTimer } from "../store/pollSlice";

export function usePollTimer() {
  const dispatch = useAppDispatch();
  const { currentPoll, remainingTime, hasVoted } = useAppSelector(
    (state) => state.poll,
  );

  useEffect(() => {
    if (!currentPoll || hasVoted || remainingTime <= 0) return;

    const interval = setInterval(() => {
      dispatch(decrementTimer());
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPoll, hasVoted, remainingTime, dispatch]);

  return remainingTime;
}
