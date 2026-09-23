import {
  FuelMock,
  MfdMock,
  RaceControlMock,
  RelativeMock,
  StandingsMock,
  TrackLimitsMock,
} from "@/components/overlay/OverlayMocks";
import { AskEngineer } from "@/components/overlay/AskEngineer";
import { TeamPitWallMock } from "@/components/overlay/TeamPitWallMock";
import type { HeroDemoTab } from "@/components/aio/hub/HeroDemo";

/**
 * The hero demo's tabs. The track map, radar and speedo are deliberately not
 * here: they carry fixed SVG ids and already appear in the feature explorer,
 * and each may only be on the page once.
 */
export const HERO_DEMO_TABS: readonly HeroDemoTab[] = [
  {
    id: "overlays",
    label: "Overlays",
    caption: "Standings, relative and fuel — rebuilt from the app's own rendering code.",
    panel: (
      <div className="grid gap-4 md:grid-cols-2">
        <StandingsMock />
        <div className="grid content-start gap-4">
          <RelativeMock />
          <FuelMock />
        </div>
      </div>
    ),
  },
  {
    id: "race-engineer",
    label: "Race engineer",
    caption: "Pick a question — this is the engineer's real answer, spoken back.",
    panel: <AskEngineer className="mx-auto max-w-3xl" />,
  },
  {
    id: "mfd",
    label: "MFD",
    caption: "LMU's pit menu and driving aids, readable and changeable from your wheel.",
    panel: <MfdMock className="mx-auto max-w-3xl" />,
  },
  {
    id: "race-control",
    label: "Race control",
    caption: "Flags, start lights and track-limit points, without the stock HUD.",
    panel: (
      <div className="grid gap-4 md:grid-cols-2">
        <RaceControlMock />
        <TrackLimitsMock />
      </div>
    ),
  },
  {
    id: "pit-wall",
    label: "Pit wall",
    caption: "The team board — in the app, or in any browser while the stint runs.",
    panel: <TeamPitWallMock />,
  },
];
