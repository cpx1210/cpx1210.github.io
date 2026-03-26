import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';
import { CATEGORY_META } from '../consts';
import { sortByDateDesc, stripMarkdown, toSlug } from './utils';

export type CollectionKey = 'notes' | 'contests';
export type NoteEntry = CollectionEntry<'notes'>;
export type ContestEntry = CollectionEntry<'contests'>;
export type AnyEntry = NoteEntry | ContestEntry;

export interface PostSummary {
  id: string;
  section: CollectionKey;
  url: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
  category: string;
  difficulty?: string;
  featured: boolean;
  contentText: string;
  entry: AnyEntry;
}

export interface TaxonomyBucket {
  label: string;
  slug: string;
  count: number;
}

export interface ArchiveGroup {
  year: string;
  posts: PostSummary[];
}

export interface ContestGroup {
  key: string;
  contestName: string;
  contestDate: Date;
  teamName?: string;
  rank?: string;
  items: PostSummary[];
}

export async function getPublishedEntries(collection: 'notes'): Promise<NoteEntry[]>;
export async function getPublishedEntries(collection: 'contests'): Promise<ContestEntry[]>;
export async function getPublishedEntries(collection: CollectionKey) {
  const entries = await getCollection(collection);
  return sortByDateDesc(entries.filter((entry) => !entry.data.draft)) as NoteEntry[] | ContestEntry[];
}

export function getEntryUrl(collection: CollectionKey, id: string) {
  return `/${collection}/${id}/`;
}

export function toPostSummary(entry: AnyEntry, section: CollectionKey): PostSummary {
  return {
    id: entry.id,
    section,
    url: getEntryUrl(section, entry.id),
    title: entry.data.title,
    description: entry.data.description,
    pubDate: entry.data.pubDate,
    updatedDate: entry.data.updatedDate,
    tags: entry.data.tags,
    category: entry.data.category,
    difficulty: entry.data.difficulty,
    featured: entry.data.featured ?? false,
    contentText: stripMarkdown(entry.body),
    entry,
  };
}

export async function getAllPublishedPosts() {
  const [notes, contests] = await Promise.all([
    getPublishedEntries('notes'),
    getPublishedEntries('contests'),
  ]);

  return [
    ...notes.map((entry) => toPostSummary(entry, 'notes')),
    ...contests.map((entry) => toPostSummary(entry, 'contests')),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

export async function getLatestPosts(limit = 6) {
  return (await getAllPublishedPosts()).slice(0, limit);
}

export async function getTaxonomyBuckets(key: 'tags' | 'category') {
  const posts = await getAllPublishedPosts();
  const counts = new Map<string, number>();

  for (const post of posts) {
    const values = key === 'tags' ? post.tags : [post.category];
    for (const value of values) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      slug: toSlug(label),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export async function getPostsByTag(tagSlug: string) {
  return (await getAllPublishedPosts()).filter((post) =>
    post.tags.some((tag) => toSlug(tag) === tagSlug),
  );
}

export async function getPostsByCategory(categorySlug: string) {
  return (await getAllPublishedPosts()).filter((post) => toSlug(post.category) === categorySlug);
}

export async function getArchiveGroups() {
  const posts = await getAllPublishedPosts();
  const groups = new Map<string, PostSummary[]>();

  for (const post of posts) {
    const year = String(post.pubDate.getFullYear());
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }

  return [...groups.entries()]
    .map(([year, items]) => ({ year, posts: items }))
    .sort((a, b) => Number(b.year) - Number(a.year));
}

export async function getContestGroups() {
  const contests = (await getPublishedEntries('contests')).map((entry) => toPostSummary(entry, 'contests'));
  const groups = new Map<string, ContestGroup>();

  for (const item of contests) {
    const contestEntry = item.entry as ContestEntry;
    const key = contestEntry.data.eventSlug ?? `${contestEntry.data.contestName}-${contestEntry.data.contestDate.toISOString()}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        contestName: contestEntry.data.contestName,
        contestDate: contestEntry.data.contestDate,
        teamName: contestEntry.data.teamName,
        rank: contestEntry.data.rank,
        items: [],
      });
    }

    groups.get(key)?.items.push(item);
  }

  return [...groups.values()].sort(
    (a, b) => b.contestDate.getTime() - a.contestDate.getTime(),
  );
}

export function getReadingTimeText(body: string) {
  return readingTime(body, { wordsPerMinute: 220 }).text;
}

export function getPrevNextPosts<T extends AnyEntry>(entries: T[], currentId: string) {
  const index = entries.findIndex((entry) => entry.id === currentId);

  return {
    newer: index > 0 ? entries[index - 1] : undefined,
    older: index >= 0 && index < entries.length - 1 ? entries[index + 1] : undefined,
  };
}

export async function getRelatedPosts(entry: AnyEntry, section: CollectionKey, limit = 3) {
  const candidates = (await getPublishedEntries(section))
    .filter((candidate) => candidate.id !== entry.id)
    .map((candidate) => {
      const sharedTags = candidate.data.tags.filter((tag) => entry.data.tags.includes(tag)).length;
      const sameCategory = candidate.data.category === entry.data.category ? 1 : 0;
      const score = sharedTags * 4 + sameCategory * 2;

      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.data.pubDate.getTime() - a.candidate.data.pubDate.getTime())
    .slice(0, limit)
    .map(({ candidate }) => toPostSummary(candidate, section));

  return candidates;
}

export function getCategoryLabel(category: string) {
  return CATEGORY_META[category as keyof typeof CATEGORY_META]?.label ?? category;
}
