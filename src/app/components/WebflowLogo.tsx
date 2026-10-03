export default function WebflowLogo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const w = size;
  const h = Math.round((size * 28) / 40);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 40 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Webflow"
      role="img"
    >
      <path
        d="M40 0L25.95 27.6H12.75L18.6 16.2H18.35C13.5 22.55 6.3 26.75 0 27.6V16.35C0 16.35 3.95 16.1 6.3 13.65H0V0.005H11.25V9.3L11.5 9.3L16.05 0H24.55L23.65 8.15L25.2 8.15L29.25 0H40Z"
        fill="url(#wf-mark)"
      />
      <defs>
        <linearGradient id="wf-mark" x1="0" y1="0" x2="40" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4353FF" />
          <stop offset="1" stopColor="#146EF5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
