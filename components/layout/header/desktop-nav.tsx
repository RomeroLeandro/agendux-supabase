"use client";

import Link from "next/link";
import { navLinks } from "@/config/site";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function DesktopNav() {
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState("/#inicio");

  useEffect(() => {
    if (pathname !== "/") {
      setActiveLink("");
      return;
    }
    setActiveLink("/#inicio");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(`/#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-20% 0px -80% 0px",
      }
    );

    const sections = navLinks
      .map((link) => document.getElementById(link.href.substring(2)))
      .filter((section): section is HTMLElement => section !== null);

    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [pathname]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const sectionId = href.substring(2);
      const section = document.getElementById(sectionId);

      if (section) {
        setActiveLink(href);
        window.scrollTo({
          top: section.offsetTop - 80,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <nav className="hidden flex-grow items-center justify-between lg:flex">
      <div className="flex items-center gap-8 mx-auto">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={(e) => handleLinkClick(e, link.href)}
            className={`font-poppins font-semibold transition-colors ${
              activeLink === link.href
                ? "text-primary"
                : "text-muted-foreground hover:text-primary transition-colors"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <AuthButton />
      </div>
    </nav>
  );
}
