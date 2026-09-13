import { Figure, COLORS } from "./shared";

/**
 * 로그인 한 번 = HTTP 홉 일곱 개. 그중 사용자가 실제로 보는 화면은 두 개뿐이고,
 * access token 이 등장하는 홉은 브라우저가 존재조차 모른다.
 */
const HOPS = [
  {
    n: "①",
    from: "앱",
    to: "브라우저",
    label: "302 → /authorize",
    kind: "auto",
  },
  {
    n: "②",
    from: "브라우저",
    to: "인가서버",
    label: "GET /authorize (동의 화면)",
    kind: "user",
  },
  {
    n: "③",
    from: "사용자",
    to: "인가서버",
    label: 'POST /approve ("허용" 클릭)',
    kind: "user",
  },
  {
    n: "④",
    from: "인가서버",
    to: "브라우저",
    label: "302 → /callback?code=…",
    kind: "auto",
  },
  {
    n: "⑤",
    from: "브라우저",
    to: "앱",
    label: "GET /callback?code=…",
    kind: "auto",
  },
  {
    n: "⑥",
    from: "앱 서버",
    to: "인가서버",
    label: "POST /token  → access token",
    kind: "back",
  },
  {
    n: "⑦",
    from: "브라우저",
    to: "앱",
    label: "GET / (결과 화면)",
    kind: "user",
  },
];

const STYLE: Record<string, { color: string; tag: string }> = {
  user: { color: COLORS.app, tag: "사용자가 본다" },
  auto: { color: "#1f6feb", tag: "자동으로 지나감" },
  back: { color: "var(--text)", tag: "브라우저 밖" },
};

export default function ChannelHops() {
  const rowH = 40;
  const top = 34;
  const h = top + HOPS.length * rowH + 24;
  return (
    <Figure
      viewBox={`0 0 720 ${h}`}
      maxWidth={700}
      caption="초록만 사용자가 실제로 보는 화면이다. ⑥에서 access token 이 처음 등장하는데, 브라우저는 그 요청의 존재조차 모른다."
    >
      <text x={20} y={18} fontSize="12" fill="var(--muted)">
        로그인 1회 = HTTP 홉 7개
      </text>

      {HOPS.map((hop, i) => {
        const y = top + i * rowH;
        const st = STYLE[hop.kind];
        return (
          <g key={hop.n}>
            {hop.kind === "back" && (
              <rect
                x={16}
                y={y - 4}
                width={688}
                height={rowH - 6}
                rx="6"
                fill="var(--code-bg)"
              />
            )}
            <text x={26} y={y + 18} fontSize="13" fill="var(--muted)">
              {hop.n}
            </text>
            <rect
              x={48}
              y={y + 3}
              width={4}
              height={20}
              rx="2"
              fill={st.color}
            />
            <text x={62} y={y + 18} fontSize="12.5" fill="var(--muted)">
              {hop.from} → {hop.to}
            </text>
            <text
              x={230}
              y={y + 18}
              fontSize="12.5"
              fontFamily="var(--font-mono)"
              fill="var(--text)"
              fontWeight={hop.kind === "back" ? 700 : 400}
            >
              {hop.label}
            </text>
            <text
              x={700}
              y={y + 18}
              textAnchor="end"
              fontSize="11"
              fill={st.color}
            >
              {st.tag}
            </text>
          </g>
        );
      })}
    </Figure>
  );
}
