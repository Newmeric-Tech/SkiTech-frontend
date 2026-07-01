'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useMarketingTheme } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

const menuItems = [
  {
    num: '01', label: 'Home',        href: '/',
    tag: 'Start here',  sub: 'Your journey begins',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=85',
  },
  {
    num: '02', label: 'About',       href: '/about',
    tag: 'Our story',   sub: 'The people behind SkiTech',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=85',
  },
  {
    num: '03', label: 'Features',    href: '/product',
    tag: 'What we do',  sub: 'Powerful tools, refined',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=85',
  },
  {
    num: '04', label: 'Solutions',   href: '/solutions',
    tag: 'For you',     sub: 'Tailored to your needs',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=85',
  },
  {
    num: '05', label: 'Why SkiTech', href: '/why-skitec',
    tag: 'The case',    sub: 'Why we stand apart',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85',
  },
  {
    num: '06', label: 'Pricing',     href: '/pricing',
    tag: 'Fair & clear', sub: 'Transparent pricing',
    img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=85',
  },
  {
    num: '07', label: 'FAQs',        href: '/faqs',
    tag: 'Got questions?', sub: 'We have answers',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=85',
  },
]

/* Preload images on the client so they're ready when the overlay opens */
if (typeof window !== 'undefined') {
  menuItems.forEach(({ img }) => {
    const el = new Image()
    el.src = img
  })
}

/* ── Image crossfade panel ───────────────────────────────────────────────── */
function ImageSlide({
  src, alt, visible, tag, sub,
}: {
  src: string; alt: string; visible: boolean; tag?: string; sub?: string
}) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        animate={{ scale: visible ? 1 : 1.05 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        loading="eager"
      />
      {tag && sub && (
        <motion.div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)',
          }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.3, delay: visible ? 0.1 : 0 }}
        >
          <div className="px-7 pb-7">
            <p
              className="text-[10px] tracking-[0.25em] uppercase mb-1"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {tag}
            </p>
            <p
              className="font-light leading-snug"
              style={{ fontSize: 'clamp(1.1rem,1.6vw,1.5rem)', color: '#ffffff' }}
            >
              {sub}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ── Main overlay ────────────────────────────────────────────────────────── */
