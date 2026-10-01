export function Logo({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 27 : 33}
      height={small ? 27 : 33}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 2 36 11v18L20 38 4 29V11L20 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="m20 9 10 5.5v11L20 31l-10-5.5v-11L20 9Z"
        stroke="currentColor"
        strokeOpacity=".45"
      />
      <path
        d="M24 13v10.5a4 4 0 0 1-8 0V22"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="20" cy="4" r="2" fill="currentColor" />
    </svg>
  );
}
