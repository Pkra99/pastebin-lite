import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container">
            <header className="header">
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <h1 className="logo">{'<paste/>'}</h1>
                </Link>
            </header>

            <main>
                <div className="not-found">
                    <div className="not-found-code">404</div>
                    <p className="not-found-message">Paste not found</p>
                    <p className="not-found-hint">
                        This paste may have expired, reached its view limit, or never existed.
                    </p>
                    <Link href="/" className="not-found-link">
                        ← Create a new paste
                    </Link>
                </div>
            </main>
        </div>
    );
}
