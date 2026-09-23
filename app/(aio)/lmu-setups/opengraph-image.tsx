import {
  renderAioSocialImage,
  SOCIAL_IMAGE_SIZE,
} from "../apex-overlay-system/social-image";

export const alt = "LMU Setups · Apex AIO — Community setups with verified lap times.";
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage({
    headline: "LMU Setups",
    tagline: "Community setups with verified lap times.",
  });
}
