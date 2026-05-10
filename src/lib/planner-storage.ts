import type { PlannerTask, TimelineBlock } from "@/components/planner/types";
import { getStoredValue, removeStoredValue, setStoredValue } from "@/lib/storage";
import { safeParseJSON } from "@/lib/storage";

export const PLANNER_STORAGE_KEY = "neuroflow.planner.state.v1";
export const PLANNER_STORAGE_VERSION = 1;

export type PlannerStorageSchemaV1 = {
  version: 1;
  persistedAt: string;
  tasks: PlannerTask[];
  blocks: TimelineBlock[];
};

export type PlannerStorageSchema = PlannerStorageSchemaV1;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasPlannerStateShape(value: Record<string, unknown>): value is {
  tasks: unknown[];
  blocks: unknown[];
  persistedAt?: string;
  version?: number;
} {
  return Array.isArray(value.tasks) && Array.isArray(value.blocks);
}

export function migratePlannerStorage(raw: unknown): PlannerStorageSchema | undefined {
  if (!isPlainObject(raw)) {
    return undefined;
  }

  if (
    raw.version === PLANNER_STORAGE_VERSION &&
    typeof raw.persistedAt === "string" &&
    hasPlannerStateShape(raw)
  ) {
    return {
      version: PLANNER_STORAGE_VERSION,
      persistedAt: raw.persistedAt,
      tasks: raw.tasks as PlannerTask[],
      blocks: raw.blocks as TimelineBlock[],
    };
  }

  if (hasPlannerStateShape(raw)) {
    return {
      version: PLANNER_STORAGE_VERSION,
      persistedAt: new Date().toISOString(),
      tasks: raw.tasks as PlannerTask[],
      blocks: raw.blocks as TimelineBlock[],
    };
  }

  return undefined;
}

export function loadPlannerState(): PlannerStorageSchema | undefined {
  const raw = getStoredValue<unknown>(PLANNER_STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  const migrated = migratePlannerStorage(raw);
  if (!migrated) {
    clearPlannerState();
  }

  return migrated;
}

export function savePlannerState(state: PlannerStorageSchema): void {
  setStoredValue(PLANNER_STORAGE_KEY, state);
}

export function preparePlannerSyncPayload(state: PlannerStorageSchema) {
  return {
    version: state.version,
    persistedAt: state.persistedAt,
    tasks: state.tasks,
    blocks: state.blocks,
  } as const;
}

export function exportPlannerState(): string | undefined {
  const current = loadPlannerState();
  if (!current) {
    return undefined;
  }

  return JSON.stringify(preparePlannerSyncPayload(current), null, 2);
}

export function importPlannerState(raw: string): PlannerStorageSchema | undefined {
  const parsed = safeParseJSON<unknown>(raw);
  if (!parsed) {
    return undefined;
  }

  const migrated = migratePlannerStorage(parsed);
  if (!migrated) {
    return undefined;
  }

  savePlannerState(migrated);
  return migrated;
}

export function clearPlannerState(): void {
  removeStoredValue(PLANNER_STORAGE_KEY);
}
