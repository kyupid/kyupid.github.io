// Single source of truth for site identity.
// (Keep `url` in sync with SITE_URL in astro.config.mjs and the Sitemap line in public/robots.txt.)
export const SITE = {
  url: 'https://kyupid.github.io',
  title: '가장 낮은 자세',
  tagline: 'devlog',
  author: 'Yeonwoo',
  description: '개발과 관련된 것들을 기록합니다.',
  social: {
    github: 'https://github.com/kyupid',
    linkedin: 'https://www.linkedin.com/in/kywkyu/',
  },
} as const;
