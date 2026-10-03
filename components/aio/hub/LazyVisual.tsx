"use client";

import { Suspense, lazy, useEffect, useRef, useState, type ComponentType } from "react";

/**
 * The feature explorer's mocks, loaded when their tab is first shown instead
 * of being rendered into the page.
 *
 * Every explorer panel is in the server HTML so its copy is indexable, but
 * only one is visible at a time — and the mocks were most of the hub's weight:
 * the Review lap traces alone are ~70 KB of SVG, sent once as HTML and again
 * in the RSC payload. Here the server sends only an id; the mock's code is
 * fetched when the browser is idle and drawn when its panel is on screen.
 */
const LOADERS = {
  "radio-calls": () => import("@/components/aio/hub/HubCards").then((m) => m.RadioCallsCard),
  streambot: () => import("@/components/aio/hub/HubCards").then((m) => m.StreamBotCard),
  mfd: () => import("@/components/overlay/OverlayMocks").then((m) => m.MfdMock),
  "ref-pace": () => import("@/components/overlay/OverlayMocks").then((m) => m.RefPaceMock),
  "track-limits": () =>
    import("@/components/overlay/OverlayMocks").then(({ TrackLimitsMock, DamagePredictorMock }) =>
      function TrackLimitsAndDamage() {
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <TrackLimitsMock />
            <DamagePredictorMock />
          </div>
        );
      },
    ),
  "setup-optimiser": () =>
    import("@/components/overlay/SetupOptimiserMock").then((m) => m.SetupOptimiserMock),
  "team-pit-wall": () => import("@/components/overlay/TeamPitWallMock").then((m) => m.TeamPitWallMock),
  "review-lap": () => import("@/components/overlay/ReviewMocks").then((m) => m.ReviewLapMock),
  "race-log": () =>
    import("@/components/overlay/RaceLogMock").then(({ RaceLogMock }) =>
      function RaceLogIncidents() {
        return <RaceLogMock variant="hero" />;
      },
    ),
} as const;

export type LazyVisualId = keyof typeof LOADERS;

// Only ever rendered after mount (see `shown`), so plain React.lazy is enough:
// nothing here takes part in the server render.
const VISUALS = {} as Record<LazyVisualId, ComponentType>;
for (const id of Object.keys(LOADERS) as LazyVisualId[]) {
  const load: () => Promise<ComponentType> = LOADERS[id];
  VISUALS[id] = lazy(() => load().then((Visual) => ({ default: Visual })));
}

export function LazyVisual({ id }: { id: LazyVisualId }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // A panel with `hidden` never intersects, so this fires on first show.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    // Warm the chunk while idle, so switching tabs doesn't wait on the network.
    // Safari has no requestIdleCallback.
    const warm = () => void LOADERS[id]();
    const ric = window.requestIdleCallback as Window["requestIdleCallback"] | undefined;
    const handle = ric ? ric(warm) : window.setTimeout(warm, 2000);
    return () => {
      observer.disconnect();
      if (ric) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [id]);

  const Visual = VISUALS[id];
  return (
    <div ref={ref}>
      {shown && (
        <Suspense fallback={null}>
          <Visual />
        </Suspense>
      )}
    </div>
  );
}
