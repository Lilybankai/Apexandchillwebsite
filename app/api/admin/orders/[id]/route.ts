/**
 * `PATCH /api/admin/orders/[id]` — update an order's fulfilment state.
 *
 * Body: `{ fulfilled: boolean }`. Sets the order to `fulfilled` (stamping
 * `fulfilled_at`) or back to `new`. Protected by the admin middleware.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import { setOrderFulfilled } from '@/lib/merch/orders';

export const runtime = 'nodejs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: 'Missing order id.' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const fulfilled = (body as { fulfilled?: unknown })?.fulfilled === true;
  const ok = await setOrderFulfilled(id, fulfilled);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: 'Could not update the order (is Supabase configured?).' },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, error: null });
}
