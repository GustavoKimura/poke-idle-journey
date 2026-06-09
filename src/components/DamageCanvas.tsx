import { useEffect, useRef } from "react";
import { formatNumber } from "../utils/format";

interface Particle {
  id: number;
  x: number;
  y: number;
  value: number;
  isCritical: boolean;
  isBoss: boolean;
  life: number;
  maxLife: number;
  velocityY: number;
}

export function DamageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const particleIdRef = useRef<number>(0);

  useEffect(() => {
    const handleSpawn = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { x, y, value, isCritical, isBoss } = customEvent.detail;

      particlesRef.current.push({
        id: particleIdRef.current++,
        x,
        y,
        value,
        isCritical,
        isBoss,
        life: 1,
        maxLife: 1,
        velocityY: -2,
      });
    };

    window.addEventListener("SPAWN_TEXT", handleSpawn);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life -= dt;
        p.y += p.velocityY;

        if (p.life <= 0) return false;

        const alpha = Math.max(0, p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textAlign = "center";

        if (p.isCritical) {
          ctx.font = "900 20px system-ui";
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "rgba(238,21,21,0.8)";
          ctx.shadowBlur = 5;
          ctx.fillText("CRITICAL!", p.x, p.y - 30);

          ctx.font = "900 48px system-ui";
          ctx.fillStyle = "#EE1515";
        } else if (p.isBoss) {
          ctx.font = "900 30px system-ui";
          ctx.fillStyle = "#fb923c";
        } else {
          ctx.font = "900 30px system-ui";
          ctx.fillStyle = "#FFDE00";
        }

        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(`+${formatNumber(p.value)}`, p.x, p.y);

        ctx.restore();

        return true;
      });

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("SPAWN_TEXT", handleSpawn);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
