"use client";

import Link from "next/link";
import { navLinks } from "@/config/site";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface MobileNavProps {
  onLinkClick: () => void;
}

export function MobileNav({ onLinkClick }: MobileNavProps) {
  return (
    <div className="absolute left-0 top-full z-40 w-full animate-in fade-in-20 slide-in-from-top-4 bg-background lg:hidden transition-colors duration-300">
      <div className="flex flex-col items-center justify-center gap-8 px-4 py-12 text-center">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={onLinkClick}
            className="text-xl font-semibold text-text-secondary text-font-secondary-light dark:text-font-secondary-dark"
          >
            {link.label}
          </Link>
        ))}
        <div className="mt-8 flex flex-col items-center gap-6">
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </div>
  );
}
