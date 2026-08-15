"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <title>Application Error · Turnivo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg: #090614;
            --card-bg: rgba(255, 255, 255, 0.04);
            --border: rgba(255, 255, 255, 0.1);
            --text: #f8fafc;
            --muted: #94a3b8;
            --primary: #8b5cf6;
            --primary-hover: #7c3aed;
            --rose: #f43f5e;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
          }
          .card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 1.25rem;
            max-width: 480px;
            width: 100%;
            padding: 2.5rem 2rem;
            text-align: center;
            box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
            backdrop-filter: blur(12px);
          }
          .icon-circle {
            width: 64px;
            height: 64px;
            border-radius: 1rem;
            background: rgba(244, 63, 94, 0.12);
            border: 1px solid rgba(244, 63, 94, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 1.75rem;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
          }
          p {
            font-size: 0.925rem;
            color: var(--muted);
            line-height: 1.6;
            margin-bottom: 2rem;
          }
          .actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn-primary {
            background: var(--primary);
            color: #fff;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s ease;
          }
          .btn-primary:hover {
            background: var(--primary-hover);
          }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: var(--text);
            border: 1px solid var(--border);
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.15s ease;
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.14);
          }
        `}} />
      </head>
      <body>
        <div className="card">
          <div className="icon-circle">⚡</div>
          <h1>System Encountered an Error</h1>
          <p>
            A critical error occurred while initializing the application layout. You can reload the page or return to the main dashboard.
          </p>
          <div className="actions">
            <button className="btn-primary" onClick={() => reset()}>
              Try Again
            </button>
            <button className="btn-secondary" onClick={() => window.location.href = "/"}>
              Return Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
