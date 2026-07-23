import { useEffect, useRef, useState } from 'react';

/**
 * "생성량 vs 이해량 격차" — AI 생성량은 빠르게 오르고 인간 이해량은
 * 한계(인지 예산)에 수렴해, 그 사이 격차(확인 못 한 결과)가 벌어진다.
 * 슬라이더로 자동화 수준을 올리면 격차가 더 커진다.
 */
export default function GenerationGap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLElement>(null);
  const [level, setLevel] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = getComputedStyle(document.documentElement);
    const tok = (n: string, f: string) => (css.getPropertyValue(n) || f).trim();

    let raf = 0;
    let start: number | null = null;
    const dur = 3200;
    const pad = { l: 16, r: 16, t: 18, b: 24 };
    let box = { x: 0, y: 0, w: 0, h: 0 };

    // 생성: 자동화 수준이 높을수록 기울기가 커진다. 이해: 인지 예산 한계로 수렴.
    const gen = (t: number) => (0.22 + level * 0.16) * t;
    const comp = (t: number) => 0.4 * (1 - Math.exp(-2.6 * t));
    const yMax = 1.05;

    function setup() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      box = { x: pad.l + 2, y: pad.t, w: W - pad.l - pad.r - 4, h: H - pad.t - pad.b };
    }
    const X = (t: number) => box.x + t * box.w;
    const Y = (v: number) => box.y + box.h - (Math.min(v, yMax) / yMax) * box.h;

    function line(fn: (t: number) => number, tp: number) {
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const t = (i / 64) * tp;
        const x = X(t);
        const y = Y(fn(t));
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function draw(tp: number) {
      const link = tok('--link', '#0066cc');
      const muted = tok('--muted', '#667085');
      const rule = tok('--rule', '#e6e8eb');
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      ctx.clearRect(0, 0, W, H);

      // baseline + time axis label
      ctx.strokeStyle = rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + box.h);
      ctx.lineTo(box.x + box.w, box.y + box.h);
      ctx.stroke();
      ctx.fillStyle = muted;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('시간 →', box.x + box.w, box.y + box.h + 16);

      // gap fill between the two curves up to the playhead
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const t = (i / 64) * tp;
        ctx.lineTo(X(t), Y(gen(t)));
      }
      for (let i = 64; i >= 0; i--) {
        const t = (i / 64) * tp;
        ctx.lineTo(X(t), Y(comp(t)));
      }
      ctx.closePath();
      ctx.fillStyle = link;
      ctx.globalAlpha = 0.12;
      ctx.fill();
      ctx.globalAlpha = 1;

      // comprehension (human) — muted, saturating
      ctx.strokeStyle = muted;
      ctx.lineWidth = 2;
      line(comp, tp);
      // generation (AI) — accent, climbing
      ctx.strokeStyle = link;
      ctx.lineWidth = 2.5;
      line(gen, tp);

      // endpoint dots
      ctx.fillStyle = link;
      ctx.beginPath();
      ctx.arc(X(tp), Y(gen(tp)), 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = muted;
      ctx.beginPath();
      ctx.arc(X(tp), Y(comp(tp)), 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 인지적 부담: 두 곡선 끝점 사이의 수직 거리를 양방향 화살표 + 라벨로 표시
      const text = tok('--text', '#212b36');
      const bg = tok('--bg', '#ffffff');
      const yg = Y(gen(tp));
      const yc = Y(comp(tp));
      const px = X(tp);
      if (yc - yg > 22) {
        const ah = 4;
        ctx.strokeStyle = text;
        ctx.fillStyle = text;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, yg + ah);
        ctx.lineTo(px, yc - ah);
        ctx.stroke();
        ctx.beginPath(); // top arrowhead (points up to 생성)
        ctx.moveTo(px, yg);
        ctx.lineTo(px - ah, yg + ah + 2);
        ctx.lineTo(px + ah, yg + ah + 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath(); // bottom arrowhead (points down to 이해)
        ctx.moveTo(px, yc);
        ctx.lineTo(px - ah, yc - ah - 2);
        ctx.lineTo(px + ah, yc - ah - 2);
        ctx.closePath();
        ctx.fill();

        const label = '인지적 부담';
        ctx.font = "600 12px 'Pretendard', sans-serif";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const midY = (yg + yc) / 2;
        const tw = ctx.measureText(label).width;
        const lx = px - 9;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = bg;
        ctx.fillRect(lx - tw - 5, midY - 9, tw + 7, 18);
        ctx.globalAlpha = 1;
        ctx.fillStyle = text;
        ctx.fillText(label, lx, midY);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      }

      if (readoutRef.current) {
        readoutRef.current.textContent = Math.round(Math.max(0, gen(tp) - comp(tp)) * 100) + '%';
      }
    }

    function frame(now: number) {
      if (start === null) start = now;
      let tp = (now - start) / dur;
      if (tp >= 1) tp = 1;
      draw(tp);
      if (tp < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = window.setTimeout(() => {
          start = null;
          raf = requestAnimationFrame(frame);
        }, 900) as unknown as number;
      }
    }

    setup();
    const onResize = () => {
      setup();
      draw(1);
    };
    window.addEventListener('resize', onResize);
    if (reduce) draw(1);
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [level]);

  return (
    <div className="gengap">
      <div className="gengap-canvas">
        <canvas ref={canvasRef} aria-label="생성량과 이해량의 격차 애니메이션" style={{ width: '100%', height: 240, display: 'block' }} />
      </div>
      <div className="gengap-controls">
        <span className="gengap-lg gen">생성(AI)</span>
        <span className="gengap-lg comp">이해(인간)</span>
        <span className="gengap-gap">
          인지적 부담 <b ref={readoutRef}>0%</b>
        </span>
        <span className="gengap-spacer" />
        <label htmlFor="gengap-level">자동화 수준</label>
        <input
          id="gengap-level"
          type="range"
          min={1}
          max={5}
          step={1}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        />
        <span className="gengap-lvl">{level}</span>
      </div>
      <style>{`
        .gengap { border: 1px solid var(--code-border); border-radius: 10px; overflow: hidden; background: var(--code-bg); margin: 0 0 20px; }
        .gengap-canvas { padding: 12px 12px 2px; }
        .gengap-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 14px 14px; font-size: 0.8rem; color: var(--muted); }
        .gengap-lg { display: inline-flex; align-items: center; gap: 6px; }
        .gengap-lg::before { content: ''; width: 12px; height: 3px; border-radius: 2px; display: inline-block; }
        .gengap-lg.gen::before { background: var(--link); }
        .gengap-lg.comp::before { background: var(--muted); }
        .gengap-gap b { color: var(--link); font-variant-numeric: tabular-nums; }
        .gengap-spacer { flex: 1; }
        .gengap-controls label { color: var(--muted); }
        .gengap-controls input[type='range'] { accent-color: var(--link); cursor: pointer; }
        .gengap-lvl { font-variant-numeric: tabular-nums; min-width: 0.8em; }
        @media (max-width: 640px) { .gengap-spacer { flex-basis: 100%; height: 0; } }
      `}</style>
    </div>
  );
}
