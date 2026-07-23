# blog

Simon Willison 스타일(단일 컬럼·텍스트 중심·클래식)의 개인 개발 블로그.
[Astro](https://astro.build) + MDX 기반이며, 글 본문 중간에 React 아일랜드(캔버스 애니메이션 등 인터랙티브 데모)를 심을 수 있다. 마크다운은 GFM 전부 지원.

## 로컬 실행

```bash
pnpm install
pnpm dev        # http://localhost:4321
```

> 검색(Pagefind)은 인덱스가 빌드 후에 생성되므로 `dev`에서는 동작하지 않는다.
> 검색까지 확인하려면 `pnpm build && pnpm preview`.

```bash
pnpm build      # astro build && pagefind --site dist  → dist/
pnpm preview    # 빌드 결과 미리보기 (검색 포함)
```

## 글 쓰기

- 파일 위치: `src/posts/<연도>/YYYY-MM-DD-<slug>.mdx` (또는 `.md`).
  **파일명이 곧 날짜·URL**이다 (`/posts/<slug>/`). frontmatter에 날짜를 따로 쓰지 않는다.
- frontmatter:
  ```yaml
  ---
  title: 글 제목
  description: 목록/OG/RSS에 쓰일 한 줄 요약 (선택)
  tags: [tag1, tag2]           # 선택
  draft: true                  # 선택. dev에선 보이고 배포 빌드에선 숨김
  hide: true                   # 선택. 항상 숨김
  ---
  ```
- 본문은 GFM 마크다운(표·체크리스트·각주·인용·코드 등) + 인라인 HTML.
- 제목(h2/h3 등)에는 `#` 앵커가 자동으로 붙는다(클릭 시 해당 섹션으로 이동).

### 인터랙티브 데모 넣기

글 전용 컴포넌트는 `src/materials/<slug>/`에 두고, MDX에서 import해 본문 중간에 배치한다.

```mdx
import { CanvasDemo } from '@materials/hello-canvas';

...본문...

<CanvasDemo client:visible />
```

- `client:visible`(또는 `client:load`)를 붙여야 브라우저에서 하이드레이션된다.
- 이미지는 `<Image src="/images/foo.svg" caption="설명" expandable />` (캡션·지연로딩·확대) 또는 표준 마크다운 `![alt](/images/foo.png)`.

## 배포 (GitHub Pages)

1. GitHub에 `<username>.github.io` 저장소를 만들고 이 코드를 `main`에 push.
2. 저장소 **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. 이후 `main` push마다 `.github/workflows/deploy.yml`이 빌드 후 Pages로 배포한다.

## 정체성 설정

사이트 이름·소셜 링크 등은 `src/config.ts` 한 곳에서 관리한다.
`src/config.ts`의 `url`과 `astro.config.mjs`의 `SITE_URL`, `public/robots.txt`의 Sitemap URL을
본인 값(`https://<username>.github.io`)으로 맞춘다.
