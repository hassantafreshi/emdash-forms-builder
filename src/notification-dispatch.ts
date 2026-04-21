/**
 * Forms Builder — Notification Dispatch System
 *
 * Extensible, async notification dispatch supporting multiple channels.
 * Currently implements email channel; SMS, WhatsApp, webhook channels
 * can be registered via the channel registry.
 *
 * All dispatches are fire-and-forget with error logging — the caller
 * does not wait for delivery confirmation.
 */

import type { NotificationChannel, NotificationPayload, NotificationResult } from "./types.js";

// =============================================================================
// Channel Handler Registry
// =============================================================================

/**
 * A channel handler sends a notification through a specific channel.
 * Implementations should throw on failure — the dispatcher catches and logs.
 */
export type ChannelHandler = (payload: NotificationPayload) => Promise<void>;

const channelHandlers = new Map<NotificationChannel, ChannelHandler>();

/**
 * Register a handler for a notification channel.
 * Only one handler per channel; last registration wins.
 */
export function registerChannel(channel: NotificationChannel, handler: ChannelHandler): void {
	channelHandlers.set(channel, handler);
}

/**
 * Unregister a notification channel handler.
 */
export function unregisterChannel(channel: NotificationChannel): void {
	channelHandlers.delete(channel);
}

/**
 * Check if a handler is registered for a channel.
 */
export function hasChannel(channel: NotificationChannel): boolean {
	return channelHandlers.has(channel);
}

// =============================================================================
// Email Channel Factory
// =============================================================================

/**
 * Create and register an email channel handler using the plugin's email access.
 * Called once during plugin initialization when ctx.email is available.
 */
export function registerEmailChannel(
	emailSend: (msg: { to: string; subject: string; text: string; html?: string }) => Promise<void>,
): void {
	registerChannel("email", async (payload) => {
		await emailSend({
			to: payload.to,
			subject: payload.subject ?? "",
			text: payload.body,
			html: payload.htmlBody,
		});
	});
}

// =============================================================================
// Dispatch
// =============================================================================

export interface DispatchOptions {
	/** Logger for errors — defaults to console */
	log?: { warn: (msg: string) => void; info: (msg: string) => void };
}

/**
 * Dispatch a single notification. Returns the result synchronously.
 */
export async function dispatchNotification(
	payload: NotificationPayload,
	opts?: DispatchOptions,
): Promise<NotificationResult> {
	const log = opts?.log ?? console;
	const handler = channelHandlers.get(payload.channel);

	if (!handler) {
		const msg = `No handler registered for channel: ${payload.channel}`;
		log.warn(msg);
		return { channel: payload.channel, success: false, error: msg };
	}

	log.info(`[dispatch] sending ${payload.channel} → ${payload.to} | subject: "${payload.subject}"`);
	try {
		await handler(payload);
		log.info(`[dispatch] ✓ sent ${payload.channel} → ${payload.to}`);
		return { channel: payload.channel, success: true };
	} catch (err) {
		const errMsg = err instanceof Error ? err.message : String(err);
		log.warn(`[dispatch] ✗ FAILED ${payload.channel} → ${payload.to} | error: ${errMsg}`);
		return { channel: payload.channel, success: false, error: errMsg };
	}
}

/**
 * Dispatch multiple notifications in parallel (fire-and-forget).
 * Errors are logged but never thrown — the caller does not wait for delivery.
 *
 * This is the main entry point for sending notifications after form events.
 */
export function dispatchAll(payloads: NotificationPayload[], opts?: DispatchOptions): void {
	const log = opts?.log ?? console;
	if (payloads.length === 0) {
		log.info("[dispatch] dispatchAll called with 0 payloads — no emails to send");
		return;
	}

	log.info(`[dispatch] dispatchAll: queuing ${payloads.length} notification(s): ${payloads.map(p => `${p.channel}→${p.to}`).join(", ")}`);

	// Fire and forget — use void to suppress unhandled promise warnings
	void Promise.allSettled(payloads.map((p) => dispatchNotification(p, opts))).then((results) => {
		const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success));
		if (failed.length > 0) {
			log.warn(`[dispatch] ${failed.length} notification(s) failed out of ${payloads.length}`);
		} else {
			log.info(`[dispatch] all ${payloads.length} notification(s) delivered successfully`);
		}
	});
}
