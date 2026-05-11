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

// ============================================================================
// ADVANCED STORAGE FEATURES
// ============================================================================

/**
 * Check if storage is available and working
 */
export function isStorageAvailable(): boolean {
  if (!isBrowser()) return false;

  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage quota information (where supported)
 */
export function getStorageQuota(): { used: number; available: number } | null {
  if (!isBrowser() || !("storage" in navigator && "estimate" in navigator.storage)) {
    return null;
  }

  // This would need to be awaited in practice, but for simplicity we'll return null
  // navigator.storage.estimate().then(estimate => ({ used: estimate.usage, available: estimate.quota }));
  return null;
}

/**
 * Compress data before storing (basic implementation)
 */
export function compressData<T>(data: T): string {
  // In a real implementation, you might use a compression library
  // For now, just stringify
  return JSON.stringify(data);
}

/**
 * Decompress stored data
 */
export function decompressData<T>(compressed: string): T | undefined {
  return safeParseJSON<T>(compressed);
}

/**
 * Create a storage-backed reactive store
 */
export function createPersistentStore<T>(
  key: string,
  initialValue: T,
  options: {
    debounceMs?: number;
    compress?: boolean;
    migrate?: (oldData: unknown) => T;
  } = {},
) {
  const { debounceMs = 200, compress = false, migrate } = options;

  let currentValue = initialValue;
  let isInitialized = false;

  const load = (): T => {
    if (!isBrowser()) return initialValue;

    const stored = getStoredValue<unknown>(key);
    if (stored === undefined) return initialValue;

    if (migrate) {
      try {
        return migrate(stored);
      } catch {
        return initialValue;
      }
    }

    return stored;
  };

  const save = compress
    ? (value: T) => setStoredValue(key, compressData(value))
    : (value: T) => setStoredValue(key, value);

  const debouncedSave = createDebouncedWriter(save, debounceMs);

  const get = (): T => {
    if (!isInitialized) {
      currentValue = load();
      isInitialized = true;
    }
    return currentValue;
  };

  const set = (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === "function" ? (value as (prev: T) => T)(get()) : value;
    currentValue = newValue;
    debouncedSave(newValue);
  };

  const reset = () => {
    currentValue = initialValue;
    removeStoredValue(key);
  };

  return { get, set, reset, load, save };
}
