import { renderAioSocialImage, SOCIAL_IMAGE_SIZE } from "../apex-overlay-system/social-image";
import { RACELAB } from "@/lib/aio-compare/racelab";

export const alt = `${RACELAB.social.headline}: ${RACELAB.social.tagline}`;
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage(RACELAB.social);
}
