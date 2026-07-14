"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCountdownOptions {
  duration: number;
  onComplete: () => void;
}

export function useCountdown({ duration, onComplete }: UseCountdownOptions) {
  const [count, setCount] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setCount(duration);

    let remaining = duration;

    const scheduleTick = () => {
      timerRef.current = window.setTimeout(() => {
        remaining -= 1;
        if (remaining <= 0) {
          setCount(null);
          onCompleteRef.current();
          return;
        }
        setCount(remaining);
        scheduleTick();
      }, 1000);
    };

    scheduleTick();
  }, [clearTimer, duration]);

  const cancel = useCallback(() => {
    clearTimer();
    setCount(null);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    count,
    isRunning: count !== null,
    isCountingDown: count !== null && count > 0,
    start,
    cancel,
  };
}