export function MenuOverlay() {
  const { isMenuOpen, setMenuOpen } = useMarketingTheme()
  const [hovered, setHovered] = useState<number | null>(null)

  /* lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  /* Escape key closes overlay */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setMenuOpen])

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          key="menu-overlay"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[200] marketing-menu-overlay flex flex-col overflow-hidden"
          style={{ backgroundColor: '#f2f2ef' }}
        >
          {/* ── Top bar ── */}
          <div className="flex items-center justify-between px-8 md:px-16 pt-6 pb-4 shrink-0">
            {/* Logo — always dark on light overlay */}
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: 'var(--menu-text)' }}
              />
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--menu-text)' }}>
                SkiTech
              </span>
            </Link>

            {/* ThemeToggle + Close — stopPropagation so clicks don't bubble */}
            <div
              className="flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <ThemeToggle />

              <motion.button
                onClick={() => setMenuOpen(false)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ border: '1px solid var(--menu-border)', color: 'var(--menu-text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(10,10,10,0.25)'
                  e.currentTarget.style.color = 'var(--menu-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--menu-border)'
                  e.currentTarget.style.color = 'var(--menu-text-muted)'
                }}
              >
                <span className="relative w-3 h-3 flex items-center justify-center">
                  <span
                    className="block w-3 h-[1.5px] rotate-45 absolute"
                    style={{ background: 'currentColor' }}
                  />
                  <span
                    className="block w-3 h-[1.5px] -rotate-45 absolute"
                    style={{ background: 'currentColor' }}
                  />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
                  Close
                </span>
              </motion.button>
            </div>
          </div>

          {/* Top rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="h-px mx-8 md:mx-16 origin-left shrink-0"
            style={{ background: 'var(--menu-border)' }}
          />

          {/* ── Body ── */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* LEFT — numbered nav list */}
            <div className="flex-1 flex items-center min-h-0 overflow-hidden">
              <div className="w-full px-8 md:px-16">
                <motion.div
                  variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                  initial="hidden"
                  animate="show"
                >
                  {menuItems.map((item, i) => (
                    <motion.div
                      key={item.href}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="relative">
                        {/* Hover row tint */}
                        <motion.div
                          className="absolute inset-y-0 -inset-x-8 md:-inset-x-16 pointer-events-none"
                          animate={{ opacity: hovered === i ? 1 : 0 }}
                          transition={{ duration: 0.18 }}
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(0,0,0,0.035) 0%, transparent 80%)',
                          }}
                        />

                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          onMouseEnter={() => setHovered(i)}
                          onMouseLeave={() => setHovered(null)}
                          className="group flex items-center gap-5 md:gap-8 py-[10px] md:py-[12px] relative"
                        >
                          {/* Number + tag */}
                          <div className="flex flex-col items-end w-10 md:w-20 shrink-0">
                            <motion.span
                              animate={{ opacity: hovered === i ? 0.7 : 0.2 }}
                              transition={{ duration: 0.2 }}
                              className="text-[10px] tracking-[0.25em] tabular-nums"
                              style={{ color: 'var(--menu-text)' }}
                            >
                              {item.num}
                            </motion.span>
                            <motion.span
                              animate={{ opacity: hovered === i ? 0.4 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="hidden md:block text-[9px] tracking-widest uppercase mt-0.5 whitespace-nowrap"
                              style={{ color: 'var(--menu-text-muted)' }}
                            >
                              {item.tag}
                            </motion.span>
                          </div>

                          {/* Vertical divider */}
                          <motion.div
                            className="hidden md:block w-px self-stretch"
                            animate={{
                              background:
                                hovered === i
                                  ? 'rgba(10,10,10,0.18)'
                                  : 'rgba(10,10,10,0.07)',
                            }}
                            transition={{ duration: 0.2 }}
                          />

                          {/* Label */}
                          <span
                            className="flex-1 leading-none font-light"
                            style={{
                              fontSize: 'clamp(1.65rem, 3.8vw, 3.4rem)',
                              letterSpacing: '-0.02em',
                              color:
                                hovered === null
                                  ? 'var(--menu-text)'
                                  : hovered === i
                                  ? '#000000'
                                  : 'rgba(10,10,10,0.15)',
                              transition: 'color 0.2s ease',
                            }}
                          >
                            {item.label}
                          </span>

                          {/* Arrow circle */}
                          <motion.div
                            className="shrink-0 w-9 h-9 rounded-full border flex items-center justify-center"
                            style={{ borderColor: 'rgba(10,10,10,0.2)' }}
                            animate={{
                              opacity: hovered === i ? 1 : 0,
                              scale: hovered === i ? 1 : 0.6,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <span
                              className="text-base leading-none"
                              style={{ color: 'rgba(10,10,10,0.5)' }}
                            >
                              →
                            </span>
                          </motion.div>
                        </Link>

                        {/* Item rule */}
                        <div
                          className="h-px"
                          style={{ background: 'var(--menu-border)' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* RIGHT — image panel (desktop only) */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex w-[38%] shrink-0 items-center justify-center py-8 pr-12"
            >
              <div
                className="relative w-full h-full rounded-2xl overflow-hidden"
                style={{
                  background: '#e0dfd9',
                  boxShadow:
                    '0 24px 64px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                {/* Default — first item's image when nothing is hovered */}
                <ImageSlide
                  src={menuItems[0].img}
                  alt="SkiTech"
                  visible={hovered === null}
                />
                {menuItems.map((item, i) => (
                  <ImageSlide
                    key={item.href}
                    src={item.img}
                    alt={item.label}
                    visible={hovered === i}
                    tag={item.tag}
                    sub={item.sub}
                  />
                ))}

                {/* Badge */}
                <motion.div
                  className="absolute top-5 right-5 z-10 px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                  }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span
                    className="text-[9px] tracking-[0.2em] uppercase font-bold"
                    style={{ color: '#0a0a0a' }}
                  >
                    SkiTech
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom bar ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.35 }}
            className="shrink-0"
          >
            <div
              className="h-px mx-8 md:mx-16"
              style={{ background: 'var(--menu-border)' }}
            />
            <div className="flex items-center justify-between px-8 md:px-16 py-4">
              <span
                className="text-[10px] tracking-[0.2em] uppercase"
                style={{ color: 'var(--menu-text-muted)' }}
              >
                © 2026 SkiTech
              </span>
              <div className="flex items-center gap-5">
                {['Instagram ↗', 'Twitter ↗', 'LinkedIn ↗'].map((s) => (
                  <a
                    key={s}
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] tracking-[0.18em] uppercase"
                    style={{ color: 'var(--menu-text-muted)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = 'var(--menu-text)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'var(--menu-text-muted)')
                    }
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
