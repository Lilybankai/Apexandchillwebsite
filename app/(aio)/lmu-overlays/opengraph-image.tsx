import {
  renderAioSocialImage,
  SOCIAL_IMAGE_SIZE,
} from "../apex-overlay-system/social-image";

export const alt = "LMU Overlays · Apex AIO — 20 overlays for OBS and in-game.";
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage({
    headline: "LMU Overlays",
    tagline: "20 overlays for OBS and in-game.",
  });
}
