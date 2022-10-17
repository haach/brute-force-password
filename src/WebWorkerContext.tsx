import { createContext, useContext, useEffect, useState } from 'react';
import { ComponentWithChildren } from 'src/globalTypes';

type messageCallBackFnRef = (e: MessageEvent) => void;
type errorCallBackFnRef = (e: ErrorEvent) => void;

interface WebWorkerContext {
  worker: Worker | null;
  registerWebWorker: (
    onMessage: messageCallBackFnRef,
    onError?: errorCallBackFnRef
  ) => Promise<Worker>;
  terminateWebWorker: () => void;
}

const WebWorkerContext = createContext<WebWorkerContext>({
  worker: null,
  registerWebWorker: () => new Promise(() => {}),
  terminateWebWorker: () => null,
});

/* Custom hook for better usability */
export const useWorker = () => {
  const context = useContext(WebWorkerContext);
  if (!context) {
    throw new Error('useSW must be called from WebWorkerContextProvider child');
  }
  return context;
};

export const WebWorkerContextProvider: ComponentWithChildren = ({
  children,
}) => {
  const [worker, setWorker] = useState<WebWorkerContext['worker']>(null);

  const registerWebWorker = (
    onMessage: messageCallBackFnRef,
    onError?: errorCallBackFnRef
  ): Promise<Worker> =>
    new Promise((resolve, _reject) => {
      const worker = new Worker('/BruteForceWorker.js');
      worker.onmessage = onMessage;
      if (onError) worker.onerror = onError;
      setWorker(worker);
      resolve(worker);
    });

  const terminateWebWorker = () => {
    if (worker) {
      worker.terminate();
      setWorker(null);
    }
  };

  return (
    <WebWorkerContext.Provider
      value={{
        worker,
        registerWebWorker,
        terminateWebWorker,
      }}
    >
      {children}
    </WebWorkerContext.Provider>
  );
};
