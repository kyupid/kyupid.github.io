import type { ReactNode } from "react";

/**
 * oauth-lab 글에 쓰는 도해들의 공통 껍데기.
 * 색은 전부 CSS 토큰(--text, --muted, --rule …)을 쓰므로 다크모드가 자동으로 따라온다.
 */
export function Figure({
  children,
  caption,
  viewBox,
  maxWidth = 720,
}: {
  children: ReactNode;
  caption?: string;
  viewBox: string;
  maxWidth?: number;
}) {
  return (
    <figure style={{ margin: "2rem auto", maxWidth, width: "100%" }}>
      <svg
        viewBox={viewBox}
        role="img"
        style={{ width: "100%", height: "auto", overflow: "visible" }}
        fontFamily="var(--font-sans)"
      >
        {children}
      </svg>
      {caption && (
        <figcaption
          style={{
            marginTop: ".6rem",
            fontSize: ".85rem",
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** 서버 한 대를 나타내는 상자. 랩 화면의 배너 색과 맞춘다. */
export function ServerBox({
  x,
  y,
  w = 132,
  h = 54,
  port,
  name,
  color,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  port: string;
  name: string;
  color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={color} />
      <text
        x={x + w / 2}
        y={y + 22}
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="#fff"
      >
        {port}
      </text>
      <text
        x={x + w / 2}
        y={y + 41}
        textAnchor="middle"
        fontSize="12.5"
        fill="#fff"
        opacity="0.95"
      >
        {name}
      </text>
    </g>
  );
}

export const COLORS = {
  as: "#7c3aed", // 인가서버
  rs: "#0891b2", // 리소스서버
  app: "#0a7c2f", // 앱
  evil: "#c0202f", // 공격자
};

/** 화살표 머리 정의. 각 도해에서 한 번 선언해 쓴다. */
export function ArrowDefs({
  id = "ah",
  color = "var(--muted)",
}: {
  id?: string;
  color?: string;
}) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M0,0 L10,5 L0,10 z" fill={color} />
      </marker>
    </defs>
  );
}
