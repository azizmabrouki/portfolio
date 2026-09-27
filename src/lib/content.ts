/**
 * Helpers shared by the pages that list and show case studies and notes.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

/** Case studies in sheet order: 01, 02, 03… */
export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => a.data.sheet.localeCompare(b.data.sheet));
}

/** Notes, newest first. */
export async function getNotes(): Promise<CollectionEntry<'notes'>[]> {
  const notes = await getCollection('notes');
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** About 220 words a minute, never less than one. */
export function readingMinutes(markdown: string | undefined): number {
  const words = (markdown ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
