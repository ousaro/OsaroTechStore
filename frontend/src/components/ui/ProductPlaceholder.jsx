export function ProductPlaceholder({ size = 58, className = "" }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect x="20" y="28" width="80" height="64" rx="8" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="32" y="44" width="56" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="60" cy="60" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35" />
      <line x1="20" y1="78" x2="100" y2="78" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <path d="M48 92h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M60 92v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
      <line x1="44" y1="98" x2="76" y2="98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <circle cx="38" cy="50" r="2.5" fill="currentColor" opacity="0.15" />
      <circle cx="82" cy="50" r="2.5" fill="currentColor" opacity="0.15" />
      <circle cx="60" cy="34" r="1.5" fill="currentColor" opacity="0.3" />
      <path d="M28 36h64" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    </svg>
  );
}
