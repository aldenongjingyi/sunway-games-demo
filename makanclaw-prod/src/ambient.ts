interface AmbientParticle {
  x: number; y: number;
  r: number;
  vx: number; vy: number;
  color: string;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
}

export class AmbientBackground {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: AmbientParticle[] = [];

  constructor(canvas: HTMLCanvasElement, colors?: string[], maxAlpha?: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this._init(colors || ['#FF6B35', '#FFD23F', '#EF476F', '#FFD600', '#A855F7'], maxAlpha ?? 0.3);
    this._loop();
  }

  resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private _init(colors: string[], maxAlpha: number): void {
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height,
        r: Math.random() * 1.8 + 0.4, vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 0.25 - 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * maxAlpha + maxAlpha * 0.2, pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      });
    }
  }

  private _loop(): void {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.pulse += p.pulseSpeed;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = p.r * 4;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(() => this._loop());
  }
}
