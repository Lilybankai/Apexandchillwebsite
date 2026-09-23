import {
  renderAioSocialImage,
  SOCIAL_IMAGE_SIZE,
} from "../apex-overlay-system/social-image";

export const alt = "LMU Race Engineer · Apex AIO — Ask out loud. Answered from live telemetry.";
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage({
    headline: "LMU Race Engineer",
    tagline: "Ask out loud. Answered from live telemetry.",
  });
}
