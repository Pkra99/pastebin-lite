import { headers } from 'next/headers';

// Get current time, respecting x-test-now-ms header in TEST_MODE
export async function getCurrentTime(): Promise<number> {
    if (process.env.TEST_MODE === '1') {
        const headersList = await headers();
        const testNowMs = headersList.get('x-test-now-ms');
        if (testNowMs) {
            const parsed = parseInt(testNowMs, 10);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
    }
    return Date.now();
}

// Standalone version that takes headers directly (for route handlers)
export function getCurrentTimeFromHeaders(requestHeaders: Headers): number {
    if (process.env.TEST_MODE === '1') {
        const testNowMs = requestHeaders.get('x-test-now-ms');
        if (testNowMs) {
            const parsed = parseInt(testNowMs, 10);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
    }
    return Date.now();
}
