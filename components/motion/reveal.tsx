"use client";

import * as m from "motion/react-m";
import type { Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const VIEWPORT = { once: true, margin: "0px 0px -60px 0px" } as const;

type Tag = "div" | "section" | "article" | "li" | "ul" | "ol" | "aside" | "figure";

const TAGS = {
  div: m.div,
  section: m.section,
  article: m.article,
  li: m.li,
  ul: m.ul,
  ol: m.ol,
  aside: m.aside,
  figure: m.figure,
} as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: Tag;
  // Seconds to wait before starting — use small index-based delays (see staggerDelay) for lists
  // that load asynchronously, where a parent RevealGroup can't orchestrate the children.
  delay?: number;
  y?: number;
}

// Fades and lifts an element into place the first time it scrolls into view.
export function Reveal({ children, className, id, as = "div", delay = 0, y = 16 }: RevealProps) {
  const Comp = TAGS[as];
  return (
    <Comp
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

// Parent that staggers its RevealItem children as the group scrolls into view.
export function RevealGroup({
  children,
  className,
  as = "div",
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  as?: Tag;
  stagger?: number;
}) {
  const Comp = TAGS[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: Tag;
}) {
  const Comp = TAGS[as];
  return (
    <Comp className={className} variants={ITEM_VARIANTS}>
      {children}
    </Comp>
  );
}

// Caps the delay so the 12th card in a list doesn't wait over a second to appear.
export function staggerDelay(index: number, step = 0.06, max = 0.3) {
  return Math.min(index * step, max);
}
