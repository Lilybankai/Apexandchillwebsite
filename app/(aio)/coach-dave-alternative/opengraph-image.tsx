import { renderAioSocialImage, SOCIAL_IMAGE_SIZE } from "../apex-overlay-system/social-image";
import { COACH_DAVE } from "@/lib/aio-compare/coach-dave";

export const alt = `${COACH_DAVE.social.headline}: ${COACH_DAVE.social.tagline}`;
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage(COACH_DAVE.social);
}
