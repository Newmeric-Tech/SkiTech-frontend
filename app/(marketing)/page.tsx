import Hero from "@/components/marketing/Hero";
import { ZoomParallax } from "@/components/marketing/ZoomParallax";
import { MarqueeTicker } from "@/components/marketing/MarqueeTicker";
import AboutUs from "@/components/marketing/AboutUs";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Pricing } from "@/components/marketing/Pricing";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <ZoomParallax />
      <MarqueeTicker />
      <Features />
      <HowItWorks />
      <AboutUs />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
