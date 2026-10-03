import {
  renderAioSocialImage,
  SOCIAL_IMAGE_SIZE,
} from "../apex-overlay-system/social-image";

export const alt = "LMU Incident Review · Apex AIO — Every incident, one click from the replay.";
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage({
    headline: "LMU Incident Review",
    tagline: "Every incident, one click from the replay.",
  });
}
