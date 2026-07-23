import { useEffect, useRef, useState } from 'react';

type EaseName = 'linear' | 'easeInOutCubic' | 'easeOutBounce' | 'easeInOutBack';

const easings: Record<EaseName, (t: number) => number> = {
  linear: (t) => t,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutBounce: (t) => {
    const n1 = 7.5625,
      d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeInOutBack: (t) => {
    const c2 = 1.70158 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
};

/**
 * A small requestAnimationFrame canvas demo: draws an easing curve and animates
 * a dot along it. Interactive — switch the easing function or replay. This is the
 * "React island embedded mid-article" pattern; drop <CanvasDemo client:visible /> into MDX.
 */
export default function CanvasDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ease, setEase] = useState<EaseName>('easeInOutCubic');
  const [nonce, setNonce] = useState(0); // bump to replay

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) => (css.getPropertyValue(name) || fallback).trim();

    let raf = 0;
    let start: number | null = null;
    const dur = 1600;
    const pad = 26;
    let box = { x: 0, y: 0, w: 0, h: 0 };

    function setup() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      box = { x: pad + 4, y: pad, w: W - pad * 2 - 8, h: H - pad * 2 };
    }

    function draw(t: number) {
      const fn = easings[ease];
      const rule = token('--rule', '#e6e8eb');
      const link = token('--link', '#0066cc');
      const muted = token('--muted', '#667085');
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(box.x, box.y);
      ctx.lineTo(box.x, box.y + box.h);
      ctx.lineTo(box.x + box.w, box.y + box.h);
      ctx.stroke();

      ctx.strokeStyle = link;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const p = i / 60;
        const px = box.x + p * box.w;
        const py = box.y + box.h - fn(p) * box.h;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      const et = fn(t);
      const cx = box.x + t * box.w;
      const cy = box.y + box.h - et * box.h;
      ctx.strokeStyle = link;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let j = 0; j <= 60; j++) {
        const pp = (j / 60) * t;
        const qx = box.x + pp * box.w;
        const qy = box.y + box.h - fn(pp) * box.h;
        j === 0 ? ctx.moveTo(qx, qy) : ctx.lineTo(qx, qy);
      }
      ctx.stroke();

      ctx.strokeStyle = muted;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, box.y + box.h);
      ctx.lineTo(cx, cy);
      ctx.moveTo(box.x, cy);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      ctx.fillStyle = link;
      ctx.beginPath();
      ctx.arc(box.x, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame(now: number) {
      if (start === null) start = now;
      let t = (now - start) / dur;
      if (t >= 1) t = 1;
      draw(t);
      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = window.setTimeout(() => {
          start = null;
          raf = requestAnimationFrame(frame);
        }, 650) as unknown as number;
      }
    }

    setup();
    const onResize = () => {
      setup();
      draw(1);
    };
    window.addEventListener('resize', onResize);

    if (reduce) {
      draw(1);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [ease, nonce]);

  return (
    <div className="canvas-demo">
      <div style={{ padding: '14px 14px 4px' }}>
        <canvas ref={canvasRef} aria-label="easing 곡선 애니메이션 데모" style={{ width: '100%', height: 220, display: 'block' }} />
      </div>
      <div className="canvas-demo-controls">
        <span className="canvas-demo-badge">Interactive</span>
        <label htmlFor="ease-select">easing</label>
        <select id="ease-select" value={ease} onChange={(e) => setEase(e.target.value as EaseName)}>
          <option value="linear">linear</option>
          <option value="easeInOutCubic">easeInOutCubic</option>
          <option value="easeOutBounce">easeOutBounce</option>
          <option value="easeInOutBack">easeInOutBack</option>
        </select>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => setNonce((n) => n + 1)}>
          ▷ 다시 재생
        </button>
      </div>
      <style>{`
        .canvas-demo { border: 1px solid var(--code-border); border-radius: 10px; overflow: hidden; background: var(--code-bg); margin: 0 0 20px; }
        .canvas-demo-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 14px 14px; }
        .canvas-demo-controls label { color: var(--muted); font-size: 0.8rem; }
        .canvas-demo select, .canvas-demo button { font: inherit; font-size: 0.82rem; color: var(--text); background: var(--bg); border: 1px solid var(--tag-border); border-radius: 6px; padding: 4px 10px; cursor: pointer; }
        .canvas-demo select:hover, .canvas-demo button:hover { border-color: var(--link); }
        .canvas-demo-badge { font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--link); border: 1px solid var(--link); border-radius: 4px; padding: 1px 6px; opacity: 0.85; }
      `}</style>
    </div>
  );
}
