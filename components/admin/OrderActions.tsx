'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Undo2, Loader2 } from 'lucide-react';

/**
 * Fulfilment toggle for a single order row. Calls
 * `PATCH /api/admin/orders/[id]` and refreshes the server-rendered list.
 */
export function FulfilToggle({ id, fulfilled }: { id: string; fulfilled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfilled: !fulfilled }),
      });
      if (!res.ok) {
        setError(true);
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={
        fulfilled
          ? 'inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-50'
          : 'inline-flex items-center gap-1.5 rounded-lg bg-success/15 px-3 py-1.5 text-xs font-medium text-success transition hover:bg-success/25 disabled:opacity-50'
      }
      title={error ? 'Update failed — try again' : undefined}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : fulfilled ? (
        <Undo2 className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Check className="h-3.5 w-3.5" aria-hidden />
      )}
      {fulfilled ? 'Mark unfulfilled' : 'Mark fulfilled'}
    </button>
  );
}

/** Sign out of the admin dashboard. */
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-50"
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
