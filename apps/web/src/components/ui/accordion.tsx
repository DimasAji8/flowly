"use client";

import { Accordion as AccordionPrimitive } from "radix-ui";
import { ChevronDown } from "lucide-react";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ value, trigger, children }: { value: string; trigger: React.ReactNode; children: React.ReactNode }) {
  return (
    <AccordionPrimitive.Item value={value} className="accordion-item">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="accordion-trigger">
          {trigger}
          <ChevronDown size={18} className="accordion-chevron" aria-hidden />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="accordion-content">
        <div className="accordion-body">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
