import { NextRequest, NextResponse } from 'next/server';
import { createPaste } from '@/lib/paste';

export const dynamic = 'force-dynamic';

interface CreatePasteBody {
    content: unknown;
    ttl_seconds?: unknown;
    max_views?: unknown;
}

export async function POST(request: NextRequest) {
    try {
        const body: CreatePasteBody = await request.json();

        // Validate content
        if (typeof body.content !== 'string' || body.content.trim() === '') {
            return NextResponse.json(
                { error: 'content is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Validate ttl_seconds if provided
        let ttlSeconds: number | undefined;
        if (body.ttl_seconds !== undefined) {
            if (typeof body.ttl_seconds !== 'number' || !Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
                return NextResponse.json(
                    { error: 'ttl_seconds must be an integer >= 1' },
                    { status: 400 }
                );
            }
            ttlSeconds = body.ttl_seconds;
        }

        // Validate max_views if provided
        let maxViews: number | undefined;
        if (body.max_views !== undefined) {
            if (typeof body.max_views !== 'number' || !Number.isInteger(body.max_views) || body.max_views < 1) {
                return NextResponse.json(
                    { error: 'max_views must be an integer >= 1' },
                    { status: 400 }
                );
            }
            maxViews = body.max_views;
        }

        // Create the paste
        const paste = await createPaste({
            content: body.content,
            ttl_seconds: ttlSeconds,
            max_views: maxViews,
        });

        // Build the URL
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host') || 'localhost:3000';
        const url = `${protocol}://${host}/p/${paste.id}`;

        return NextResponse.json(
            { id: paste.id, url },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        console.error('Error creating paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
