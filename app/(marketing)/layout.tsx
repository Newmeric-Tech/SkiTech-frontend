import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { MarketingThemeProvider } from "@/components/marketing/ThemeProvider";
import { CustomCursor } from "@/components/marketing/CustomCursor";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingThemeProvider>
      <CustomCursor />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </MarketingThemeProvider>
  );
}
