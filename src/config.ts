// Single source of truth for site identity.
// Replace the placeholders below (also update SITE_URL in astro.config.mjs to match `url`).
export const SITE = {
  url: 'https://USERNAME.github.io',
  title: '연우의 블로그',
  tagline: 'devlog',
  author: 'YOUR NAME',
  description: '개발과 관련된 것들을 기록합니다.',
  social: {
    github: 'https://github.com/USERNAME',
    linkedin: 'https://www.linkedin.com/in/USERNAME',
  },
} as const;
