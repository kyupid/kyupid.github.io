import { Figure, ServerBox, ArrowDefs, COLORS } from "./shared";

/** 랩 구성: 네 개의 서버와 각자의 역할. */
export default function LabTopology() {
  return (
    <Figure
      viewBox="0 0 720 232"
      maxWidth={680}
      caption="로컬에 띄운 네 개의 서버. 사용자가 브라우저로 보는 것은 앱(:9002)과 인가서버(:9000)의 화면뿐이다."
    >
      <ArrowDefs id="topo" />

      <ServerBox
        x={40}
        y={30}
        port=":9002"
        name="앱 (클라이언트)"
        color={COLORS.app}
      />
      <ServerBox
        x={290}
        y={30}
        port=":9000"
        name="인가서버"
        color={COLORS.as}
      />
      <ServerBox
        x={540}
        y={30}
        port=":9001"
        name="리소스서버"
        color={COLORS.rs}
      />
      <ServerBox
        x={290}
        y={170}
        port=":9003"
        name="공격자 사이트"
        color={COLORS.evil}
      />

      {/* 앱 → 인가서버 */}
      <line
        x1={172}
        y1={49}
        x2={284}
        y2={49}
        stroke="var(--muted)"
        strokeWidth="1.5"
        markerEnd="url(#topo)"
      />
      <text
        x={228}
        y={41}
        textAnchor="middle"
        fontSize="11"
        fill="var(--muted)"
      >
        code → 토큰
      </text>

      {/* 앱 → 리소스서버 */}
      <path
        d="M106 84 L106 120 L606 120 L606 90"
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5"
        markerEnd="url(#topo)"
      />
      <text
        x={356}
        y={114}
        textAnchor="middle"
        fontSize="11"
        fill="var(--muted)"
      >
        Bearer 토큰으로 데이터 요청
      </text>

      {/* 공격자 → 앱/인가서버 */}
      <line
        x1={356}
        y1={166}
        x2={356}
        y2={90}
        stroke={COLORS.evil}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#topo)"
      />
      <text x={366} y={140} fontSize="11" fill={COLORS.evil}>
        공격 실습 대상
      </text>
    </Figure>
  );
}
