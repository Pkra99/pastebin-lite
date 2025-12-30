import { NextResponse } from 'next/server';
import { checkRedisHealth } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const isHealthy = await checkRedisHealth();

        if (isHealthy) {
            return NextResponse.json({ ok: true });
        } else {
            return NextResponse.json(
                { ok: false, error: 'Redis connection failed' },
                { status: 503 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 503 }
        );
    }
}
