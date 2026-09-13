import { Figure, ArrowDefs, COLORS } from "./shared";

/**
 * refresh token 회전과 재사용 감지 — 정상 흐름은 한 줄로만 뻗고,
 * 이미 쓴 마디가 다시 나타나면(분기) 그 계열 전체를 폐기한다.
 */
export default function RefreshChain() {
  const node = (x: number, y: number, label: string, dim = false) => (
    <g key={`${x}-${y}-${label}`}>
      <rect
        x={x}
        y={y}
        width={70}
        height={34}
        rx="6"
        fill={dim ? "var(--bg)" : "var(--code-bg)"}
        stroke={dim ? "var(--rule)" : "var(--rule)"}
        strokeDasharray={dim ? "4 3" : undefined}
      />
      <text
        x={x + 35}
        y={y + 22}
        textAnchor="middle"
        fontSize="12.5"
        fontFamily="var(--font-mono)"
        fill={dim ? "var(--muted)" : "var(--text)"}
      >
        {label}
      </text>
    </g>
  );

  return (
    <Figure
      viewBox="0 0 720 250"
      maxWidth={700}
      caption="정상이면 체인은 갈라지지 않는다. 이미 소비된 마디가 다시 나타나면 복제됐다는 뜻이므로 계열 전체를 폐기한다."
    >
      <ArrowDefs id="rc" />

      {/* 정상 */}
      <text x={20} y={22} fontSize="12" fontWeight="700" fill={COLORS.app}>
        정상 — 한 줄로만 뻗는다
      </text>
      {node(20, 34, "RT1", true)}
      <line
        x1={92}
        y1={51}
        x2={126}
        y2={51}
        stroke="var(--muted)"
        strokeWidth="1.5"
        markerEnd="url(#rc)"
      />
      {node(130, 34, "RT2", true)}
      <line
        x1={202}
        y1={51}
        x2={236}
        y2={51}
        stroke="var(--muted)"
        strokeWidth="1.5"
        markerEnd="url(#rc)"
      />
      {node(240, 34, "RT3")}
      <text x={320} y={55} fontSize="11.5" fill="var(--muted)">
        점선 = 이미 쓴 마디(무효). 끝 하나만 유효하다.
      </text>

      <line x1={20} y1={92} x2={700} y2={92} stroke="var(--rule)" />

      {/* 탈취 */}
      <text x={20} y={118} fontSize="12" fontWeight="700" fill={COLORS.evil}>
        탈취 — 지나간 마디가 다시 나타난다
      </text>
      {node(20, 130, "RT1", true)}
      <line
        x1={92}
        y1={147}
        x2={126}
        y2={147}
        stroke="var(--muted)"
        strokeWidth="1.5"
        markerEnd="url(#rc)"
      />
      {node(130, 130, "RT2")}
      <text x={216} y={151} fontSize="11.5" fill="var(--muted)">
        ← 사용자
      </text>

      {/* 분기 */}
      <path
        d="M55 166 L55 196 L126 196"
        fill="none"
        stroke={COLORS.evil}
        strokeWidth="1.5"
        markerEnd="url(#rc)"
      />
      <text x={64} y={214} fontSize="11.5" fill={COLORS.evil}>
        공격자가 RT1 을 다시 사용 → 분기 발생
      </text>

      <rect
        x={340}
        y={126}
        width={360}
        height={92}
        rx="8"
        fill="var(--accent-soft)"
        stroke={COLORS.evil}
      />
      <text x={356} y={150} fontSize="12.5" fontWeight="700" fill="var(--text)">
        재사용 감지 → 계열(Family) 전체 폐기
      </text>
      <text x={356} y={172} fontSize="11.5" fill="var(--muted)">
        누가 진짜 주인인지 알 수 없으므로 둘 다 끊는다.
      </text>
      <text x={356} y={194} fontSize="11.5" fill="var(--muted)">
        멀쩡하던 RT2 도 함께 죽고, 다시 로그인해야 한다.
      </text>
    </Figure>
  );
}
