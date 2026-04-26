import { useCallback, useSyncExternalStore } from 'react';
import { departmentSeed } from './departmentSeed';

const STORAGE_KEY = 'hrmanagement:departments';
const UPDATE_EVENT = 'hrmanagement:departments-updated';

const cloneSeed = () => departmentSeed.map((department) => ({ ...department }));

const parseDepartments = (rawValue) => {
  if (!rawValue) {
    return cloneSeed();
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
};

const readDepartmentsFromStorage = () => {
  if (typeof window === 'undefined') {
    return cloneSeed();
  }

  return parseDepartments(window.localStorage.getItem(STORAGE_KEY));
};

let currentDepartments = readDepartmentsFromStorage();

const emitUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  }
};

const persistDepartments = (nextDepartments) => {
  currentDepartments = nextDepartments;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDepartments));
  }

  emitUpdate();
};

const subscribe = (onStoreChange) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      currentDepartments = parseDepartments(event.newValue);
      onStoreChange();
    }
  };

  const handleCustomUpdate = () => {
    currentDepartments = readDepartmentsFromStorage();
    onStoreChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(UPDATE_EVENT, handleCustomUpdate);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(UPDATE_EVENT, handleCustomUpdate);
  };
};

const getSnapshot = () => currentDepartments;

const updateDepartments = (nextOrUpdater) => {
  const nextDepartments = typeof nextOrUpdater === 'function' ? nextOrUpdater(currentDepartments) : nextOrUpdater;
  persistDepartments(Array.isArray(nextDepartments) ? nextDepartments : currentDepartments);
};

export const useDepartmentsRealtime = () => {
  const departments = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setDepartments = useCallback((nextOrUpdater) => {
    updateDepartments(nextOrUpdater);
  }, []);

  return [departments, setDepartments];
};
