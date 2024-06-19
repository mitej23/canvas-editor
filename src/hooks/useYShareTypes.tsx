import { useCallback, useEffect, useState } from "react";
import * as Y from "yjs";

export const useMap = <T extends unknown = unknown>(
  yMap: Y.Map<T>
): {
  state: { [x: string]: any };
  get: (name: string) => T | undefined;
  set: (name: string, value: T) => void;
  delete: (name: string) => void;
} => {
  const [value, setValue] = useState<{ [x: string]: any }>(yMap.toJSON());

  useEffect(() => {
    yMap.observe((_) => {
      setValue(yMap.toJSON());
    });
  }, [yMap]);

  return {
    state: value,
    get: useCallback((name: string) => yMap.get(name), []),
    set: useCallback((name, value) => yMap.set(name, value), []),
    delete: useCallback((name) => yMap.delete(name), []),
  };
};

export const useArray = <T extends unknown = unknown>(
  yArray: Y.Array<T>
): {
  state: T[];
  get: (index: number) => T | undefined;
  insert: (index: number, content: T[]) => void;
  delete: (index: number, length: number) => void;
  push: (content: T[]) => void;
  unshift: (content: T[]) => void;
  slice: (start: number, end?: number) => void;
  indexOf: (content: T) => number;
} => {
  const [value, setValue] = useState<T[]>(yArray.toArray());

  useEffect(() => {
    yArray.observe((_) => {
      setValue(yArray.toArray());
    });
  }, [yArray]);

  return {
    state: value,
    indexOf: useCallback((content) => value.indexOf(content), []),
    get: useCallback((index) => yArray.get(index), []),
    insert: useCallback((index, content) => yArray.insert(index, content), []),
    delete: useCallback((index, length) => yArray.delete(index, length), []),
    push: useCallback((content) => yArray.push(content), []),
    unshift: useCallback((content) => yArray.unshift(content), []),
    slice: useCallback((start, end) => yArray.slice(start, end), []),
  };
};
