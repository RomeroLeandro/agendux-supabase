"use client";
import Link from "next/link";

export function BackButton() {
  return (
    <Link
      href="/"
      className="flex items-center rounded-md p-2 text-sm text-muted-foreground no-underline hover:text-primary mt-2 transition-colors"
    >
      Volver
    </Link>
  );
}
