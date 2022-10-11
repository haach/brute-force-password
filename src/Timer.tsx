import { useEffect, useState } from 'react';

interface UseTimer {
  time: number;
  running: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export const useTimer = (): UseTimer => {
  const [time, setTime] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (running) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 100);
    } else if (!running) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  return {
    time,
    running,
    start: () => setRunning(true),
    stop: () => setRunning(false),
    reset: () => {
      setTime(0);
      setRunning(false);
    },
  };
};
