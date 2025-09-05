"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import Logo from "@/assets/Logo.webp";
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-50 w-full bg-background transition-colors duration-300 border-b border-gray-200 dark:border-gray-900">
      <div className="container mx-auto flex h-20 items-center justify-between gap-8 px-4">
        <Link href="/">
          <Image
            src={Logo}
            alt="Logo de Agendux"
            className="h-8 w-auto"
            priority
          />
        </Link>
        <DesktopNav />
        <div className="lg:hidden">
          <button onClick={toggleMenu} aria-label="Toggle menu" className="p-2">
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      {isMenuOpen && <MobileNav onLinkClick={toggleMenu} />}
    </header>
  );
}
