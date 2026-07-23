"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { SectionSeam } from "./SectionSeam";

const font = "var(--mk-font-serif)";
const bodyFont = "var(--mk-font-sans)";

const faqs = [
  {
    q: "What is SkiTech?",
    a: "SkiTech is a Property Operations Management System that centralizes property management, staff operations, SOPs, task tracking, attendance, and reporting into one powerful dashboard.",
  },
  {
    q: "How many properties can I manage?",
    a: "With our Starter plan, you can manage up to 3 properties. The Professional plan gives you unlimited properties. Enterprise plans are fully custom.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! All plans include a 14-day free trial with full access to all features. No credit card required to get started.",
  },
  {
    q: "Can I import existing data?",
    a: "Absolutely. SkiTech supports CSV import for properties, employees, inventory, and SOPs. Our onboarding team can also assist with bulk data migration for Enterprise customers.",
  },
  {
    q: "What kind of support do you offer?",
    a: "Starter plans include email support. Professional plans get priority support. Enterprise customers receive a dedicated account manager and 24/7 SLA-backed support.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. SkiTech uses enterprise-grade encryption, role-based access control, and regular security audits. All data is stored in compliant data centers with 99.9% uptime SLA.",
  },
];

function FAQItem({
  faq,
  index,
  isPageInView,
}: {
  faq: (typeof faqs)[0];
  index: number;
  isPageInView: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isPageInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.65,
        delay: index * 0.08 + 0.1,
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.45 },
      }}
    >
      <div
        className="rounded-2xl overflow-hidden transition-[border-color,box-shadow] duration-400"
        style={{
          background:   "var(--mk-surface-1)",
          border:       `1px solid ${open ? "var(--mk-border-strong)" : "var(--mk-border)"}`,
          boxShadow:    open ? "var(--mk-shadow-md)" : "none",
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-7 py-5 text-left group"
          aria-expanded={open}
        >
          <span
            className="pr-5 leading-snug transition-opacity duration-300"
            style={{
              fontSize:   "0.93rem",
              fontWeight: open ? 800 : 700,
              fontFamily: bodyFont,
              color:      "var(--mk-text-1)",
            }}
          >
            {faq.q}
          </span>

          {/* Toggle icon */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-400"
            style={
              open
                ? { background: "var(--mk-btn-primary-bg)", border: "1px solid transparent" }
                : { background: "transparent",              border: "1px solid var(--mk-border)" }
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.div
                  key="minus"
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                  exit={{ opacity: 0,   rotate: 90,   scale: 0.7 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <Minus className="w-3.5 h-3.5" style={{ color: "var(--mk-btn-primary-text)" }} />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ opacity: 0, rotate: 90,  scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                  exit={{ opacity: 0,   rotate: -90,  scale: 0.7 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <Plus className="w-3.5 h-3.5" style={{ color: "var(--mk-text-2)" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height:  { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.28, ease: "easeOut" },
              }}
              className="overflow-hidden"
            >
              <div className="px-7 pb-6 pt-0">
                <div className="h-px mb-5" style={{ background: "var(--mk-border)" }} />
                <p
                  className="leading-[1.9]"
                  style={{
                    fontSize:   "0.875rem",
                    fontFamily: bodyFont,
                    color:      "var(--mk-text-2)",
                  }}
                >
                  {faq.a}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-70px" });

  return (
    <section
      id="faqs"
      ref={ref}
      className="py-28 relative isolate"
      style={{ background: "var(--mk-surface-2)", fontFamily: bodyFont }}
    >
      <SectionSeam from="--mk-bg" to="--mk-surface-2" />
      <div className="max-w-2xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="text-[10.5px] uppercase tracking-[0.22em] mb-4"
            style={{ fontWeight: 700, fontFamily: bodyFont, color: "var(--mk-text-2)" }}
          >
            FAQ
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.09, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize:      "clamp(2rem, 4vw, 2.8rem)",
              fontWeight:    800,
              color:         "var(--mk-text-1)",
              lineHeight:    1.12,
              letterSpacing: "-0.02em",
              fontFamily:    font,
            }}
          >
            Frequently Asked{" "}
            <em style={{ fontStyle: "italic", fontWeight: 900 }}>Questions</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="mt-5 max-w-sm mx-auto leading-relaxed"
            style={{ fontSize: "0.88rem", fontFamily: bodyFont, color: "var(--mk-text-3)" }}
          >
            Everything you need to know before you get started.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 mx-auto h-px w-14 origin-center"
            style={{ background: "var(--mk-text-1)" }}
          />
        </div>

        {/* Accordion list */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} isPageInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
