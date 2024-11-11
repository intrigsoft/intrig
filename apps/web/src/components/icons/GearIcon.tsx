import { DarkMode, Gradient, LightMode } from '@/components/Icon'

export function GearIcon({
                           id,
                           color,
                         }: {
  id: string
  color?: React.ComponentProps<typeof Gradient>['color']
}) {
  return (
    <>
      <defs>
        <Gradient
          id={`${id}-gradient`}
          color={color}
          gradientTransform="rotate(65.924 1.519 20.92) scale(25.7391)"
        />
        <Gradient
          id={`${id}-gradient-dark`}
          color={color}
          gradientTransform="matrix(0 24.5 -24.5 0 16 5.5)"
        />
      </defs>
      <LightMode>
        <circle cx={20} cy={20} r={12} fill={`url(#${id}-gradient)`} />
        <path
          d="M3 16c0 7.18 5.82 13 13 13s13-5.82 13-13S23.18 3 16 3 3 8.82 3 16Z"
          fillOpacity={0.5}
          className="fill-[var(--icon-background)] stroke-[color:var(--icon-foreground)]"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Gear shape for light mode */}
        <path
          d="M16 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-6.6 4c0-.5.1-.9.2-1.3l-1.4-1.1c-.3-.2-.3-.6-.2-.9l.8-1.5c.2-.3.5-.4.8-.3l1.7.4c.7-.6 1.5-1 2.4-1.2V9c0-.4.3-.7.7-.7h1.7c.4 0 .7.3.7.7v1.2c.9.2 1.7.6 2.4 1.2l1.7-.4c.3-.1.7 0 .8.3l.8 1.5c.2.3.1.7-.2.9L20 14.7c.1.4.2.8.2 1.3s-.1.9-.2 1.3l1.4 1.1c.3.2.3.6.2.9l-.8 1.5c-.2.3-.5.4-.8.3l-1.7-.4c-.7.6-1.5 1-2.4 1.2V22c0 .4-.3.7-.7.7h-1.7c-.4 0-.7-.3-.7-.7v-1.2c-.9-.2-1.7-.6-2.4-1.2l-1.7.4c-.3.1-.7 0-.8-.3l-.8-1.5c-.2-.3-.1-.7.2-.9l1.4-1.1c-.1-.4-.2-.8-.2-1.3z"
          className="fill-[var(--icon-foreground)] stroke-[color:var(--icon-foreground)]"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </LightMode>
      <DarkMode>
        {/* Gear shape for dark mode */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 16C2 8.268 8.268 2 16 2s14 6.268 14 14-6.268 14-14 14S2 23.732 2 16zm14.5-7h-1c-.3 0-.5.2-.5.5v1.2a5.5 5.5 0 0 0-2.2 1.1l-1-.6c-.2-.2-.5-.1-.7.1l-.8 1.3c-.2.2-.1.5.1.7l1 .6c-.2.7-.2 1.4 0 2.2l-1 .6c-.2.2-.3.5-.1.7l.8 1.3c.2.2.5.3.7.1l1-.6c.6.5 1.4.9 2.2 1.1v1.2c0 .3.2.5.5.5h1c.3 0 .5-.2.5-.5v-1.2c.8-.2 1.6-.6 2.2-1.1l1 .6c.2.2.5.1.7-.1l.8-1.3c.2-.2.1-.5-.1-.7l-1-.6c.2-.7.2-1.4 0-2.2l1-.6c.2-.2.3-.5.1-.7l-.8-1.3c-.2-.2-.5-.3-.7-.1l-1 .6a5.5 5.5 0 0 0-2.2-1.1V9.5c0-.3-.2-.5-.5-.5zm-.5 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
          fill={`url(#${id}-gradient-dark)`}
        />
      </DarkMode>
    </>
  )
}
