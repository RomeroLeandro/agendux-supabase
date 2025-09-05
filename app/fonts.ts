import { Poppins } from "next/font/google";
import localFont from "next/font/local";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const adineue = localFont({
  src: [
    {
      path: "../../public/fonts/adineue-PRO-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-adineue",
});
