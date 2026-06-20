import { formatNumber } from "./format";

interface Particle {
  active: boolean;
  x: number;
  y: number;
  value: number;
  isCritical: boolean;
  isBoss: boolean;
  life: number;
  maxLife: number;
  velocityY: number;
}

class ParticleSystem {
  private pool: Particle[];
  private poolSize = 150;
  private damageLastSecond = 0;

  constructor() {
    this.pool = Array.from({ length: this.poolSize }, () => ({
      active: false,
      x: 0,
      y: 0,
      value: 0,
      isCritical: false,
      isBoss: false,
      life: 0,
      maxLife: 1,
      velocityY: -2,
    }));
  }

  public spawn(
    x: number,
    y: number,
    value: number,
    isCritical: boolean,
    isBoss: boolean,
  ) {
    this.damageLastSecond += value;
    const p = this.pool.find((p) => !p.active);
    if (p) {
      p.active = true;
      p.x = x;
      p.y = y;
      p.value = value;
      p.isCritical = isCritical;
      p.isBoss = isBoss;
      p.life = 1;
      p.maxLife = 1;
      p.velocityY = -2;
    }
  }

  public flushDamage(): number {
    const d = this.damageLastSecond;
    this.damageLastSecond = 0;
    return d;
  }

  public updateAndDraw(ctx: CanvasRenderingContext2D, dt: number) {
    for (let i = 0; i < this.poolSize; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life -= dt;
      p.y += p.velocityY;

      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      const alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";

      if (p.isCritical) {
        ctx.font = "900 20px system-ui";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(238,21,21,0.8)";
        ctx.shadowBlur = 5;
        ctx.fillText("CRITICAL!", p.x, p.y - 50);

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
      ctx.fillText(`+$${formatNumber(p.value)}`, p.x, p.y);

      ctx.restore();
    }
  }
}

export const ParticleManager = new ParticleSystem();
