import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container">
            <header className="header">
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1 className="logo">{'<paste/>'}</h1>
                </Link>
            </header>

            <main>
                <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '4rem', fontWeight: 700, marginBottom: '1rem' }}>404</div>
                    <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: '0.5rem' }}>
                        Paste not found
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '2rem' }}>
                        This paste may have expired, reached its view limit, or never existed.
                    </p>
                    <Link
                        href="/"
                        className="button button-primary"
                        style={{ display: 'inline-flex', textDecoration: 'none' }}
                    >
                        Create New Paste
                    </Link>
                </div>
            </main>

            <footer className="footer">
                <p>Paste expires based on your settings. No account required.</p>
            </footer>
        </div>
    );
}
