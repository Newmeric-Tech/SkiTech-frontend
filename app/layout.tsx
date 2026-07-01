import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import { SharedStoreProvider } from "../store/SharedStore";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import ChatWidgetGate from "@/components/chat/ChatWidgetGate";
import { GoogleOAuthProvider } from "@react-oauth/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "SkiTech",
  description: "SkiTech Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${merriweather.variable} font-sans antialiased`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <ThemeProvider attribute="data-theme" enableSystem={true} storageKey="next-theme-unused">
            <SharedStoreProvider>
              {children}
              <Toaster richColors position="top-right" />
              <ChatWidgetGate />
            </SharedStoreProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
