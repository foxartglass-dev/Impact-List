import React, { useState, useEffect, useRef, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const timeoutRef = useRef<number | null>(null);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    // This function is memoized, so it won't change on re-renders
    // and can be used in dependency arrays of other hooks without causing infinite loops.
    // The actual value is closed over from the state.
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // MVP Instrumentation
        console.log(`[Autosave] Data saved to localStorage at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
      }
    }, 5000); // Autosave 5s after the last edit.
  }, [key, storedValue]);

  // Effect to load value from localStorage on initial component mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error parsing localStorage key “${key}”:`, error);
    }
  }, [key]);


  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [storedValue, setValue];
}

export default useLocalStorage;
