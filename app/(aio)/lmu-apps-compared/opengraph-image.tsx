import { renderAioSocialImage, SOCIAL_IMAGE_SIZE } from "../apex-overlay-system/social-image";

export const alt = "LMU apps compared: RaceLab, SimHub, Crew Chief, Coach Dave and Apex AIO.";
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderAioSocialImage({ headline: "LMU apps compared", tagline: "RaceLab, SimHub, Crew Chief, Coach Dave and Apex AIO." });
}
