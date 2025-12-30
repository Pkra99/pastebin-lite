'use client';

import { useState, FormEvent } from 'react';

interface PasteResult {
  id: string;
  url: string;
}

interface FetchedPaste {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState<PasteResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lookup state
  const [lookupId, setLookupId] = useState('');
  const [fetchedPaste, setFetchedPaste] = useState<FetchedPaste | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const body: Record<string, unknown> = { content };

      if (ttlSeconds) {
        const parsed = parseInt(ttlSeconds, 10);
        if (isNaN(parsed) || parsed < 1) {
          setError('TTL must be a positive integer');
          setLoading(false);
          return;
        }
        body.ttl_seconds = parsed;
      }

      if (maxViews) {
        const parsed = parseInt(maxViews, 10);
        if (isNaN(parsed) || parsed < 1) {
          setError('Max views must be a positive integer');
          setLoading(false);
          return;
        }
        body.max_views = parsed;
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        return;
      }

      setResult(data);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (result?.url) {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyId = async () => {
    if (result?.id) {
      await navigator.clipboard.writeText(result.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Extract paste ID from URL or return as-is if it's just an ID
  const extractPasteId = (input: string): string => {
    const trimmed = input.trim();
    // Check if it's a URL containing /p/
    const urlMatch = trimmed.match(/\/p\/([a-zA-Z0-9]+)\/?$/);
    if (urlMatch) {
      return urlMatch[1];
    }
    // Otherwise treat as ID directly
    return trimmed;
  };

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setFetchedPaste(null);
    setLookupLoading(true);

    const input = lookupId.trim();
    if (!input) {
      setLookupError('Please enter a paste ID or URL');
      setLookupLoading(false);
      return;
    }

    const id = extractPasteId(input);

    try {
      const response = await fetch(`/api/pastes/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setLookupError(data.error || 'Paste not found');
        return;
      }

      setFetchedPaste(data);
      setLookupId(id); // Update to show just the ID
    } catch {
      setLookupError('Network error. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">{'<paste/>'}</h1>
        <p className="tagline">Share code snippets instantly</p>
      </header>

      <main>
        {/* Create Paste Section */}
        <div className="card">
          <h2 className="section-title">Create Paste</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="content" className="label">Content</label>
              <textarea
                id="content"
                className="textarea"
                placeholder="Paste your code or text here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="input-row">
              <div className="form-group">
                <label htmlFor="ttl" className="label">Expires after (seconds)</label>
                <input
                  id="ttl"
                  type="number"
                  className="input"
                  placeholder="Optional"
                  min="1"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                />
                <p className="hint">Leave empty for no expiry</p>
              </div>

              <div className="form-group">
                <label htmlFor="views" className="label">Max views</label>
                <input
                  id="views"
                  type="number"
                  className="input"
                  placeholder="Optional"
                  min="1"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                />
                <p className="hint">Leave empty for unlimited</p>
              </div>
            </div>

            <button
              type="submit"
              className="button button-primary button-full"
              disabled={loading || !content.trim()}
            >
              {loading ? 'Creating...' : 'Create Paste'}
            </button>
          </form>

          {result && (
            <div className="result">
              <p className="result-label">✓ Paste created successfully</p>

              <div className="result-row">
                <span className="result-row-label">URL</span>
                <a href={result.url} className="result-link" target="_blank" rel="noopener noreferrer">
                  {result.url}
                </a>
                <button
                  type="button"
                  className="button button-copy"
                  onClick={handleCopyUrl}
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>

              <div className="result-row">
                <span className="result-row-label">ID</span>
                <span className="result-id">{result.id}</span>
                <button
                  type="button"
                  className="button button-copy"
                  onClick={handleCopyId}
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}
        </div>

        {/* View Paste Section */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 className="section-title">View Paste</h2>
          <form onSubmit={handleLookup}>
            <div className="form-group">
              <label htmlFor="lookupId" className="label">Paste ID</label>
              <div className="lookup-row">
                <input
                  id="lookupId"
                  type="text"
                  className="input"
                  placeholder="Enter paste ID or full URL"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                />
                <button
                  type="submit"
                  className="button button-secondary"
                  disabled={lookupLoading || !lookupId.trim()}
                >
                  {lookupLoading ? 'Loading...' : 'View'}
                </button>
              </div>
            </div>
          </form>

          {fetchedPaste && (
            <div className="fetched-paste">
              <div className="paste-header">
                <span className="paste-id">ID: {lookupId}</span>
                <div className="paste-meta">
                  {fetchedPaste.remaining_views !== null && (
                    <span className={`paste-meta-item ${fetchedPaste.remaining_views <= 1 ? 'warning' : ''}`}>
                      👁 {fetchedPaste.remaining_views} view{fetchedPaste.remaining_views !== 1 ? 's' : ''} left
                    </span>
                  )}
                  {fetchedPaste.expires_at && (
                    <span className="paste-meta-item">
                      ⏱ Expires: {fetchedPaste.expires_at.slice(0, 19).replace('T', ' ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="paste-content">
                {fetchedPaste.content}
              </div>
            </div>
          )}

          {lookupError && (
            <div className="error">
              {lookupError}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Paste expires based on your settings. No account required.</p>
      </footer>
    </div>
  );
}

