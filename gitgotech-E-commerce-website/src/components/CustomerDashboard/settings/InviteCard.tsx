"use client";
import { useEffect, useState } from "react";

function useScript(src: string) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) {
      setReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, [src]);
  return ready;
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Cormorant Garamond',serif}
  .app{
    min-height:100vh;
    background:#0a0e1a;
    background-image:radial-gradient(ellipse at 20% 50%,rgba(10,30,80,.8) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(20,10,60,.6) 0%,transparent 50%);
    display:flex;flex-direction:row;align-items:center;justify-content:center;
    padding:32px 24px;gap:40px;flex-wrap:wrap;
  }
  .fp{
    flex:0 0 380px;background:rgba(255,255,255,.04);
    border:1px solid rgba(197,168,90,.25);border-radius:16px;
    padding:28px 24px;backdrop-filter:blur(10px);
  }
  .ft{font-family:'Cinzel',serif;color:#c5a85a;font-size:14px;letter-spacing:4px;text-align:center;margin-bottom:22px;text-transform:uppercase}
  .field{margin-bottom:14px}
  .field label{display:block;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;color:rgba(197,168,90,.7);text-transform:uppercase;margin-bottom:6px}
  .field input{
    width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(197,168,90,.2);
    border-radius:8px;padding:9px 12px;color:#e8dfc0;
    font-family:'Cormorant Garamond',serif;font-size:14px;outline:none;
    transition:border-color .2s,background .2s;
  }
  .field input:focus{border-color:rgba(197,168,90,.6);background:rgba(255,255,255,.08)}
  .field input::placeholder{color:rgba(200,180,130,.3)}
  .frow{display:flex;gap:12px}.frow .field{flex:1}
  .btn{
    margin-top:18px;width:100%;padding:12px;
    background:linear-gradient(135deg,#8b6914 0%,#c5a85a 45%,#e8c96e 55%,#c5a85a 70%,#7a5c10 100%);
    border:none;border-radius:8px;font-family:'Cinzel',serif;font-size:11px;
    letter-spacing:3px;text-transform:uppercase;color:#0a0e1a;font-weight:700;
    cursor:pointer;transition:opacity .2s,transform .1s;
    display:flex;align-items:center;justify-content:center;gap:8px;
  }
  .btn:hover{opacity:.9;transform:translateY(-1px)}
  .btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
  .hint{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:rgba(197,168,90,.4);text-align:center;margin-top:8px}
  .spin{width:14px;height:14px;border:2px solid rgba(10,14,26,.3);border-top-color:#0a0e1a;border-radius:50%;animation:spin .6s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}

  /* preview card */
  .card{
    position:relative;width:440px;height:570px;
    background:#071228;
    background-image:
      radial-gradient(ellipse at 50% 30%,rgba(12,40,120,.7) 0%,transparent 55%),
      radial-gradient(ellipse at 50% 80%,rgba(8,20,70,.8) 0%,transparent 45%),
      radial-gradient(ellipse at 20% 20%,rgba(30,50,150,.3) 0%,transparent 40%),
      radial-gradient(ellipse at 80% 80%,rgba(20,30,100,.3) 0%,transparent 40%);
    border-radius:8px;overflow:hidden;
    box-shadow:0 0 0 1px rgba(197,168,90,.3),0 30px 80px rgba(0,0,0,.8);
  }
  .stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}
  .star{position:absolute;background:white;border-radius:50%;animation:twinkle var(--dur,3s) ease-in-out infinite;animation-delay:var(--delay,0s)}
  @keyframes twinkle{0%,100%{opacity:var(--min-op,.1);transform:scale(1)}50%{opacity:var(--max-op,.8);transform:scale(1.5)}}
  .glow-star{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(197,168,90,.6) 0%,transparent 70%);animation:gpulse 4s ease-in-out infinite;animation-delay:var(--delay,0s)}
  @keyframes gpulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.7;transform:scale(1.3)}}
  .bt,.bb{position:absolute;left:0;right:0;width:100%;pointer-events:none;z-index:5}
  .bt{top:0}.bb{bottom:0}
  .bs{position:absolute;top:0;bottom:0;height:100%;pointer-events:none;z-index:5;width:22px}
  .cc{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18% 10% 16%;text-align:center}
  .ch{font-family:'Great Vibes',cursive;font-size:72px;color:#c5a85a;line-height:.95;text-shadow:0 0 30px rgba(197,168,90,.5),0 2px 4px rgba(0,0,0,.5)}
  .od{display:flex;align-items:center;gap:10px;margin:10px 0;width:80%}
  .ol{flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(197,168,90,.6))}
  .olr{flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(197,168,90,.6))}
  .pj{font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;color:rgba(220,200,150,.9);text-transform:uppercase;margin-bottom:8px}
  .en{font-family:'Cinzel',serif;font-size:18px;font-weight:600;color:#e8dfc0;letter-spacing:1px;line-height:1.4;margin-bottom:14px}
  .dr{display:flex;align-items:center;gap:14px}
  .di{font-family:'Cinzel',serif;font-size:14px;font-weight:600;color:#d4b96a;letter-spacing:1px}
  .ds{width:1px;height:18px;background:rgba(197,168,90,.4)}
  .dl{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;color:rgba(220,200,160,.85);letter-spacing:1px;margin-top:8px}
  .ib{position:absolute;inset:5%;border:1px solid rgba(197,168,90,.12);border-radius:4px;pointer-events:none;z-index:4}
`;

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  dur: (Math.random() * 3 + 2).toFixed(1),
  delay: (Math.random() * 4).toFixed(1),
  minOp: (Math.random() * 0.1 + 0.05).toFixed(2),
  maxOp: (Math.random() * 0.5 + 0.3).toFixed(2),
}));
const GLOWS = [
  { x: 10, y: 15, s: 40, d: 0 },
  { x: 85, y: 12, s: 40, d: 1.5 },
  { x: 5, y: 70, s: 30, d: 0.8 },
  { x: 90, y: 65, s: 30, d: 2 },
];

function GoldGrad({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#6b4c0a" />
      <stop offset="30%" stopColor="#c5a85a" />
      <stop offset="50%" stopColor="#f0d080" />
      <stop offset="70%" stopColor="#c5a85a" />
      <stop offset="100%" stopColor="#6b4c0a" />
    </linearGradient>
  );
}
function GoldGradV({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#6b4c0a" />
      <stop offset="30%" stopColor="#c5a85a" />
      <stop offset="50%" stopColor="#f0d080" />
      <stop offset="70%" stopColor="#c5a85a" />
      <stop offset="100%" stopColor="#6b4c0a" />
    </linearGradient>
  );
}

function OrnateBar({
  gid,
  fid,
  flipped,
}: {
  gid: string;
  fid: string;
  flipped?: boolean;
}) {
  return (
    <>
      <rect x="0" y="14" width="500" height="4" fill={`url(#${gid})`} />
      <rect x="0" y="20" width="500" height="1" fill="rgba(197,168,90,0.3)" />
      <g transform="translate(250,14)" filter={`url(#${fid})`}>
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-55"
          stroke={`url(#${gid})`}
          strokeWidth="3"
        />
        <path
          d="M0,-55 C-5,-65 -5,-76 0,-82 C5,-76 5,-65 0,-55Z"
          fill={`url(#${gid})`}
        />
        <circle cx="0" cy="-84" r="6" fill="#f0d080" />
        <circle cx="0" cy="-84" r="3" fill="white" opacity="0.8" />
        <path
          d="M0,-28 C-16,-26 -25,-16 -20,-7 C-14,2 -3,-1 0,-7"
          stroke={`url(#${gid})`}
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M0,-28 C16,-26 25,-16 20,-7 C14,2 3,-1 0,-7"
          stroke={`url(#${gid})`}
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="-20" cy="-7" r="4" fill="#c5a85a" />
        <circle cx="20" cy="-7" r="4" fill="#c5a85a" />
        <line
          x1="0"
          y1="14"
          x2="0"
          y2="38"
          stroke={`url(#${gid})`}
          strokeWidth="1.5"
        />
        <ellipse cx="0" cy="42" rx="3" ry="5" fill="#e8c96e" opacity="0.9" />
        <ellipse cx="0" cy="42" rx="1.5" ry="2.5" fill="white" opacity="0.5" />
        {!flipped && (
          <>
            <line
              x1="0"
              y1="48"
              x2="0"
              y2="58"
              stroke={`url(#${gid})`}
              strokeWidth="1"
            />
            <ellipse
              cx="0"
              cy="61"
              rx="2"
              ry="3"
              fill="#c5a85a"
              opacity="0.9"
            />
          </>
        )}
      </g>
      {[
        { x: 125, fl: false },
        { x: 375, fl: true },
      ].map(({ x, fl }, i) => (
        <g key={i} transform={`translate(${x},14)${fl ? " scale(-1,1)" : ""}`}>
          <path
            d="M0,0 C-28,-4 -46,4 -56,-4 C-46,-18 -28,-13 0,0Z"
            stroke={`url(#${gid})`}
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0,0 C-14,-7 -22,4 -32,-1"
            stroke={`url(#${gid})`}
            strokeWidth="2"
            fill="none"
          />
          <circle cx="-56" cy="-4" r="5" fill="#c5a85a" />
          <circle cx="-56" cy="-4" r="2.5" fill="#f0d080" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="22"
            stroke={`url(#${gid})`}
            strokeWidth="1.5"
          />
          <ellipse
            cx="0"
            cy="26"
            rx="2.5"
            ry="4"
            fill="#e8c96e"
            opacity="0.9"
          />
          <ellipse cx="0" cy="26" rx="1.2" ry="2" fill="white" opacity="0.5" />
        </g>
      ))}
      {[75, 155, 345, 425].map((x, i) => (
        <g key={i} transform={`translate(${x},18)`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="16"
            stroke="rgba(197,168,90,0.6)"
            strokeWidth="1"
          />
          <ellipse
            cx="0"
            cy="20"
            rx="2.5"
            ry="4"
            fill={i % 2 === 0 ? "#c5a85a" : "#8b2222"}
            opacity="0.9"
          />
          <ellipse cx="0" cy="20" rx="1" ry="1.8" fill="white" opacity="0.4" />
        </g>
      ))}
      <circle
        cx="10"
        cy="16"
        r="5"
        fill="#c5a85a"
        opacity="0.8"
        filter={`url(#${fid})`}
      />
      <circle
        cx="490"
        cy="16"
        r="5"
        fill="#c5a85a"
        opacity="0.8"
        filter={`url(#${fid})`}
      />
    </>
  );
}

/* ── Canvas-based PDF renderer ── */
async function renderCardToCanvas(data: any) {
  const W = 1240,
    H = 1754; // A5 at ~300dpi (roughly)
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // Background gradient (navy)
  const bg = ctx.createRadialGradient(
    W * 0.5,
    H * 0.3,
    0,
    W * 0.5,
    H * 0.3,
    W * 0.7,
  );
  bg.addColorStop(0, "#0c2878");
  bg.addColorStop(0.55, "#071228");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const bg2 = ctx.createRadialGradient(
    W * 0.5,
    H * 0.8,
    0,
    W * 0.5,
    H * 0.8,
    W * 0.5,
  );
  bg2.addColorStop(0, "#08144608");
  bg2.addColorStop(0.45, "transparent");
  ctx.fillStyle = "rgba(8,20,70,0.4)";
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * W,
      y = Math.random() * H;
    const r = Math.random() * 3 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.4 + 0.1).toFixed(2)})`;
    ctx.fill();
  }

  // Gold glow blobs
  const glowPos = [
    [0.1, 0.12],
    [0.85, 0.1],
    [0.05, 0.7],
    [0.9, 0.65],
  ];
  for (const [gx, gy] of glowPos) {
    const gr = ctx.createRadialGradient(gx * W, gy * H, 0, gx * W, gy * H, 120);
    gr.addColorStop(0, "rgba(197,168,90,0.25)");
    gr.addColorStop(1, "transparent");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);
  }

  // Gold border lines (left, right, top bar, bottom bar)
  const goldGrad = (x0: number, y0: number, x1: number, y1: number) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "#6b4c0a");
    g.addColorStop(0.3, "#c5a85a");
    g.addColorStop(0.5, "#f0d080");
    g.addColorStop(0.7, "#c5a85a");
    g.addColorStop(1, "#6b4c0a");
    return g;
  };

  // Top bar
  ctx.fillStyle = goldGrad(0, 0, W, 0);
  ctx.fillRect(0, 55, W, 14);
  // Bottom bar
  ctx.save();
  ctx.translate(0, H);
  ctx.scale(1, -1);
  ctx.fillStyle = goldGrad(0, 0, W, 0);
  ctx.fillRect(0, 55, W, 14);
  ctx.restore();
  // Left bar
  ctx.fillStyle = goldGrad(0, 0, 0, H);
  ctx.fillRect(30, 0, 12, H);
  // Right bar
  ctx.fillStyle = goldGrad(0, 0, 0, H);
  ctx.fillRect(W - 42, 0, 12, H);

  // Dot accents on side bars
  for (const dotY of [H * 0.15, H * 0.3, H * 0.5, H * 0.7, H * 0.85]) {
    for (const dotX of [36, W - 36]) {
      ctx.beginPath();
      ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#c5a85a";
      ctx.fill();
    }
  }

  // Hanging gems on top bar
  const gemXs = [W * 0.15, W * 0.31, W * 0.69, W * 0.85];
  for (let i = 0; i < gemXs.length; i++) {
    const gx = gemXs[i],
      gy = 69;
    ctx.strokeStyle = "rgba(197,168,90,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx, gy + 45);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(gx, gy + 60, 7, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "#c5a85a" : "#8b2222";
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.ellipse(gx, gy + 57, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bottom gems (mirror)
  for (let i = 0; i < gemXs.length; i++) {
    const gx = gemXs[i],
      gy = H - 69;
    ctx.strokeStyle = "rgba(197,168,90,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx, gy - 45);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(gx, gy - 60, 7, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "#c5a85a" : "#8b2222";
    ctx.fill();
  }

  // Centre fleur-de-lis top
  const drawFleur = (cx: number, cy: number, scale = 1, flip = false) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, flip ? -1 : 1);
    // stem
    ctx.strokeStyle = "#c5a85a";
    ctx.lineWidth = 7 * scale;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -160);
    ctx.stroke();
    // top bud
    ctx.fillStyle = "#f0d080";
    ctx.beginPath();
    ctx.arc(0, -170, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c5a85a";
    ctx.beginPath();
    ctx.arc(0, -170, 9, 0, Math.PI * 2);
    ctx.fill();
    // left curl
    ctx.strokeStyle = "#c5a85a";
    ctx.lineWidth = 6 * scale;
    ctx.fillStyle = "none";
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.bezierCurveTo(-50, -75, -75, -50, -60, -20);
    ctx.bezierCurveTo(-45, 5, -10, -3, 0, -20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.bezierCurveTo(50, -75, 75, -50, 60, -20);
    ctx.bezierCurveTo(45, 5, 10, -3, 0, -20);
    ctx.stroke();
    ctx.fillStyle = "#c5a85a";
    ctx.beginPath();
    ctx.arc(-60, -20, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(60, -20, 12, 0, Math.PI * 2);
    ctx.fill();
    // hanging drop
    ctx.strokeStyle = "rgba(197,168,90,0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 90);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 108, 9, 15, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#e8c96e";
    ctx.fill();
    ctx.restore();
  };
  drawFleur(W / 2, 69, 1.4, false);
  drawFleur(W / 2, H - 69, 1.4, true);

  // Left/right scroll ornaments
  for (const [ox, flip] of [
    [W / 2 - 310, false],
    [W / 2 + 310, true],
  ] as [number, boolean][]) {
    ctx.save();
    ctx.translate(ox, 69);
    if (flip) ctx.scale(-1, 1);
    ctx.strokeStyle = "#c5a85a";
    ctx.lineWidth = 5;
    ctx.fillStyle = "none";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-80, -10, -130, 10, -155, -10);
    ctx.bezierCurveTo(-130, -50, -80, -36, 0, 0);
    ctx.stroke();
    ctx.fillStyle = "#c5a85a";
    ctx.beginPath();
    ctx.arc(-155, -10, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0d080";
    ctx.beginPath();
    ctx.arc(-155, -10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(197,168,90,0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 55);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 70, 7, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#e8c96e";
    ctx.fill();
    ctx.restore();
  }

  // Inner border
  ctx.strokeStyle = "rgba(197,168,90,0.15)";
  ctx.lineWidth = 2;
  ctx.strokeRect(W * 0.05, H * 0.05, W * 0.9, H * 0.9);

  // ── TEXT ──
  // Wait for fonts to be ready
  await document.fonts.ready;

  const centerX = W / 2;

  // "You're Invited"
  ctx.fillStyle = "#c5a85a";
  ctx.shadowColor = "rgba(197,168,90,0.6)";
  ctx.shadowBlur = 40;
  ctx.font = "bold 260px 'Great Vibes', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("You're", centerX, H * 0.35);
  ctx.fillText("Invited", centerX, H * 0.47);
  ctx.shadowBlur = 0;

  // Divider line + ornament
  const drawDivider = (y: number) => {
    ctx.strokeStyle = "rgba(197,168,90,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 200, y);
    ctx.lineTo(centerX - 30, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + 30, y);
    ctx.lineTo(centerX + 200, y);
    ctx.stroke();
    ctx.fillStyle = "#c5a85a";
    ctx.font = "40px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("❧", centerX, y);
  };

  const drawDot = (y: number) => {
    ctx.fillStyle = "#c5a85a";
    ctx.beginPath();
    ctx.arc(centerX, y, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  drawDivider(H * 0.535);

  // PLEASE JOIN US FOR
  ctx.fillStyle = "rgba(220,200,150,0.9)";
  ctx.font = "500 52px 'Cinzel', serif";
  ctx.letterSpacing = "8px";
  ctx.textAlign = "center";
  ctx.fillText("PLEASE JOIN US FOR", centerX, H * 0.585);
  ctx.letterSpacing = "0px";

  // Event name
  ctx.fillStyle = "#e8dfc0";
  ctx.font = "700 80px 'Cinzel', serif";
  ctx.textAlign = "center";
  ctx.fillText(data.eventName || "A Special Event", centerX, H * 0.645);

  drawDot(H * 0.695);

  // Date | Time
  ctx.fillStyle = "#d4b96a";
  ctx.font = "600 62px 'Cinzel', serif";
  ctx.textAlign = "center";
  const dateStr = (data.date || "Date") + "    " + (data.time || "Time");
  ctx.fillText(dateStr, centerX, H * 0.735);

  // separator dot between date and time
  ctx.fillStyle = "#c5a85a";
  ctx.beginPath();
  ctx.rect(centerX - 2, H * 0.755, 4, 80);
  ctx.fill();

  drawDot(H * 0.775);

  // Location
  ctx.fillStyle = "rgba(220,200,160,0.85)";
  ctx.font = "italic 300 58px 'Cormorant Garamond', serif";
  ctx.textAlign = "center";
  ctx.fillText(data.location || "Location", centerX, H * 0.82);

  return canvas;
}

/* ─── SVG Preview Borders ─── */
function BorderTop() {
  return (
    <svg
      className="bt"
      viewBox="0 0 500 160"
      preserveAspectRatio="xMidYMin meet"
    >
      <defs>
        <linearGradient id="ggt" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b4c0a" />
          <stop offset="30%" stopColor="#c5a85a" />
          <stop offset="50%" stopColor="#f0d080" />
          <stop offset="70%" stopColor="#c5a85a" />
          <stop offset="100%" stopColor="#6b4c0a" />
        </linearGradient>
        <filter id="gft">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="14" width="500" height="4" fill="url(#ggt)" />
      <rect x="0" y="20" width="500" height="1" fill="rgba(197,168,90,0.3)" />
      <g transform="translate(250,14)" filter="url(#gft)">
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-55"
          stroke="url(#ggt)"
          strokeWidth="3"
        />
        <path
          d="M0,-55 C-5,-65 -5,-76 0,-82 C5,-76 5,-65 0,-55Z"
          fill="url(#ggt)"
        />
        <circle cx="0" cy="-84" r="6" fill="#f0d080" />
        <circle cx="0" cy="-84" r="3" fill="white" opacity="0.8" />
        <path
          d="M0,-28 C-16,-26 -25,-16 -20,-7 C-14,2 -3,-1 0,-7"
          stroke="url(#ggt)"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M0,-28 C16,-26 25,-16 20,-7 C14,2 3,-1 0,-7"
          stroke="url(#ggt)"
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="-20" cy="-7" r="4" fill="#c5a85a" />
        <circle cx="20" cy="-7" r="4" fill="#c5a85a" />
        <line
          x1="0"
          y1="14"
          x2="0"
          y2="38"
          stroke="url(#ggt)"
          strokeWidth="1.5"
        />
        <ellipse cx="0" cy="42" rx="3" ry="5" fill="#e8c96e" opacity="0.9" />
        <ellipse cx="0" cy="42" rx="1.5" ry="2.5" fill="white" opacity="0.5" />
        <line
          x1="0"
          y1="48"
          x2="0"
          y2="58"
          stroke="url(#ggt)"
          strokeWidth="1"
        />
        <ellipse cx="0" cy="61" rx="2" ry="3" fill="#c5a85a" opacity="0.9" />
      </g>
      {[
        { x: 125, f: false },
        { x: 375, f: true },
      ].map(({ x, f }, i) => (
        <g key={i} transform={`translate(${x},14)${f ? " scale(-1,1)" : ""}`}>
          <path
            d="M0,0 C-28,-4 -46,4 -56,-4 C-46,-18 -28,-13 0,0Z"
            stroke="url(#ggt)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0,0 C-14,-7 -22,4 -32,-1"
            stroke="url(#ggt)"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="-56" cy="-4" r="5" fill="#c5a85a" />
          <circle cx="-56" cy="-4" r="2.5" fill="#f0d080" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="22"
            stroke="url(#ggt)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="0"
            cy="26"
            rx="2.5"
            ry="4"
            fill="#e8c96e"
            opacity="0.9"
          />
          <ellipse cx="0" cy="26" rx="1.2" ry="2" fill="white" opacity="0.5" />
        </g>
      ))}
      {[75, 155, 345, 425].map((x, i) => (
        <g key={i} transform={`translate(${x},18)`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="16"
            stroke="rgba(197,168,90,0.6)"
            strokeWidth="1"
          />
          <ellipse
            cx="0"
            cy="20"
            rx="2.5"
            ry="4"
            fill={i % 2 === 0 ? "#c5a85a" : "#8b2222"}
            opacity="0.9"
          />
          <ellipse cx="0" cy="20" rx="1" ry="1.8" fill="white" opacity="0.4" />
        </g>
      ))}
      <circle
        cx="10"
        cy="16"
        r="5"
        fill="#c5a85a"
        opacity="0.8"
        filter="url(#gft)"
      />
      <circle
        cx="490"
        cy="16"
        r="5"
        fill="#c5a85a"
        opacity="0.8"
        filter="url(#gft)"
      />
    </svg>
  );
}
function BorderBottom() {
  return (
    <svg
      className="bb"
      viewBox="0 0 500 160"
      preserveAspectRatio="xMidYMax meet"
      style={{ transform: "scaleY(-1)" }}
    >
      <defs>
        <linearGradient id="ggb" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b4c0a" />
          <stop offset="30%" stopColor="#c5a85a" />
          <stop offset="50%" stopColor="#f0d080" />
          <stop offset="70%" stopColor="#c5a85a" />
          <stop offset="100%" stopColor="#6b4c0a" />
        </linearGradient>
        <filter id="gfb">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="14" width="500" height="4" fill="url(#ggb)" />
      <rect x="0" y="20" width="500" height="1" fill="rgba(197,168,90,0.3)" />
      <g transform="translate(250,14)" filter="url(#gfb)">
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-55"
          stroke="url(#ggb)"
          strokeWidth="3"
        />
        <path
          d="M0,-55 C-5,-65 -5,-76 0,-82 C5,-76 5,-65 0,-55Z"
          fill="url(#ggb)"
        />
        <circle cx="0" cy="-84" r="6" fill="#f0d080" />
        <circle cx="0" cy="-84" r="3" fill="white" opacity="0.8" />
        <path
          d="M0,-28 C-16,-26 -25,-16 -20,-7 C-14,2 -3,-1 0,-7"
          stroke="url(#ggb)"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M0,-28 C16,-26 25,-16 20,-7 C14,2 3,-1 0,-7"
          stroke="url(#ggb)"
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="-20" cy="-7" r="4" fill="#c5a85a" />
        <circle cx="20" cy="-7" r="4" fill="#c5a85a" />
        <line
          x1="0"
          y1="14"
          x2="0"
          y2="38"
          stroke="url(#ggb)"
          strokeWidth="1.5"
        />
        <ellipse cx="0" cy="42" rx="3" ry="5" fill="#e8c96e" opacity="0.9" />
      </g>
      {[
        { x: 125, f: false },
        { x: 375, f: true },
      ].map(({ x, f }, i) => (
        <g key={i} transform={`translate(${x},14)${f ? " scale(-1,1)" : ""}`}>
          <path
            d="M0,0 C-28,-4 -46,4 -56,-4 C-46,-18 -28,-13 0,0Z"
            stroke="url(#ggb)"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="-56" cy="-4" r="5" fill="#c5a85a" />
          <circle cx="-56" cy="-4" r="2.5" fill="#f0d080" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="22"
            stroke="url(#ggb)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="0"
            cy="26"
            rx="2.5"
            ry="4"
            fill="#e8c96e"
            opacity="0.9"
          />
        </g>
      ))}
      {[75, 155, 345, 425].map((x, i) => (
        <g key={i} transform={`translate(${x},18)`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="16"
            stroke="rgba(197,168,90,0.6)"
            strokeWidth="1"
          />
          <ellipse
            cx="0"
            cy="20"
            rx="2.5"
            ry="4"
            fill={i % 2 === 0 ? "#c5a85a" : "#8b2222"}
            opacity="0.9"
          />
          <ellipse cx="0" cy="20" rx="1" ry="1.8" fill="white" opacity="0.4" />
        </g>
      ))}
      <circle
        cx="10"
        cy="16"
        r="5"
        fill="#c5a85a"
        opacity="0.8"
        filter="url(#gfb)"
      />
      <circle
        cx="490"
        cy="16"
        r="5"
        fill="#c5a85a"
        opacity="0.8"
        filter="url(#gfb)"
      />
    </svg>
  );
}
function BorderSide({ right, id }: { right: boolean; id: string | number }) {
  const gid = `gvs${id}`;
  return (
    <svg
      className="bs"
      style={{
        [right ? "right" : "left"]: 0,
        transform: right ? "scaleX(-1)" : undefined,
      }}
      viewBox="0 0 22 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6b4c0a" />
          <stop offset="30%" stopColor="#c5a85a" />
          <stop offset="50%" stopColor="#f0d080" />
          <stop offset="70%" stopColor="#c5a85a" />
          <stop offset="100%" stopColor="#6b4c0a" />
        </linearGradient>
      </defs>
      <rect x="9" y="0" width="4" height="600" fill={`url(#${gid})`} />
      {[80, 180, 280, 380, 480].map((y, i) => (
        <circle key={i} cx="11" cy={y} r="3.5" fill="#c5a85a" opacity="0.7" />
      ))}
    </svg>
  );
}

