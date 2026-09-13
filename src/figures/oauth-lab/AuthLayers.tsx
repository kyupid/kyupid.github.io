import { Figure } from "./shared";

/** 인증, 위임된 인가, 방어의 세 층 관계. */
export default function AuthLayers() {
  const rows = [
    {
      y: 20,
      title: "인증: 누구인가",
      body: "OIDC · id_token (aud = 앱, nonce, auth_time)",
      fill: "var(--accent-soft)",
    },
    {
      y: 92,
      title: "위임된 인가: 무엇을 할 수 있나",
      body: "OAuth 2.0 / 2.1 · access token (aud = 리소스서버, scope)",
      fill: "var(--code-bg)",
    },
    {
      y: 164,
      title: "방어 계층",
      body: "state · PKCE · redirect_uri 완전일치 · code 1회용 · JWT 검증(alg/aud) · refresh 회전",
      fill: "var(--code-bg)",
    },
  ];
  return (
    <Figure
      viewBox="0 0 720 245"
      maxWidth={680}
      caption="위 두 층이 무엇을 증명하는지, 아래 층이 그것을 어떻게 지키는지."
    >
      {rows.map((r) => (
        <g key={r.y}>
          <rect
            x={20}
            y={r.y}
            width={680}
            height={60}
            rx="8"
            fill={r.fill}
            stroke="var(--rule)"
          />
          <text
            x={40}
            y={r.y + 25}
            fontSize="14"
            fontWeight="700"
            fill="var(--text)"
          >
            {r.title}
          </text>
          <text x={40} y={r.y + 45} fontSize="12" fill="var(--muted)">
            {r.body}
          </text>
        </g>
      ))}
    </Figure>
  );
}
