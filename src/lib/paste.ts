import { redis } from './redis';
import { generatePasteId } from './id';

// Paste data structure stored in Redis
export interface Paste {
    id: string;
    content: string;
    created_at: number;      
    expires_at: number | null; // Unix timestamp in ms, null if no TTL
    max_views: number | null;  // Maximum views allowed, null if unlimited
    view_count: number;      
}

// Input for creating a paste
export interface CreatePasteInput {
    content: string;
    ttl_seconds?: number;
    max_views?: number;
}

// Result of fetching a paste
export interface PasteResult {
    content: string;
    remaining_views: number | null;
    expires_at: string | null; 
}

// Redis key prefix
const PASTE_KEY_PREFIX = 'paste:';

function getPasteKey(id: string): string {
    return `${PASTE_KEY_PREFIX}${id}`;
}

// Create a new paste
export async function createPaste(input: CreatePasteInput): Promise<Paste> {
    const id = generatePasteId();
    const now = Date.now();

    const paste: Paste = {
        id,
        content: input.content,
        created_at: now,
        expires_at: input.ttl_seconds ? now + (input.ttl_seconds * 1000) : null,
        max_views: input.max_views ?? null,
        view_count: 0,
    };

    const key = getPasteKey(id);

    // Store paste in Redis
    if (input.ttl_seconds) {
        await redis.set(key, JSON.stringify(paste), { ex: input.ttl_seconds });
    } else {
        await redis.set(key, JSON.stringify(paste));
    }

    return paste;
}

// Get a paste by ID (does not increment view count)
export async function getPasteById(id: string): Promise<Paste | null> {
    const key = getPasteKey(id);
    const data = await redis.get<string>(key);

    if (!data) {
        return null;
    }

    // Handle case where Redis returns parsed object directly
    if (typeof data === 'object') {
        return data as unknown as Paste;
    }

    return JSON.parse(data) as Paste;
}

// Check if a paste is available (not expired, not over view limit)
export function isPasteAvailable(paste: Paste, currentTime: number): boolean {
    if (paste.expires_at !== null && currentTime >= paste.expires_at) {
        return false;
    }

    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
        return false;
    }

    return true;
}

// Increment view count atomically and return updated paste
// Returns null if paste doesn't exist or would exceed view limit
export async function incrementViewCount(id: string, currentTime: number): Promise<Paste | null> {
    const key = getPasteKey(id);

    // Get current paste
    const paste = await getPasteById(id);
    if (!paste) {
        return null;
    }

    if (!isPasteAvailable(paste, currentTime)) {
        return null;
    }

    paste.view_count += 1;

    // Calculate remaining TTL if applicable
    if (paste.expires_at !== null) {
        const remainingTtlMs = paste.expires_at - Date.now();
        if (remainingTtlMs > 0) {
            const remainingTtlSeconds = Math.ceil(remainingTtlMs / 1000);
            await redis.set(key, JSON.stringify(paste), { ex: remainingTtlSeconds });
        } else {
            // Paste should be expired, delete it
            await redis.del(key);
            return null;
        }
    } else {
        await redis.set(key, JSON.stringify(paste));
    }

    return paste;
}

// Convert paste to API result format
export function pasteToResult(paste: Paste): PasteResult {
    return {
        content: paste.content,
        remaining_views: paste.max_views !== null
            ? Math.max(0, paste.max_views - paste.view_count)
            : null,
        expires_at: paste.expires_at !== null
            ? new Date(paste.expires_at).toISOString()
            : null,
    };
}
