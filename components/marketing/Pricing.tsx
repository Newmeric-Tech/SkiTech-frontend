"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { SectionSeam } from "./SectionSeam";

const font = "var(--mk-font-serif)";
const bodyFont = "var(--mk-font-sans)";

const plans = [
  {
    name: "Starter",
    desc: "Perfect for single-property operators getting started.",
    price: { monthly: 49, annual: 39 },
    cta: "Get Started",
    ctaStyle: "border",
    href: "/demo",
    features: [
      "Up to 3 properties",
      "Up to 50 employees",
      "SOP Management",
      "Attendance Tracking",
      "Inventory Management",
      "Reports & Analytics",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Professional",
    desc: "For growing teams managing multiple properties.",
    price: { monthly: 99, annual: 79 },
    cta: "Get Started",
    ctaStyle: "filled",
    href: "/demo",
    features: [
      "Unlimited properties",
      "Unlimited employees",
      "KRA Monitoring",
      "Reports & Analytics",
      "SOP Management",
      "Attendance Tracking",
      "Vendor Management",
      "Inventory Management",
      "Governance & Compliance",
      "Role-based access control",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    desc: "Custom solutions for large property portfolios.",
    price: { monthly: null, annual: null },
    cta: "Contact Sales",
    ctaStyle: "border",
    href: "/contact",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
      "On-premise deployment",
    ],
    popular: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [annual, setAnnual] = useState(false);

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-24 relative isolate"
      style={{ background: "var(--mk-surface-1)", fontFamily: bodyFont }}
    >
      <SectionSeam from="--mk-bg" to="--mk-surface-1" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          {/* Section label */}
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ fontWeight: 700, color: "var(--mk-text-2)" }}
          >
            Pricing
          </p>

          {/* Heading */}
          <h2
            style={{
              fontSize:      "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight:    900,
              color:         "var(--mk-text-1)",
              lineHeight:    1.15,
              letterSpacing: "-0.01em",
              fontFamily:    font,
            }}
          >
            Simple,{" "}
            <span style={{ borderBottom: "3px solid var(--mk-text-1)", paddingBottom: "2px" }}>
              Transparent Pricing
            </span>
          </h2>

          <p className="mt-3 text-sm" style={{ fontWeight: 300, color: "var(--mk-text-2)" }}>
            Start with a 14-day free trial. No credit card required.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-center gap-3 mt-8 mb-12"
        >
          <span
            className="text-sm"
            style={{
              fontWeight: annual ? 400 : 700,
              color:      annual ? "var(--mk-text-3)" : "var(--mk-text-1)",
            }}
          >
            Monthly
          </span>

          <button
            onClick={() => setAnnual(!annual)}
            className="relative w-12 h-6 rounded-full transition-colors duration-300"
            style={{ background: annual ? "var(--mk-accent)" : "var(--mk-border-strong)" }}
          >
            <motion.div
              animate={{ x: annual ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full shadow"
              style={{ background: "var(--mk-surface-1)" }}
            />
          </button>

          <span
            className="text-sm"
            style={{
              fontWeight: annual ? 700 : 400,
              color:      annual ? "var(--mk-text-1)" : "var(--mk-text-3)",
            }}
          >
            Annual
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded-full"
              style={{
                background:  "var(--mk-glass-bg)",
                color:       "var(--mk-text-1)",
                border:      "1px solid var(--mk-border)",
              }}
            >
              Save 20%
            </span>
          </span>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 36 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: plan.popular ? -6 : -4 }}
              className="relative rounded-2xl p-8 transition-all duration-300 backdrop-blur-lg"
              style={
                plan.popular
                  ? {
                      background: "var(--mk-tile-glass-spotlight-bg)",
                      border:     "1px solid var(--mk-tile-glass-spotlight-border)",
                      boxShadow:  "var(--mk-shadow-lg)",
                    }
                  : {
                      background: "var(--mk-tile-glass-bg)",
                      border:     "1px solid var(--mk-tile-glass-border)",
                      boxShadow:  "var(--mk-shadow-md)",
                    }
              }
            >
              {/* Most Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div
                    className="text-xs px-4 py-1 rounded-full flex items-center gap-1"
                    style={{
                      background: "var(--mk-surface-1)",
                      color:      "var(--mk-text-1)",
                      fontWeight: 700,
                      border:     "1.5px solid var(--mk-border-strong)",
                      boxShadow:  "var(--mk-shadow-md)",
                    }}
                  >
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                </div>
              )}

              {/* Plan name & desc */}
              <div className="mb-6">
                <h3
                  style={{
                    fontSize:   "1.15rem",
                    fontWeight: 700,
                    color:      plan.popular ? "var(--mk-btn-primary-text)" : "var(--mk-text-1)",
                  }}
                >
                  {plan.name}
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{
                    fontWeight: 300,
                    color:      plan.popular
                      ? `color-mix(in srgb, var(--mk-btn-primary-text) 65%, transparent)`
                      : "var(--mk-text-2)",
                  }}
                >
                  {plan.desc}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price.monthly ? (
                  <div className="flex items-end gap-1">
                    <span
                      style={{
                        fontSize:   "2.75rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        color:      plan.popular ? "var(--mk-btn-primary-text)" : "var(--mk-text-1)",
                      }}
                    >
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span
                      className="text-sm mb-1.5"
                      style={{
                        fontWeight: 300,
                        color:      plan.popular
                          ? `color-mix(in srgb, var(--mk-btn-primary-text) 55%, transparent)`
                          : "var(--mk-text-2)",
                      }}
                    >
                      /month
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize:   "2rem",
                      fontWeight: 900,
                      color:      plan.popular ? "var(--mk-btn-primary-text)" : "var(--mk-text-1)",
                    }}
                  >
                    Custom
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={plan.href}
                  className="w-full py-3 rounded-xl text-sm transition-all duration-200 mb-8 block text-center"
                  style={
                    plan.popular
                      ? {
                          background: "var(--mk-surface-1)",
                          color:      "var(--mk-text-1)",
                          fontWeight: 700,
                        }
                      : {
                          background: "var(--mk-btn-primary-bg)",
                          color:      "var(--mk-btn-primary-text)",
                          fontWeight: 700,
                          border:     "1.5px solid var(--mk-btn-primary-bg)",
                        }
                  }
                >
                  {plan.cta}
                </Link>
              </motion.div>

              {/* Features list */}
              <ul className="space-y-3">
                {plan.features.map((f, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-2.5 text-sm"
                    style={{
                      fontWeight: 400,
                      color:      plan.popular
                        ? `color-mix(in srgb, var(--mk-btn-primary-text) 75%, transparent)`
                        : "var(--mk-text-2)",
                    }}
                  >
                    <Check
                      className="w-4 h-4 flex-shrink-0"
                      style={{
                        color: plan.popular ? "var(--mk-btn-primary-text)" : "var(--mk-accent)",
                      }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
