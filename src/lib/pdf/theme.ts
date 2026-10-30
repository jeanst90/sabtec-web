import { Font } from "@react-pdf/renderer";
import {
  SABTEC_LOGO_BASE64,
  SABTEC_FONT_BARLOW_REGULAR_TTF,
  SABTEC_FONT_BARLOW_MEDIUM_TTF,
  SABTEC_FONT_BARLOW_SEMIBOLD_TTF,
  SABTEC_FONT_BARLOW_BOLD_TTF,
  SABTEC_FONT_BARLOCCONDENSED_SEMBOLD_TTF,
  SABTEC_FONT_BARLOCCONDENSED_BOLD_TTF,
} from "./assets";

export const PDF = {
  primary: "#1F1F1F",
  primarySoft: "#2A2A2A",
  accent: "#F95610",
  accentSoft: "#FFF1EB",
  accentBorder: "#FAD7C7",
  muted: "#F6F6F6",
  mutedFg: "#737373",
  softFg: "#A3A3A3",
  border: "#E8E8E8",
  white: "#FFFFFF",
  success: "#16A34A",
  danger: "#DC2626",
  warm: "#FFF7F2",
} as const;

export const SABTEC_LOGO_DATA_URI = `data:image/png;base64,${SABTEC_LOGO_BASE64}`;

const fontDataUri = (base64: string) => `data:font/ttf;base64,${base64}`;

let fontsPromise: Promise<void> | null = null;

function registerFonts() {
  Font.register({
    family: "Barlow",
    fonts: [
      { src: fontDataUri(SABTEC_FONT_BARLOW_REGULAR_TTF), fontWeight: 400 },
      { src: fontDataUri(SABTEC_FONT_BARLOW_MEDIUM_TTF), fontWeight: 500 },
      { src: fontDataUri(SABTEC_FONT_BARLOW_SEMIBOLD_TTF), fontWeight: 600 },
      { src: fontDataUri(SABTEC_FONT_BARLOW_BOLD_TTF), fontWeight: 700 },
    ],
  });

  Font.register({
    family: "Barlow Condensed",
    fonts: [
      { src: fontDataUri(SABTEC_FONT_BARLOCCONDENSED_SEMBOLD_TTF), fontWeight: 600 },
      { src: fontDataUri(SABTEC_FONT_BARLOCCONDENSED_BOLD_TTF), fontWeight: 700 },
    ],
  });
}

async function loadFonts() {
  registerFonts();
  Font.registerHyphenationCallback((word) => [word]);

  await Font.load({ fontFamily: "Barlow", fontStyle: "normal", fontWeight: 400 });
  await Font.load({ fontFamily: "Barlow", fontStyle: "normal", fontWeight: 500 });
  await Font.load({ fontFamily: "Barlow", fontStyle: "normal", fontWeight: 600 });
  await Font.load({ fontFamily: "Barlow", fontStyle: "normal", fontWeight: 700 });
  await Font.load({ fontFamily: "Barlow Condensed", fontStyle: "normal", fontWeight: 600 });
  await Font.load({ fontFamily: "Barlow Condensed", fontStyle: "normal", fontWeight: 700 });
}

export function loadPdfFonts(): Promise<void> {
  if (!fontsPromise) {
    fontsPromise = loadFonts();
  }
  return fontsPromise;
}
