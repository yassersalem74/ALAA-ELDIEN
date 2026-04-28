export default function ProfileNavIcon({ name, className = "h-5 w-5" }) {
  const sharedProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...sharedProps}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="11" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="17.5" width="7" height="3" rx="1.5" />
        </svg>
      );
    case "user":
      return (
        <svg {...sharedProps}>
          <path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
          <path d="M5 20.25a7 7 0 0 1 14 0" />
        </svg>
      );
    case "bell":
      return (
        <svg {...sharedProps}>
          <path d="M9.75 20.25h4.5" />
          <path d="M6.75 16.5h10.5a1 1 0 0 0 .79-1.61l-1.54-2.06V10a4.5 4.5 0 0 0-9 0v2.83L5.96 14.9a1 1 0 0 0 .79 1.6Z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...sharedProps}>
          <path d="M7 18.5 3.75 20v-4.75A7.25 7.25 0 0 1 11 8h5a4.25 4.25 0 0 1 0 8.5H10.5L7 18.5Z" />
        </svg>
      );
    case "cart":
      return (
        <svg {...sharedProps}>
          <path d="M5 6h14l-1.25 7H7L5.75 4.75A1 1 0 0 0 4.78 4H3.5" />
          <path d="M8.5 19.5a.75.75 0 1 0 0 .001" />
          <path d="M16.5 19.5a.75.75 0 1 0 0 .001" />
        </svg>
      );
    case "orders":
      return (
        <svg {...sharedProps}>
          <path d="M7 4.5h10a2 2 0 0 1 2 2v12l-3-1.75L13 18.5l-3-1.75-3 1.75v-12a2 2 0 0 1 2-2Z" />
          <path d="M10 9.25h5" />
          <path d="M10 12.75h4" />
        </svg>
      );
    case "provider":
      return (
        <svg {...sharedProps}>
          <path d="M12 4.5 13.9 8l3.85.55-2.78 2.67.66 3.78L12 13.2 8.37 15l.66-3.78-2.78-2.67L10.1 8 12 4.5Z" />
          <path d="M5 19.5h14" />
        </svg>
      );
    case "settings":
      return (
        <svg {...sharedProps}>
          <path d="M12 9.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z" />
          <path d="M18.5 13.25v-2.5l-2.06-.56a4.78 4.78 0 0 0-.54-1.28l1.07-1.84-1.77-1.77-1.84 1.07c-.4-.22-.83-.4-1.28-.54L10.5 3.5H8l-.56 2.06c-.45.14-.88.32-1.28.54L4.32 5.03 2.55 6.8l1.07 1.84c-.22.4-.4.83-.54 1.28L1 10.5V13l2.08.56c.14.45.32.88.54 1.28l-1.07 1.84 1.77 1.77 1.84-1.07c.4.22.83.4 1.28.54L8 20.5h2.5l.56-2.08c.45-.14.88-.32 1.28-.54l1.84 1.07 1.77-1.77-1.07-1.84c.22-.4.4-.83.54-1.28l2.08-.56Z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...sharedProps}>
          <path d="M14.5 7.25V5.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6.5a2 2 0 0 0 2-2v-1.75" />
          <path d="M9.5 12h10" />
          <path d="m16 8.5 3.5 3.5-3.5 3.5" />
        </svg>
      );
    default:
      return null;
  }
}
