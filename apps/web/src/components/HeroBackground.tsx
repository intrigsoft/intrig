import { useId } from 'react'

export function HeroBackground(props: React.ComponentPropsWithoutRef<'svg'>) {
  let id = useId()

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 668 1069"
      width={668}
      height={1069}
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
        <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
      </defs>

      {/* Background grid pattern */}
      <g stroke="#334155" opacity="0.2">
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`h-line-${i}`}
            x1="0"
            x2="668"
            y1={i * 100}
            y2={i * 100}
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`v-line-${i}`}
            y1="0"
            y2="1069"
            x1={i * 100}
            x2={i * 100}
            strokeWidth="0.5"
          />
        ))}
      </g>

      {/* Dynamic connectivity lines */}
      <g stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round">
        <path d="M100 200 Q200 300, 300 200 T500 400" />
        <path d="M50 800 T300 700 Q400 600, 550 800" />
        <path d="M150 400 Q250 500, 450 300 T650 500" />
      </g>

      {/* Interactive dots */}
      <g>
        {[
          { cx: 100, cy: 200 },
          { cx: 300, cy: 200 },
          { cx: 500, cy: 400 },
          { cx: 50, cy: 800 },
          { cx: 300, cy: 700 },
          { cx: 550, cy: 800 },
          { cx: 150, cy: 400 },
          { cx: 450, cy: 300 },
          { cx: 650, cy: 500 },
        ].map(({ cx, cy }, i) => (
          <circle
            key={`circle-${i}`}
            cx={cx}
            cy={cy}
            r="8"
            fill="url(#circleGradient)"
            opacity="0.8"
          />
        ))}
      </g>
    </svg>
  )
}