/* ─── Main ─── */
export default function InvitationCard() {
  const [data, setData] = useState({
    eventName: "A Special Celebration",
    date: "Saturday, March 15th, 2025",
    time: "6:00 PM",
    location: "The Grand Ballroom, New York",
  });
  const [loading, setLoading] = useState(false);
  const jspdfReady = useScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  );

  const set = (k: string, v: any) => setData((p) => ({ ...p, [k]: v }));

  const downloadPDF = async () => {
    setLoading(true);
    try {
      // Draw card to canvas
      const canvas = await renderCardToCanvas(data);

      // Convert to image
      const imgData = canvas.toDataURL("image/png");

      // Create PDF (A5)
      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pw, ph);
      pdf.save("invitation.pdf");
    } catch (e: any) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Form */}
        <div className="fp">
          <div className="ft">Customize Invitation</div>
          <div className="field">
            <label>Event Name</label>
            <input
              value={data.eventName}
              onChange={(e) => set("eventName", e.target.value)}
              placeholder="A Special Celebration"
            />
          </div>
          <div className="frow">
            <div className="field">
              <label>Date</label>
              <input
                value={data.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="March 15th, 2025"
              />
            </div>
            <div className="field">
              <label>Time</label>
              <input
                value={data.time}
                onChange={(e) => set("time", e.target.value)}
                placeholder="6:00 PM"
              />
            </div>
          </div>
          <div className="field">
            <label>Location</label>
            <input
              value={data.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="The Grand Ballroom"
            />
          </div>
          <button
            className="btn"
            onClick={downloadPDF}
            disabled={loading || !jspdfReady}
          >
            {loading ? (
              <>
                <div className="spin" />
                <span>Generating PDF…</span>
              </>
            ) : (
              <span>✦ Download PDF ✦</span>
            )}
          </button>
          <p className="hint">Downloads exact card design as PDF</p>
        </div>

        {/* Preview Card */}
        <div className="card">
          <div className="stars">
            {STARS.map((s) => (
              <div
                key={s.id}
                className="star"
                style={
                  {
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${s.size}px`,
                    height: `${s.size}px`,
                    "--dur": `${s.dur}s`,
                    "--delay": `${s.delay}s`,
                    "--min-op": s.minOp,
                    "--max-op": s.maxOp,
                  } as React.CSSProperties
                }
              />
            ))}
            {GLOWS.map((g, i) => (
              <div
                key={i}
                className="glow-star"
                style={
                  {
                    ...{
                      left: `${g.x}%`,
                      top: `${g.y}%`,
                      width: `${g.s}px`,
                      height: `${g.s}px`,
                      marginLeft: `-${g.s / 2}px`,
                      marginTop: `-${g.s / 2}px`,
                      "--delay": `${g.d}s`,
                    },
                  } as React.CSSProperties & Record<string, string | number>
                }
              />
            ))}
          </div>
          <BorderTop />
          <BorderBottom />
          <BorderSide right={false} id="l" />
          <BorderSide right={true} id="r" />
          <div className="ib" />
          <div className="cc">
            <div className="ch">You're</div>
            <div className="ch" style={{ marginTop: "-8px" }}>
              Invited
            </div>
            <div className="od">
              <div className="ol" />
              <span
                style={{ color: "#c5a85a", fontSize: "16px", lineHeight: 1 }}
              >
                ❧
              </span>
              <div className="olr" />
            </div>
            <p className="pj">Please Join Us For</p>
            <p className="en">{data.eventName || "A Special Event"}</p>
            <div className="od" style={{ margin: "2px 0 10px" }}>
              <div className="ol" />
              <span style={{ color: "#c5a85a", fontSize: "11px" }}>◆</span>
              <div className="olr" />
            </div>
            <div className="dr">
              <span className="di">{data.date || "Date"}</span>
              <div className="ds" />
              <span className="di">{data.time || "Time"}</span>
            </div>
            <div className="od" style={{ margin: "8px 0 6px" }}>
              <div className="ol" />
              <span style={{ color: "rgba(197,168,90,.5)", fontSize: "10px" }}>
                ◆
              </span>
              <div className="olr" />
            </div>
            <p className="dl">{data.location || "Location"}</p>
          </div>
        </div>
      </div>
    </>
  );
}
