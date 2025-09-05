"use client";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="w-full space-y-4">
      {items.map((item, index) => (
        <Disclosure key={index} as="div">
          {({ open }) => (
            <div className="bg-background dark:bg-card transition-colors duration-300 border border-border shadow-md rounded-2xl">
              <Disclosure.Button className="flex w-full items-center justify-between px-6 py-4 text-left">
                <span className="text-lg font-adineue-bold text-foreground">
                  {item.question}
                </span>
                <ChevronDown
                  className={clsx(
                    "h-5 w-5 text-muted-foreground transition-transform duration-300",
                    { "rotate-180 text-primary": open }
                  )}
                />
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform -translate-y-2 opacity-0"
                enterTo="transform translate-y-0 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform translate-y-0 opacity-100"
                leaveTo="transform -translate-y-2 opacity-0"
              >
                <Disclosure.Panel className="px-6 pb-4 text-muted-foreground">
                  {item.answer}
                </Disclosure.Panel>
              </Transition>
            </div>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
