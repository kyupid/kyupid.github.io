import { Figure, ArrowDefs } from "./shared";

/**
 * PKCE — 앞으로는 해시(challenge)만 보내고, 원본(verifier)은 브라우저를 거치지 않는다.
 * 그래서 code를 훔쳐도 토큰으로 바꾸지 못한다.
 */
export default function PkceFlow() {
  return (
    <Figure
      viewBox="0 0 720 240"
      maxWidth={700}
      caption="challenge는 URL에 실려 다녀도 안전합니다. SHA-256은 되돌릴 수 없어 challenge로 verifier를 구할 수 없습니다."
    >
      <ArrowDefs id="pkce" />

      {/* verifier */}
      <rect
        x={20}
        y={26}
        width={190}
        height={54}
        rx="8"
        fill="var(--code-bg)"
        stroke="var(--rule)"
      />
      <text
        x={115}
        y={48}
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="var(--text)"
      >
        code_verifier
      </text>
      <text
        x={115}
        y={67}
        textAnchor="middle"
        fontSize="11"
        fill="var(--muted)"
      >
        앱만 안다 (쿠키에 보관)
      </text>

      {/* 해시 */}
      <line
        x1={212}
        y1={53}
        x2={288}
        y2={53}
        stroke="var(--muted)"
        strokeWidth="1.5"
        markerEnd="url(#pkce)"
      />
      <text
        x={250}
        y={44}
        textAnchor="middle"
        fontSize="11"
        fill="var(--muted)"
      >
        SHA-256
      </text>
      <text
        x={250}
        y={70}
        textAnchor="middle"
        fontSize="14"
        fill="var(--muted)"
      >
        ⛔
      </text>

      <rect
        x={292}
        y={26}
        width={190}
        height={54}
        rx="8"
        fill="var(--accent-soft)"
        stroke="var(--rule)"
      />
      <text
        x={387}
        y={48}
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="var(--text)"
      >
        code_challenge
      </text>
      <text
        x={387}
        y={67}
        textAnchor="middle"
        fontSize="11"
        fill="var(--muted)"
      >
        URL로 보낸다 (노출됨)
      </text>

      <text
        x={250}
        y={92}
        textAnchor="middle"
        fontSize="10.5"
        fill="var(--muted)"
      >
        되돌릴 수 없음
      </text>

      {/* front / back 채널 */}
      <rect
        x={20}
        y={120}
        width={462}
        height={44}
        rx="8"
        fill="none"
        stroke="#1f6feb"
        strokeDasharray="4 3"
      />
      <text x={34} y={147} fontSize="12" fill="#1f6feb">
        front channel — /authorize 로{" "}
        <tspan fontWeight="700">challenge 만</tspan> 간다. 공격자가 볼 수 있다.
      </text>

      <rect
        x={20}
        y={176}
        width={462}
        height={44}
        rx="8"
        fill="none"
        stroke="var(--text)"
      />
      <text x={34} y={203} fontSize="12" fill="var(--text)">
        back channel — /token에 <tspan fontWeight="700">verifier</tspan>.
        브라우저를 거치지 않는다.
      </text>

      {/* 결론 */}
      <rect
        x={502}
        y={120}
        width={198}
        height={100}
        rx="8"
        fill="var(--code-bg)"
        stroke="var(--rule)"
      />
      <text
        x={601}
        y={150}
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="700"
        fill="var(--text)"
      >
        code를 훔쳐도
      </text>
      <text
        x={601}
        y={172}
        textAnchor="middle"
        fontSize="12.5"
        fill="var(--muted)"
      >
        verifier가 없으면
      </text>
      <text
        x={601}
        y={196}
        textAnchor="middle"
        fontSize="12.5"
        fontFamily="var(--font-mono)"
        fill="var(--text)"
      >
        invalid_grant
      </text>
    </Figure>
  );
}
