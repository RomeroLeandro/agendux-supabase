import { Typography } from "@/components/ui/typography";
import { footerLinks } from "@/config/site";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/Logo.webp";

export function Footer() {
  return (
    <footer className="bg-footer">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Columna del Logo */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Image src={Logo} alt="Logo de Agendux" className="h-8 w-auto" />
            </Link>
            <Typography
              variant="body-md"
              className="mt-4 max-w-xs text-gray-400 "
            >
              App para Agendar, Confirmar y Recordar citas por WhatsApp.
            </Typography>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title}>
              <Typography
                variant="heading-sm"
                as="h3"
                className="mb-4 text-gray-200"
              >
                {column.title}
              </Typography>
              <nav className="mt-4">
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className=" transition-colors text-gray-400 hover:text-gray-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8 text-center md:text-left">
          <Typography variant="body-sm" className="text-gray-400">
            © {new Date().getFullYear()} Agendux, LLC. Todos los derechos
            reservados.
          </Typography>
        </div>
      </div>
    </footer>
  );
}
