import { getSupabaseClient } from "./client";

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export async function getCurrentUserId() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new ServiceError("Unable to resolve current user.", error);
  }

  if (!data.user) {
    throw new ServiceError("You must be signed in to access this data.");
  }

  return data.user.id;
}

export function assertServiceResult<T>(data: T, error: unknown, message: string): T {
  if (error) {
    throw new ServiceError(message, error);
  }
  return data;
}
