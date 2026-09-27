/**
 * A tiny markup for short texts kept in frontmatter and config (summaries, decisions,
 * experience highlights), so key words can stand out without writing HTML:
 *
 *   ==key phrase==        → <mark>: the sand highlight band
 *   **609 tests**         → <strong class="metric">: a number or result, in orange
 *   [[RAG]]               → a glossary term that opens its definition
 *   [[shown words|id]]    → the same, with different words on the page
 *
 * The text is escaped first, so nothing else in it can become HTML.
 */
import { findTerm } from '@/config/glossary';

const escape = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function rich(text: string): string {
  return escape(text)
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="metric">$1</strong>')
    .replace(/\[\[(.+?)\]\]/g, (_match, inner: string) => {
      const [shown = '', key] = inner.split('|');
      const entry = findTerm(key ?? shown);
      return entry
        ? `<button type="button" class="term" popovertarget="term-${entry.id}">${shown}</button>`
        : shown;
    });
}

/** The same text without the markup: meta descriptions, aria labels, social previews. */
export function plain(text: string): string {
  return text
    .replace(/==(.+?)==/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[\[(.+?)\]\]/g, (_match, inner: string) => inner.split('|')[0] ?? '');
}
