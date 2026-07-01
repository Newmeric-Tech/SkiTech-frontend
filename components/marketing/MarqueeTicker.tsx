'use client'

import { useState } from 'react'

const items = [
  { dot: 'green',  label: 'Room 204 checked in',          value: 'Just now'       },
  { dot: 'amber',  label: 'Low stock: Minibar',           value: '8 units left'   },
  { dot: 'accent', label: 'SOP Compliance',               value: '94%'            },
  { dot: 'green',  label: '12 staff on shift',            value: 'Property A'     },
  { dot: 'accent', label: 'KRA submissions due',          value: '6 pending'      },
  { dot: 'green',  label: 'Revenue this month',           value: '₹2.4L'          },
  { dot: 'amber',  label: 'HVAC maintenance',             value: 'Assigned'       },
  { dot: 'green',  label: 'Weekly schedule published',    value: 'Property B'     },
  { dot: 'accent', label: 'Occupancy rate',               value: '78%'            },
  { dot: 'green',  label: 'New SOP version approved',     value: 'Housekeeping'   },
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
          animation: `mk-marquee 28s linear infinite`,
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
