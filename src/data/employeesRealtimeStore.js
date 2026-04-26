import { useCallback, useSyncExternalStore } from 'react';
import { employeeSeed } from './employeeSeed';

const STORAGE_KEY = 'hrmanagement:employees';
const UPDATE_EVENT = 'hrmanagement:employees-updated';

const cloneSeed = () => employeeSeed.map((employee) => ({ ...employee }));

const parseEmployees = (rawValue) => {
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

const readEmployeesFromStorage = () => {
  if (typeof window === 'undefined') {
    return cloneSeed();
  }

  return parseEmployees(window.localStorage.getItem(STORAGE_KEY));
};

let currentEmployees = readEmployeesFromStorage();

const emitUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  }
};

const persistEmployees = (nextEmployees) => {
  currentEmployees = nextEmployees;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEmployees));
  }

  emitUpdate();
};

const subscribe = (onStoreChange) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      currentEmployees = parseEmployees(event.newValue);
      onStoreChange();
    }
  };

  const handleCustomUpdate = () => {
    currentEmployees = readEmployeesFromStorage();
    onStoreChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(UPDATE_EVENT, handleCustomUpdate);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(UPDATE_EVENT, handleCustomUpdate);
  };
};

const getSnapshot = () => currentEmployees;

const updateEmployees = (nextOrUpdater) => {
  const nextEmployees = typeof nextOrUpdater === 'function' ? nextOrUpdater(currentEmployees) : nextOrUpdater;
  persistEmployees(Array.isArray(nextEmployees) ? nextEmployees : currentEmployees);
};

export const useEmployeesRealtime = () => {
  const employees = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setEmployees = useCallback((nextOrUpdater) => {
    updateEmployees(nextOrUpdater);
  }, []);

  return [employees, setEmployees];
};
