'use client'

import { useState } from 'react'

const items = [
  { dot: 'green',  label: 'Properties Managed', value: '50+'      },
  { dot: 'accent', label: 'Active Users',        value: '1,200+'   },
  { dot: 'green',  label: 'Uptime SLA',          value: '99.9%'    },
  { dot: 'amber',  label: 'User Rating',         value: '4.8 ★'   },
  { dot: 'accent', label: 'SOPs Distributed',    value: '340+'     },
  { dot: 'amber',  label: 'KRAs Tracked Daily',  value: '2,800+'   },
  { dot: 'green',  label: 'Avg Setup Time',      value: '< 1 hr'   },
  { dot: 'accent', label: 'Data Security',       value: 'AES-256'  },
]

/* Duplicated for seamless loop */
const track = [...items, ...items]

const dotColor: Record<string, string> = {
  green:  'var(--mk-success)',
  amber:  'var(--mk-warning)',
  accent: 'var(--mk-accent)',
}

export function MarqueeTicker() {
  const [paused, setPaused] = useState(false)

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: 44,
        background: 'var(--mk-surface-1)',
        borderTop:    '1px solid var(--mk-border)',
        borderBottom: '1px solid var(--mk-border)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left fade mask */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, var(--mk-surface-1), transparent)',
        }}
      />
      {/* Right fade mask */}
      <div
        className="absolute inset-y-0 right-0 z-10 w-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(to left, var(--mk-surface-1), transparent)',
        }}
      />

      {/* Scrolling track */}
      <div
        className="flex items-center h-full"
        style={{
          animation: `mk-marquee 38s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
          width: 'max-content',
        }}
      >
        {track.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-8 flex-shrink-0"
          >
            {/* Status dot */}
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: dotColor[item.dot] }}
            />

            {/* Label */}
            <span
              className="text-[12px] whitespace-nowrap"
              style={{ color: 'var(--mk-text-2)', fontWeight: 400 }}
            >
              {item.label}
            </span>

            {/* Value */}
            <span
              className="text-[12px] whitespace-nowrap"
              style={{ color: 'var(--mk-text-1)', fontWeight: 700 }}
            >
              {item.value}
            </span>

            {/* Separator */}
            <span
              className="w-px h-3 ml-2 flex-shrink-0"
              style={{ background: 'var(--mk-border)' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
