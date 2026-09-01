import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/marketing/Navbar";
import { MenuOverlay } from "@/components/marketing/MenuOverlay";
import { Footer } from "@/components/marketing/Footer";
import { MarketingThemeProvider } from "@/components/marketing/ThemeProvider";
import { CursorEffect } from "@/components/marketing/CursorEffect";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingThemeProvider
      fontVariables={`${playfairDisplay.variable} ${plusJakartaSans.variable}`}
    >
      <Navbar />
      <MenuOverlay />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Reserves scroll room so the fixed navbar (h-[60px], removed from
          document flow) never permanently covers the tail of the footer
          once the page is scrolled all the way to the bottom. */}
      <div aria-hidden="true" className="h-[60px]" />

      <CursorEffect />
    </MarketingThemeProvider>
  );
}
