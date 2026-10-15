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

export type FloorInfo = {
  id: string;
  name: string;
  level: number;
  heightMeters: number;
};

type CalculationContextValue = {
  initialInputs: CalculationInputs;
  setInput: (key: string, value: unknown) => void;
  activeLevel?: number;
  currentFloorHeight?: number;
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
    [context, key, setValue],
  );

  return [value, setPersistentValue];
}

type CalculationPersistenceProps = {
  projectId: string;
  type: string;
  initialInputs: CalculationInputs;
  floors?: FloorInfo[];
  children: ReactNode;
};

export default function CalculationPersistence({
  projectId,
  type,
  initialInputs,
  floors = [],
  children,
}: CalculationPersistenceProps) {
  // If multi-storey: initialize byFloor structure
  const rawByFloor = (initialInputs.byFloor as Record<string, CalculationInputs>) || {};
  const [byFloorMap, setByFloorMap] = useReactState<Record<string, CalculationInputs>>(() => {
    const initialMap: Record<string, CalculationInputs> = { ...rawByFloor };
    // If byFloor doesn't have level 0, copy flat inputs to level 0
    if (!initialMap["0"] && Object.keys(initialInputs).length > 0) {
      const flatCopy = { ...initialInputs };
      delete flatCopy.byFloor;
      if (Object.keys(flatCopy).length > 0) {
        initialMap["0"] = flatCopy;
      }
    }
    return initialMap;
  });

  const hasMultipleFloors = floors.length > 1;
  const [activeLevel, setActiveLevel] = useReactState<number>(
    floors.length > 0 ? floors[0].level : 0,
  );

  const [mountKey, setMountKey] = useReactState(0);

  const inputsRef = useRef<CalculationInputs>({ ...initialInputs });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentFloor = floors.find((f) => f.level === activeLevel);

  const triggerSave = useCallback(
    (payload: CalculationInputs) => {
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
              inputs: payload,
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

  const setInput = useCallback(
    (key: string, value: unknown) => {
      if (hasMultipleFloors) {
        setByFloorMap((prev) => {
          const levelKey = String(activeLevel);
          const currentFloorInputs = prev[levelKey] || {};
          const updatedFloorInputs = {
            ...currentFloorInputs,
            [key]: value,
          };
          const nextMap = {
            ...prev,
            [levelKey]: updatedFloorInputs,
          };

          const payload: CalculationInputs = {
            ...inputsRef.current,
            byFloor: nextMap,
          };

          // Also keep level 0 at top level for backwards compatibility
          if (activeLevel === 0) {
            payload[key] = value;
          }

          inputsRef.current = payload;
          triggerSave(payload);
          return nextMap;
        });
      } else {
        inputsRef.current[key] = value;
        triggerSave(inputsRef.current);
      }
    },
    [activeLevel, hasMultipleFloors, setByFloorMap, triggerSave],
  );

  const handleCopyFromGround = useCallback(() => {
    const groundInputs = byFloorMap["0"];
    if (!groundInputs || Object.keys(groundInputs).length === 0) return;

    const levelKey = String(activeLevel);
    const copied = JSON.parse(JSON.stringify(groundInputs)) as CalculationInputs;

    setByFloorMap((prev) => {
      const nextMap = {
        ...prev,
        [levelKey]: copied,
      };

      const payload: CalculationInputs = {
        ...inputsRef.current,
        byFloor: nextMap,
      };

      inputsRef.current = payload;
      triggerSave(payload);
      return nextMap;
    });

    // Remount children with copied values
    setMountKey((k) => k + 1);
  }, [activeLevel, byFloorMap, setByFloorMap, setMountKey, triggerSave]);

  const activeInputsForContext = useMemo(() => {
    if (!hasMultipleFloors) {
      return initialInputs;
    }
    const levelKey = String(activeLevel);
    return byFloorMap[levelKey] || {};
  }, [activeLevel, byFloorMap, hasMultipleFloors, initialInputs]);

  const contextValue = useMemo(
    () => ({
      initialInputs: activeInputsForContext,
      setInput,
      activeLevel,
      currentFloorHeight: currentFloor ? currentFloor.heightMeters : undefined,
    }),
    [activeInputsForContext, setInput, activeLevel, currentFloor],
  );

  return (
    <div className="space-y-4">
      {hasMultipleFloors && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Active Storey:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  type="button"
                  onClick={() => {
                    setActiveLevel(floor.level);
                    setMountKey((k) => k + 1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeLevel === floor.level
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {floor.name}
                  <span className="ml-1 text-[11px] opacity-75">
                    ({floor.heightMeters.toFixed(2)}m)
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {activeLevel !== 0 && (
              <button
                type="button"
                onClick={handleCopyFromGround}
                className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                title="Copy all input rows and dimensions from Ground Floor into this floor"
              >
                Copy from Ground Floor
              </button>
            )}
            <span className="text-zinc-500">
              All storeys aggregate automatically into total project quantities.
            </span>
          </div>
        </div>
      )}

      <CalculationContext.Provider value={contextValue}>
        <div key={`${activeLevel}-${mountKey}`}>{children}</div>
      </CalculationContext.Provider>
    </div>
  );
}
