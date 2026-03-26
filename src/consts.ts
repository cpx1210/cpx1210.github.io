export const SITE = {
  title: 'cpx1210 // CTF Notebook',
  description:
    'A dark, maintainable Astro blog for CTF writeups, learning notes, tooling records, and post-mortems.',
  url: 'https://cpx1210.github.io',
  author: 'cpx1210',
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog/', label: 'Blog' },
  { href: '/notes/', label: 'Notes' },
  { href: '/contests/', label: 'Contests' },
  { href: '/archive/', label: 'Archive' },
  { href: '/about/', label: 'About' },
  { href: '/search/', label: 'Search' },
];

export const NOTE_CATEGORY_META = {
  web: { label: 'Web', description: 'Web security notes, payloads, and attack surface analysis.' },
  pwn: { label: 'Pwn', description: 'Heap, stack, kernel, and exploitation notes.' },
  crypto: { label: 'Crypto', description: 'Cryptography notes, attacks, proofs, and implementation pitfalls.' },
  reverse: { label: 'Reverse', description: 'Reversing workflows, tooling, and binary analysis notes.' },
  misc: { label: 'Misc', description: 'Everything else that does not fit the usual tracks.' },
  forensics: { label: 'Forensics', description: 'Disk, memory, traffic, and artifact analysis notes.' },
  tools: { label: 'Tools', description: 'Practical records of the tooling used in daily CTF workflows.' },
} as const;

export const CATEGORY_META = {
  ...NOTE_CATEGORY_META,
  contest: { label: 'Contest', description: 'Full-event reviews, rankings, and team retrospective posts.' },
  writeup: { label: 'Writeup', description: 'Single challenge writeups and focused solution notes.' },
} as const;

export const CHALLENGE_TYPE_META = {
  web: 'Web',
  pwn: 'Pwn',
  crypto: 'Crypto',
  reverse: 'Reverse',
  misc: 'Misc',
  forensics: 'Forensics',
  osint: 'OSINT',
  blockchain: 'Blockchain',
} as const;
