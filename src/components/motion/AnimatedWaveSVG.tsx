/** Decorative animated SVG sine wave, used as an overlay (e.g. on voice portraits). */
export function AnimatedWaveSVG({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="wg" x1="0" x2="1">
          <stop offset="0" stopColor="hsl(var(--signal))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--signal))" stopOpacity="1" />
          <stop offset="1" stopColor="hsl(var(--signal))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 30 Q 25 5, 50 30 T 100 30 T 150 30 T 200 30"
        fill="none"
        stroke="url(#wg)"
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <animate attributeName="d"
          values="M0 30 Q 25 5, 50 30 T 100 30 T 150 30 T 200 30;
                  M0 30 Q 25 55, 50 30 T 100 30 T 150 30 T 200 30;
                  M0 30 Q 25 5, 50 30 T 100 30 T 150 30 T 200 30"
          dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
