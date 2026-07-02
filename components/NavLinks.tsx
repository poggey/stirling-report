"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Today", href: "/" },
  { label: "Archive", href: "/archive" },
  { label: "Curve", href: "/curve" },
  { label: "Diary", href: "/diary" },
  { label: "Learn", href: "/learn" },
];

/** Primary navigation with the brass underline tracking the current section. */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden min-[960px]:flex min-[960px]:gap-[26px]">
      {NAV.map(({ label, href }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`caps border-b-2 py-1 !text-xs ${
              active
                ? "border-brass text-brg"
                : "border-transparent text-muted hover:text-brg"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
