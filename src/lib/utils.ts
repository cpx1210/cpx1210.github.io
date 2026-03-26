export function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function absoluteUrl(pathname: string) {
  return new URL(pathname, 'https://cpx1210.github.io').toString();
}

export function stripMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/[#>*_~\-]/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]+\$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sortByDateDesc<T extends { data: { pubDate: Date } }>(entries: T[]) {
  return [...entries].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
