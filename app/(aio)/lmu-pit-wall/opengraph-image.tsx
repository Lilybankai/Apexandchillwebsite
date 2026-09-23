import {
  renderAioSocialImage,
  SOCIAL_IMAGE_SIZE,
} from "../apex-overlay-system/social-image";

export const alt = "LMU Pit Wall · Apex AIO — Engineer your teammate from any browser.";
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage({
    headline: "LMU Pit Wall",
    tagline: "Engineer your teammate from any browser.",
  });
}
