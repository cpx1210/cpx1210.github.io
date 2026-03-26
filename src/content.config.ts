import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const noteCategorySchema = z.enum([
  'web',
  'pwn',
  'crypto',
  'reverse',
  'misc',
  'forensics',
  'tools',
]);

const difficultySchema = z.enum(['easy', 'medium', 'hard', 'insane']).optional();

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: noteCategorySchema,
    draft: z.boolean().default(false),
    cover: z.string().optional(),
    series: z.string().optional(),
    difficulty: difficultySchema,
    featured: z.boolean().default(false),
  }),
});

const contests = defineCollection({
  loader: glob({ base: './src/content/contests', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.enum(['contest', 'writeup']),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
    series: z.string().optional(),
    difficulty: difficultySchema,
    contestName: z.string(),
    contestDate: z.coerce.date(),
    teamName: z.string().optional(),
    rank: z.string().optional(),
    challengeType: z.enum([
      'web',
      'pwn',
      'crypto',
      'reverse',
      'misc',
      'forensics',
      'osint',
      'blockchain',
    ]),
    eventSlug: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { notes, contests };
