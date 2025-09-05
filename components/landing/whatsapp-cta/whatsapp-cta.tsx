"use client";

import { useState } from "react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { CustomPhoneInput } from "@/components/ui/phone-input";
import { ArrowRight } from "lucide-react";
import type { E164Number } from "libphonenumber-js/core";

export function WhatsAppSection() {
  const [phoneNumber, setPhoneNumber] = useState<E164Number | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber) {
      alert(`Mensaje de prueba enviado al: ${phoneNumber}`);
    }
  };

  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container mx-auto flex flex-col items-center px-4 text-center">
        <Typography
          variant="heading-xl"
          as="h2"
          className="text-white font-adineue-bold"
        >
          ¿Quieres recibir un mensaje de ejemplo en tu WhatsApp?
        </Typography>

        <Typography
          variant="body-lg"
          className="mt-4 max-w-2xl text-font-primary-dark"
        >
          Prueba cómo funciona Agendux recibiendo un mensaje de demostración en
          tu teléfono.
        </Typography>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex w-full max-w-md flex-col gap-4 sm:flex-row"
        >
          <div className="relative flex-grow">
            <CustomPhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-accent hover:bg-green-600 focus:ring-green-400 flex items-center justify-center"
          >
            <span>Enviar</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        <Typography variant="body-sm" className="mt-4 text-white/70">
          No te preocupes, no guardamos tu número ni te enviaremos spam.
        </Typography>
      </div>
    </section>
  );
}
