import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setRemainingTime } from "../store/pollSlice";

export function usePollTimer() {
  const dispatch = useAppDispatch();
  const { currentPoll } = useAppSelector((state) => state.poll);

  useEffect(() => {
    if (!currentPoll) return;

    const calculateRemaining = () => {
      if (currentPoll.expiresAt) {
        const now = Date.now();
        const expiresAt = new Date(currentPoll.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        dispatch(setRemainingTime(remaining));
      }
    };

    calculateRemaining();

    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [currentPoll, dispatch]);

  return useAppSelector((state) => state.poll.remainingTime);
}
