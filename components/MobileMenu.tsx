"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LearnToggle } from "./learn/LearnProvider";

const NAV = [
  { label: "Today", href: "/" },
  { label: "Archive", href: "/archive" },
  { label: "Curve", href: "/curve" },
  { label: "Diary", href: "/diary" },
  { label: "Learn", href: "/learn" },
];

/** The small-screen menu: nav, Learn toggle — everything the wide header
 * carries, reachable with a thumb. Closes on navigation and Escape. */
export function MobileMenu({ date }: { date: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-[960px]:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg border border-line bg-ivory-1"
      >
        <span
          aria-hidden="true"
          className={`block h-[2px] w-[18px] rounded bg-brg transition-transform motion-reduce:transition-none ${open ? "translate-y-[7px] rotate-45" : ""}`}
        />
        <span
          aria-hidden="true"
          className={`block h-[2px] w-[18px] rounded bg-brg transition-opacity motion-reduce:transition-none ${open ? "opacity-0" : ""}`}
        />
        <span
          aria-hidden="true"
          className={`block h-[2px] w-[18px] rounded bg-brg transition-transform motion-reduce:transition-none ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Primary"
          className="absolute inset-x-0 top-full z-40 border-b border-line bg-ivory-1 shadow-card"
        >
          <ul>
            {NAV.map(({ label, href }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={label} className="border-b border-[#EAEBDF]">
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`caps block px-5 py-3.5 !text-xs ${
                      active ? "border-l-2 border-brass bg-sage/60 text-brg" : "text-muted"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-medium text-muted">{date}</span>
            <LearnToggle />
          </div>
        </nav>
      )}
    </div>
  );
}
