"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full rounded-md border border-gray-300 bg-surface px-4 py-2 text-text-primary focus:border-primary focus:ring-primary dark:border-gray-700"
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    rows={4}
    className="w-full rounded-md border border-gray-300 bg-surface px-4 py-2 text-text-primary focus:border-primary focus:ring-primary dark:border-gray-700"
  />
);

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Formulario enviado:\n${JSON.stringify(formData, null, 2)}`);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">
          <Typography as="span" variant="body-sm" className="font-semibold">
            Nombre
          </Typography>
        </label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="email">
          <Typography as="span" variant="body-sm" className="font-semibold">
            Email
          </Typography>
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="message">
          <Typography as="span" variant="body-sm" className="font-semibold">
            Mensaje
          </Typography>
        </label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Enviar Mensaje
      </Button>
    </form>
  );
}
