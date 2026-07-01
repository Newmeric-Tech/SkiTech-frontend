import { Navbar } from "@/components/marketing/Navbar";
import { MenuOverlay } from "@/components/marketing/MenuOverlay";
import { Footer } from "@/components/marketing/Footer";
import { MarketingThemeProvider } from "@/components/marketing/ThemeProvider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingThemeProvider>
      <Navbar />
      <MenuOverlay />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Cursor divs after all content — later DOM order + z-index 10000+ beats nav backdrop-filter */}
      <div id="cursor-glow" aria-hidden="true" />
      <div id="cursor-ring" aria-hidden="true" />
      <div id="cursor-dot"  aria-hidden="true" />

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var glowEl = document.getElementById('cursor-glow');
  var dotEl  = document.getElementById('cursor-dot');
  var ringEl = document.getElementById('cursor-ring');
  if (!glowEl || !dotEl || !ringEl) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var mx = 0, my = 0, rx = 0, ry = 0, revealed = false;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX;
    my = e.clientY;
    if (!revealed) {
      rx = mx; ry = my;
      glowEl.style.opacity = '1';
      dotEl.style.opacity  = '0.85';
      ringEl.style.opacity = '1';
      revealed = true;
    }
    glowEl.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    dotEl.style.transform  = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
  });

  (function lerpRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ringEl.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    requestAnimationFrame(lerpRing);
  })();
})();
          `,
        }}
      />
    </MarketingThemeProvider>
  );
}
