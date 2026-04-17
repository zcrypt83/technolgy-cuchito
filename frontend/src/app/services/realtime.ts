type DataChangedPayload = {
  endpoint?: string;
  method?: string;
  at: number;
};

const DATA_CHANGED_EVENT = 'technology-cuchito:data-changed';
const DATA_CHANGED_STORAGE_KEY = 'technology-cuchito:data-changed';

const safeParse = (value: string | null): DataChangedPayload | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return {
      endpoint: parsed?.endpoint,
      method: parsed?.method,
      at: Number(parsed?.at) || Date.now(),
    };
  } catch {
    return null;
  }
};

export const emitDataChanged = (payload: Omit<DataChangedPayload, 'at'> = {}) => {
  if (typeof window === 'undefined') return;

  const eventPayload: DataChangedPayload = {
    ...payload,
    at: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent<DataChangedPayload>(DATA_CHANGED_EVENT, { detail: eventPayload }),
  );

  try {
    localStorage.setItem(DATA_CHANGED_STORAGE_KEY, JSON.stringify(eventPayload));
  } catch {
    // Ignore storage errors (private mode, quota, etc.)
  }
};

export const subscribeDataChanged = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleCustomEvent = () => listener();
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== DATA_CHANGED_STORAGE_KEY) return;
    const parsed = safeParse(event.newValue);
    if (parsed) listener();
  };

  window.addEventListener(DATA_CHANGED_EVENT, handleCustomEvent as EventListener);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(DATA_CHANGED_EVENT, handleCustomEvent as EventListener);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

