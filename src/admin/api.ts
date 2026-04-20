/**
 * Forms Builder — Admin API Client
 *
 * Thin wrapper around plugin-utils apiFetch for forms-builder routes.
 */

import { apiFetch as baseFetch, parseApiResponse, getErrorMessage } from "emdash/plugin-utils";

const API_BASE = "/_emdash/api/plugins/emdash-form-builder";

export function apiFetch(route: string, body?: unknown): Promise<Response> {
	return baseFetch(`${API_BASE}/${route}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body ?? {}),
	});
}

export { parseApiResponse, getErrorMessage };
