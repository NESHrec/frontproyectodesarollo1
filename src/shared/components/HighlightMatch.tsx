import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type HighlightMatchProps = {
  text: string;
  query: string;
  className?: string;
};

function fold(text: string) {
  let folded = "";
  const origin: number[] = [];
  let index = 0;
  for (const character of text) {
    const plain = character.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
    for (let unit = 0; unit < plain.length; unit += 1) origin.push(index);
    folded += plain;
    index += character.length;
  }
  origin.push(text.length);
  return { folded, origin };
}

function escapeRegex(term: string) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Accent-insensitive text highlighting; it does not alter filtering or returned data. */
export function HighlightMatch({ text, query, className }: HighlightMatchProps) {
  const terms = query.split(/\s+/).map((term) => fold(term.trim()).folded).filter(Boolean);
  if (terms.length === 0 || !text) return <span className={className}>{text}</span>;

  const pattern = new RegExp([...new Set(terms)].sort((a, b) => b.length - a.length).map(escapeRegex).join("|"), "gu");
  const { folded, origin } = fold(text);
  const ranges: Array<[number, number]> = [];
  for (const match of folded.matchAll(pattern)) {
    const start = origin[match.index];
    const end = origin[match.index + match[0].length] ?? text.length;
    const previous = ranges[ranges.length - 1];
    if (previous && start <= previous[1]) previous[1] = Math.max(previous[1], end);
    else if (end > start) ranges.push([start, end]);
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(<mark className="rounded-sm bg-[#F8EDD2] px-0.5 text-[#334B54]" key={start}>{text.slice(start, end)}</mark>);
    cursor = end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <span className={cn(className)}>{parts}</span>;
}
