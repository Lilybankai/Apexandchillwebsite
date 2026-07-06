'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

/**
 * Admin login form. Posts the operator password to `/api/admin/login`; on success
 * the session cookie is set and we redirect to the requested `?next=` path (or the
 * dashboard). The password never persists in the client beyond this form.
 */
function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/admin';

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error: string | null };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Sign in failed.');
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="container-rail flex min-h-[70vh] items-center justify-center py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-card border border-line bg-surface/50 p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 text-ink">
          <Lock className="h-5 w-5 text-gradient" aria-hidden />
          <h1 className="font-display text-xl">Admin sign in</h1>
        </div>
        <p className="text-sm text-muted">Enter the operator password to view merch orders.</p>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="w-full rounded-lg border border-line bg-base px-3 py-2 text-ink outline-none focus:border-ink/40"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-flag-red/30 bg-flag-red/5 px-3 py-2 text-sm text-flag-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || password.length === 0}
          className="w-full rounded-lg bg-ink px-4 py-2 font-medium text-base transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
