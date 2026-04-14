type IconProps = {
  active?: boolean
  className?: string
}

const color = (active?: boolean) => (active ? '#00FFB2' : '#3A3A50')

export function ConvertIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M7 5h10v10"
        stroke={color(active)}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 15l-2.6-2.6"
        stroke={color(active)}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 5l2 2-2 2"
        stroke={color(active)}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 19H7V9"
        stroke={color(active)}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9l-2-2 2-2"
        stroke={color(active)}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 19l2.6-2.6"
        stroke={color(active)}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CalcIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="1.2" fill={color(active)} />
      <circle cx="12" cy="6" r="1.2" fill={color(active)} />
      <path
        d="M17.5 4.8l1.7 1.2-1.7 1.2-1.7-1.2 1.7-1.2Z"
        stroke={color(active)}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="12" r="1.2" fill={color(active)} />
      <circle cx="12" cy="12" r="1.2" fill={color(active)} />
      <circle cx="18" cy="12" r="1.2" fill={color(active)} />
      <circle cx="6" cy="18" r="1.2" fill={color(active)} />
      <circle cx="12" cy="18" r="1.2" fill={color(active)} />
      <circle cx="18" cy="18" r="1.2" fill={color(active)} />
    </svg>
  )
}

export function NotesIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        stroke={color(active)}
        strokeWidth="1.5"
      />
      <path
        d="M7 9h10M7 12h10M7 15h6"
        stroke={color(active)}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13 15h2v2"
        stroke={color(active)}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ClockIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 4a8 8 0 1 1-5.6 2.3"
        stroke={color(active)}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 8v4l2.6 1.6" stroke={color(active)} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="0.9" fill={color(active)} />
      <path d="M4 7.5h2" stroke={color(active)} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
