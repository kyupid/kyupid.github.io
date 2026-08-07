// Single source of truth for site identity.
// (Keep `url` in sync with SITE_URL in astro.config.mjs and the Sitemap line in public/robots.txt.)
export const SITE = {
  url: 'https://kimyeonwoo.com',
  title: '김연우의 블로그',
  tagline: '가장 낮은 자세',
  author: '김연우',
  description: '개발과 관련된 것들을 기록합니다.',
  // Sidebar 소개. The one thing a first-time reader should take away.
  bio: 'AI를 실제 업무에 적용하며, 사람이 직접 신경 써야 하는 일을 어떻게 줄일 수 있는지 기록합니다. 실행은 위임하되 시스템의 상태와 위험을 빠르게 파악하는 방법에 관심이 있습니다.',
  // Sidebar Highlights, by filename slug. Titles are read from the posts
  // themselves, so renaming a post can't leave a stale label here.
  highlights: [
    'boundary-of-understanding',
    'rds-slow-query-cloudwatch-pipeline',
    'release-note-automation',
    'team-wiki-adoption',
  ],
  social: {
    linkedin: 'https://www.linkedin.com/in/kywkyu/',
  },
  // Fallback share card, used when a post has no image of its own.
  // Source of truth for the artwork is public/og-default.svg (re-render with
  // `rsvg-convert -w 1200 -h 630 public/og-default.svg -o public/og-default.png`).
  ogImage: '/og-default.png',
  // giscus (comments backed by GitHub Discussions). Threads are keyed by the
  // post's filename slug, not its numeric URL, so re-numbering a post never
  // orphans its comments. Set repo to '' to turn comments off.
  giscus: {
    repo: 'kyupid/kyupid.github.io',
    repoId: 'R_kgDOR0nw8w',
    category: 'Announcements',
    categoryId: 'DIC_kwDOR0nw884DCWbp',
  },
  // GoatCounter site code (<code>.goatcounter.com). Loaded in production builds
  // only; set to '' to turn analytics off entirely.
  goatcounter: 'kyupid',
} as const;
