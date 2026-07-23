// Inline icon set from the Rev H mockup. Sized by the caller via className;
// stroke follows currentColor.

type IconProps = { className?: string };

export function IconSearch({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l4 4" />
    </svg>
  );
}

export function IconAccount({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
    >
      <circle cx="10" cy="7" r="3.2" />
      <path d="M4 17c0-3.3 2.7-5 6-5s6 1.7 6 5" />
    </svg>
  );
}

export function IconChat({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
    >
      <path d="M17 12a2 2 0 01-2 2H7l-4 3V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

export function IconGarage({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
    >
      <path d="M2 8l8-5 8 5v9H2z" />
      <path d="M6 17v-5h8v5" />
    </svg>
  );
}

export function IconMountain({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      aria-hidden="true"
    >
      <path d="M1 12l4.2-8.2L9 9.5l2-3.2L15 12z" />
    </svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      aria-hidden="true"
    >
      <rect x="3" y="1" width="8" height="14" rx="1.7" />
      <path d="M6 12.6h2" />
    </svg>
  );
}

export function IconBurger({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path d="M0 1h20M0 7h20M0 13h20" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      aria-hidden="true"
    >
      <path d="M1 1l14 14M15 1L1 15" />
    </svg>
  );
}
