import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getPasteById, incrementViewCount, isPasteAvailable, pasteToResult } from '@/lib/paste';
import { getCurrentTimeFromHeaders } from '@/lib/time';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    return {
        title: `Paste ${id} | Pastebin Lite`,
        description: 'View shared paste content',
    };
}

export default async function PastePage({ params }: PageProps) {
    const { id } = await params;

    // Get request headers for deterministic time testing
    const headersList = await headers();
    const currentTime = getCurrentTimeFromHeaders(headersList);

    // Get the paste
    const paste = await getPasteById(id);

    if (!paste) {
        notFound();
    }

    // Check if paste is available
    if (!isPasteAvailable(paste, currentTime)) {
        notFound();
    }

    // Increment view count
    const updatedPaste = await incrementViewCount(id, currentTime);

    if (!updatedPaste) {
        notFound();
    }

    const result = pasteToResult(updatedPaste);

    // Format expiry time - use consistent format to avoid hydration mismatch
    const expiryText = result.expires_at
        ? result.expires_at.slice(0, 19).replace('T', ' ')
        : null;

    return (
        <div className="container">
            <header className="header">
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <h1 className="logo">{'<paste/>'}</h1>
                </Link>
            </header>

            <main>
                <div className="card">
                    <div className="paste-header">
                        <span className="paste-id">ID: {id}</span>
                        <div className="paste-meta">
                            {result.remaining_views !== null && (
                                <span className={`paste-meta-item ${result.remaining_views <= 1 ? 'warning' : ''}`}>
                                    👁 {result.remaining_views} view{result.remaining_views !== 1 ? 's' : ''} left
                                </span>
                            )}
                            {expiryText && (
                                <span className="paste-meta-item">
                                    ⏱ Expires: {expiryText}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="paste-content">
                        {result.content}
                    </div>
                </div>
            </main>

            <footer className="footer">
                <Link href="/" className="not-found-link">
                    ← Create new paste
                </Link>
            </footer>
        </div>
    );
}
