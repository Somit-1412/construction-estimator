"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState as useReactState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type CalculationInputs = Record<string, unknown>;

type CalculationContextValue = {
  initialInputs: CalculationInputs;
  setInput: (key: string, value: unknown) => void;
};

const CalculationContext = createContext<CalculationContextValue | null>(null);

export function useCalculationState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(CalculationContext);

  const [value, setValue] = useReactState<T>(() => {
    const savedValue = context?.initialInputs[key];
    return savedValue === undefined ? initialValue : (savedValue as T);
  });

  const setPersistentValue: Dispatch<SetStateAction<T>> = useCallback(
    (nextValue) => {
      setValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (value: T) => T)(currentValue)
            : nextValue;

        context?.setInput(key, resolvedValue);
        return resolvedValue;
      });
    },
    [context, key],
  );

  return [value, setPersistentValue];
}

type CalculationPersistenceProps = {
  projectId: string;
  type: string;
  initialInputs: CalculationInputs;
  children: ReactNode;
};

export default function CalculationPersistence({
  projectId,
  type,
  initialInputs,
  children,
}: CalculationPersistenceProps) {
  const inputsRef = useRef<CalculationInputs>({ ...initialInputs });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setInput = useCallback(
    (key: string, value: unknown) => {
      inputsRef.current[key] = value;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/projects/${projectId}/calculations/${type}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: inputsRef.current,
              results: {},
            }),
          });
        } catch {
          // Calculation UI remains usable if a background save fails.
        }
      }, 600);
    },
    [projectId, type],
  );

  const contextValue = useMemo(
    () => ({ initialInputs, setInput }),
    [initialInputs, setInput],
  );

  return (
    <CalculationContext.Provider value={contextValue}>
      {children}
    </CalculationContext.Provider>
  );
}
