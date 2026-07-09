export function SectionSeam({
  from,
  to,
  height = 140,
}: {
  from: string
  to: string
  height?: number
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-0 right-0 pointer-events-none"
      style={{
        height,
        background: `linear-gradient(to bottom, var(${from}), var(${to}))`,
        zIndex: -1,
      }}
    />
  )
}
