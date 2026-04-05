"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);
  const [orbs, setOrbs] = useState<
    { x: number; y: number; size: number; delay: number; duration: number }[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    setOrbs(
      Array.from({ length: 6 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 200 + Math.random() * 300,
        delay: i * 0.8,
        duration: 8 + Math.random() * 6,
      })),
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    const bars = 48;

    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const barW = w / bars - 1.5;

      for (let i = 0; i < bars; i++) {
        const wave1 = Math.sin(t * 2.1 + i * 0.35) * 0.5 + 0.5;
        const wave2 = Math.sin(t * 1.3 + i * 0.6 + 1) * 0.3 + 0.3;
        const wave3 = Math.cos(t * 0.8 + i * 0.2) * 0.2 + 0.2;
        const amp = loading
          ? (wave1 * 0.7 + wave2 * 0.2 + wave3 * 0.1) * h * 0.85
          : (wave1 * 0.3 + wave2 * 0.1) * h * 0.25;

        const x = i * (barW + 1.5);
        const progress = i / bars;
        const r = Math.round(120 + progress * 80);
        const g = Math.round(40 + progress * 30);
        const b = Math.round(220 - progress * 60);
        const alpha = 0.55 + wave1 * 0.35;

        const grad = ctx.createLinearGradient(0, h - amp, 0, h);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.05)`);
        ctx.fillStyle = grad;

        const radius = barW / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, h);
        ctx.lineTo(x + radius, h - amp + radius);
        ctx.arc(x + radius, h - amp + radius, radius, Math.PI, 0, false);
        ctx.lineTo(x + barW, h);
        ctx.closePath();
        ctx.fill();
      }

      t += 0.018;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [loading]);

  const handlePlay = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .echo-root {
          min-height: 100vh;
          background: #050508;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: drift var(--dur) ease-in-out var(--delay) infinite alternate;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); opacity: 0.12; }
          50% { transform: translate(-18px, 22px) scale(1.08); opacity: 0.22; }
          100% { transform: translate(14px, -16px) scale(0.94); opacity: 0.15; }
        }

        .card {
          position: relative;
          width: 100%;
          max-width: 480px;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          padding: 2.5rem 2.5rem 2rem;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(120,60,255,0.08),
            0 32px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.07);
          animation: cardIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
          overflow: hidden;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .card-shimmer {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(160,100,255,0.6) 40%, rgba(80,180,255,0.6) 70%, transparent 100%);
          animation: shimmer 4s linear infinite;
          background-size: 200% 100%;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .logo-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 2.2rem;
          animation: fadeUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #7c3aff 0%, #3b82f6 50%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 8px 32px rgba(120, 60, 255, 0.4), 0 0 0 1px rgba(255,255,255,0.12) inset;
        }

        .logo-icon svg {
          width: 28px; height: 28px;
          filter: drop-shadow(0 2px 8px rgba(255,255,255,0.3));
        }

        .logo-badge {
          position: absolute;
          top: -4px; right: -4px;
          width: 14px; height: 14px;
          background: #22d3ee;
          border-radius: 50%;
          border: 2px solid #050508;
          animation: pulse-badge 2s ease-in-out infinite;
        }

        @keyframes pulse-badge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,211,238,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(34,211,238,0); }
        }

        .logo-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.7rem;
          letter-spacing: -0.03em;
          background: linear-gradient(90deg, #c084fc 0%, #818cf8 40%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-sub {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 300;
        }

        .visualizer {
          width: 100%;
          height: 72px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.8rem;
          background: rgba(0,0,0,0.25);
          animation: fadeUp 0.8s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .visualizer canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .input-wrap {
          position: relative;
          margin-bottom: 1rem;
          animation: fadeUp 0.8s 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.3);
          pointer-events: none;
          transition: color 0.3s;
        }

        .input-wrap:focus-within .input-icon {
          color: rgba(160,100,255,0.8);
        }

        .echo-input {
          width: 100%;
          padding: 0.95rem 1rem 0.95rem 2.8rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 300;
          outline: none;
          transition: all 0.3s ease;
          caret-color: #a78bfa;
        }

        .echo-input::placeholder { color: rgba(255,255,255,0.2); }

        .echo-input:focus {
          border-color: rgba(120,80,255,0.5);
          background: rgba(255,255,255,0.065);
          box-shadow: 0 0 0 3px rgba(120,80,255,0.12), 0 0 24px rgba(120,80,255,0.08);
        }

        .btn-play {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.3s ease;
          animation: fadeUp 0.8s 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
          background: linear-gradient(135deg, #7c3aff 0%, #5b6af8 50%, #1d9cd3 100%);
          color: #fff;
          box-shadow: 0 4px 24px rgba(120,60,255,0.35), 0 1px 0 rgba(255,255,255,0.15) inset;
        }

        .btn-play::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .btn-play::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }

        .btn-play:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 36px rgba(120,60,255,0.5), 0 1px 0 rgba(255,255,255,0.2) inset;
        }

        .btn-play:active:not(:disabled) {
          transform: translateY(0px) scale(0.99);
        }

        .btn-play:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          position: relative;
          z-index: 1;
        }

        .play-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .play-dots span {
          width: 4px; height: 4px;
          background: #fff;
          border-radius: 50%;
          animation: bounce 0.8s ease-in-out infinite;
        }
        .play-dots span:nth-child(2) { animation-delay: 0.15s; }
        .play-dots span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes bounce {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.2); }
        }

        .message-box {
          margin-top: 1.1rem;
          padding: 0.85rem 1rem;
          background: rgba(120,80,255,0.07);
          border: 1px solid rgba(120,80,255,0.18);
          border-radius: 12px;
          font-size: 0.85rem;
          color: rgba(200,180,255,0.85);
          text-align: center;
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          line-height: 1.5;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin: 1.5rem 0 1rem;
          animation: fadeUp 0.8s 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .divider-text {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .quick-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          animation: fadeUp 0.8s 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .tag {
          padding: 0.35rem 0.85rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 100px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .tag:hover {
          background: rgba(120,80,255,0.1);
          border-color: rgba(120,80,255,0.3);
          color: rgba(200,180,255,0.9);
        }

        .footer {
          margin-top: 1.8rem;
          text-align: center;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.03em;
          animation: fadeUp 0.8s 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .footer span {
          color: rgba(160,100,255,0.4);
        }
      `}</style>

      <div className="echo-root">
        {orbs.map((o, i) => (
          <div
            key={i}
            className="orb"
            style={
              {
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: o.size,
                height: o.size,
                background: [
                  "radial-gradient(circle, rgba(120,60,255,1) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(30,160,255,1) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(200,60,180,1) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(60,200,255,1) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(100,80,240,1) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(180,100,255,1) 0%, transparent 70%)",
                ][i % 6],
                ["--dur" as string]: `${o.duration}s`,
                ["--delay" as string]: `${o.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}

        <div
          style={{
            width: "100%",
            maxWidth: 480,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="card">
            <div className="card-shimmer" />

            <div className="logo-area">
              <div className="logo-icon">
                <svg
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 14C5 9.02944 9.02944 5 14 5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 5C18.9706 5 23 9.02944 23 14C23 18.9706 18.9706 23 14 23"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="14" r="3" fill="white" />
                  <path
                    d="M9 14C9 11.2386 11.2386 9 14 9"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 14C19 16.7614 16.7614 19 14 19"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="logo-badge" />
              </div>
              <div className="logo-title">EchoNode</div>
              <div className="logo-sub">Spatial Audio Streaming</div>
            </div>

            <div className="visualizer">
              <canvas ref={canvasRef} />
            </div>

            <div className="input-wrap">
              <div className="input-icon">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path
                    d="M7.5 1.5C7.5 1.5 3 4.5 3 8C3 10.2091 5.01472 12 7.5 12C9.98528 12 12 10.2091 12 8C12 4.5 7.5 1.5 7.5 1.5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 12V13.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <circle cx="7.5" cy="8" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <input
                className="echo-input"
                type="text"
                placeholder="Search a song, artist, or vibe…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handlePlay()}
              />
            </div>

            <button
              className="btn-play"
              onClick={handlePlay}
              disabled={loading}
            >
              <div className="btn-inner">
                {loading ? (
                  <>
                    <div className="play-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    Streaming…
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="white"
                    >
                      <path d="M4 2.5L13 8L4 13.5V2.5Z" />
                    </svg>
                    Play Now
                  </>
                )}
              </div>
            </button>

            {message && <div className="message-box">{message}</div>}

            <div className="divider">
              <div className="divider-line" />
              <div className="divider-text">Popular</div>
              <div className="divider-line" />
            </div>

            <div className="quick-tags">
              {[
                "Lo-fi chill",
                "Jazz nights",
                "Epic scores",
                "Indie dream",
                "Deep focus",
              ].map((tag) => (
                <button key={tag} className="tag" onClick={() => setTitle(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="footer">
            Stream your universe, effortlessly &nbsp;·&nbsp;{" "}
            <span>©{new Date().getFullYear()} EchoNode</span>
          </div>
        </div>
      </div>
    </>
  );
}


// written by Claude code Apr 5 2026