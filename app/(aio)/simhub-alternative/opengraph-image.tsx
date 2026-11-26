import { renderAioSocialImage, SOCIAL_IMAGE_SIZE } from "../apex-overlay-system/social-image";
import { SIMHUB } from "@/lib/aio-compare/simhub";

export const alt = `${SIMHUB.social.headline}: ${SIMHUB.social.tagline}`;
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage(SIMHUB.social);
}
