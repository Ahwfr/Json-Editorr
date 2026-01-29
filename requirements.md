## Packages
framer-motion | Essential for smooth collapsible animations and page transitions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes safely

## Notes
The application core logic is client-side state management for the JSON editor.
Backend hooks are generated for future persistence but the primary flow is local.
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
  mono: ["var(--font-mono)"],
}
