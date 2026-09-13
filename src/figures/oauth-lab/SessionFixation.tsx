import { Figure, ArrowDefs, COLORS } from "./shared";

/**
 * 로그인 CSRF(세션 고정). 공격자가 자기 code를 피해자에게 흘려,
 * 피해자의 앱 세션을 공격자 계정에 묶는다. state가 이 연결을 끊는다.
 */
export default function SessionFixation() {
  return (
    <Figure
      viewBox="0 0 720 270"
      maxWidth={700}
      caption="공격자는 아무것도 훔치지 않습니다. 자기 계정을 열어두고 피해자를 그리로 밀어 넣을 뿐입니다."
    >
      <ArrowDefs id="sf" />

      <text x={20} y={18} fontSize="12" fill={COLORS.evil} fontWeight="700">
        방어 없음: 공격 성공
      </text>

      {/* 1 */}
      <rect
        x={20}
        y={30}
        width={200}
        height={58}
        rx="8"
        fill="var(--code-bg)"
        stroke="var(--rule)"
      />
      <text x={34} y={52} fontSize="12" fontWeight="700" fill="var(--text)">
        ① 공격자(bob) 정상 로그인
      </text>
      <text x={34} y={72} fontSize="11.5" fill="var(--muted)">
        code만 받고 멈춘다
      </text>

      <line
        x1={222}
        y1={59}
        x2={268}
        y2={59}
        stroke="var(--muted)"
        strokeWidth="1.5"
        markerEnd="url(#sf)"
      />

      {/* 2 */}
      <rect
        x={272}
        y={30}
        width={200}
        height={58}
        rx="8"
        fill="var(--code-bg)"
        stroke={COLORS.evil}
      />
      <text x={286} y={52} fontSize="12" fontWeight="700" fill="var(--text)">
        ② 그 code를 링크에 심어
      </text>
      <text x={286} y={72} fontSize="11.5" fill="var(--muted)">
        피해자에게 보낸다
      </text>

      <line
        x1={474}
        y1={59}
        x2={520}
        y2={59}
        stroke="var(--muted)"
        strokeWidth="1.5"
        markerEnd="url(#sf)"
      />

      {/* 3 */}
      <rect
        x={524}
        y={30}
        width={176}
        height={58}
        rx="8"
        fill="var(--code-bg)"
        stroke="var(--rule)"
      />
      <text x={538} y={52} fontSize="12" fontWeight="700" fill="var(--text)">
        ③ 피해자가 클릭
      </text>
      <text
        x={538}
        y={72}
        fontSize="11.5"
        fontFamily="var(--font-mono)"
        fill="var(--muted)"
      >
        /callback?code=…
      </text>

      {/* 결과 */}
      <path
        d="M612 92 L612 116"
        stroke="var(--muted)"
        strokeWidth="1.5"
        markerEnd="url(#sf)"
      />
      <rect
        x={380}
        y={120}
        width={320}
        height={56}
        rx="8"
        fill="var(--accent-soft)"
        stroke={COLORS.evil}
      />
      <text
        x={540}
        y={143}
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="700"
        fill="var(--text)"
      >
        피해자 세션이 bob 계정에 묶인다
      </text>
      <text
        x={540}
        y={163}
        textAnchor="middle"
        fontSize="11.5"
        fill="var(--muted)"
      >
        화면은 "로그인 완료", 이후 입력은 전부 bob 것
      </text>

      {/* 방어 */}
      <line x1={20} y1={200} x2={700} y2={200} stroke="var(--rule)" />
      <text x={20} y={226} fontSize="12" fontWeight="700" fill={COLORS.app}>
        state를 켜면
      </text>
      <text x={20} y={248} fontSize="12" fill="var(--muted)">
        앱이 /login 에서 심어둔 쿠키와 콜백의 state가 다르다 → 400. 공격자는
        피해자 브라우저의 쿠키 값을 모른다.
      </text>
    </Figure>
  );
}
