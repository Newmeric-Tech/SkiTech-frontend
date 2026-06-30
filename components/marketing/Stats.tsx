"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { CountUpStat } from "./CountUpStat";

const stats = [
  { to: 50,   suffix: "+",  decimals: 0, separator: false, label: "Properties Managed" },
  { to: 1200, suffix: "+",  decimals: 0, separator: true,  label: "Active Users" },
  { to: 99.9, suffix: "%",  decimals: 1, separator: false, label: "Uptime SLA" },
  { to: 4.8,  suffix: "★",  decimals: 1, separator: false, label: "User Rating" },
];

export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-16 border-y"
      style={{
        background:   "var(--mk-bg)",
        borderColor:  "var(--mk-border)",
        fontFamily:   "Merriweather, serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="text-center"
            >
              <div
                style={{
                  fontSize:   "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 800,
                  fontFamily: "Merriweather, serif",
                  color:      "var(--mk-text-1)",
                }}
              >
                <CountUpStat
                  to={stat.to}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  separator={stat.separator}
                />
              </div>
              <p
                className="mt-1.5 text-sm"
                style={{ fontFamily: "Merriweather, serif", color: "var(--mk-text-2)" }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
