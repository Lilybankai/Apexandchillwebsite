import { renderAioSocialImage, SOCIAL_IMAGE_SIZE } from "../apex-overlay-system/social-image";
import { CREW_CHIEF } from "@/lib/aio-compare/crew-chief";

export const alt = `${CREW_CHIEF.social.headline}: ${CREW_CHIEF.social.tagline}`;
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage(CREW_CHIEF.social);
}
