/**
 * Portal API client — calls public plugin routes.
 */

const BASE = "/_emdash/api/plugins/emdash-form-builder";

export async function portalFetch(
	route: string,
	body?: Record<string, unknown>,
): Promise<Response> {
	return fetch(`${BASE}/${route}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: body ? JSON.stringify(body) : undefined,
	});
}
