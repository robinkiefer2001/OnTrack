import { mockApiClient } from "$lib/api/mock";
import type { ApiClient } from "$lib/api/types";

/**
 * The active API client.
 * Currently points to the mock implementation.
 * Replace with a real HTTP client when the backend is ready.
 */
export const api: ApiClient = mockApiClient;

export type { ApiClient, AuthResult, CompanyEmployee, RoleDefinition, RoleName, Permission } from "$lib/api/types";
