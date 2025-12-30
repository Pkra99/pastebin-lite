import { NextRequest, NextResponse } from 'next/server';
import { getPasteById, incrementViewCount, isPasteAvailable, pasteToResult } from '@/lib/paste';
import { getCurrentTimeFromHeaders } from '@/lib/time';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const currentTime = getCurrentTimeFromHeaders(request.headers);

        const paste = await getPasteById(id);

        if (!paste) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Check if paste is available before incrementing view
        if (!isPasteAvailable(paste, currentTime)) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        const updatedPaste = await incrementViewCount(id, currentTime);

        if (!updatedPaste) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(pasteToResult(updatedPaste));
    } catch (error) {
        console.error('Error fetching paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
