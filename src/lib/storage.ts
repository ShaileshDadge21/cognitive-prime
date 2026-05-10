const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function safeParseJSON<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export function getStoredValue<T>(key: string): T | undefined {
  if (!isBrowser()) {
    return undefined;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return undefined;
  }

  return safeParseJSON<T>(raw);
}

export function setStoredValue<T>(key: string, value: T): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStoredValue(key: string): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(key);
}

export function createDebouncedWriter<T>(write: (value: T) => void, delay = 200) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (value: T) => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = undefined;
      write(value);
    }, delay);
  };
}
