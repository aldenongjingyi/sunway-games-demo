interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  shape: 'rect' | 'circle';
  opacity: number;
}

export class ConfettiSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start(): void {
    this.resize(); this.particles = [];
    const colors = ['#EF476F', '#FFD23F', '#FF6B35', '#06D6A0', '#A855F7', '#F472B6'];
    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width, y: -20 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 8, vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4, rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'rect' : 'circle', opacity: 1,
      });
    }
    this.running = true; this._loop();
  }

  stop(): void {
    this.running = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private _loop(): void {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let alive = false;
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.vx *= 0.99; p.rotation += p.rotSpeed;
      if (p.y > this.canvas.height + 20) p.opacity -= 0.02;
      if (p.opacity <= 0) continue;
      alive = true;
      this.ctx.save();
      this.ctx.translate(p.x, p.y); this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity; this.ctx.fillStyle = p.color;
      if (p.shape === 'rect') this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else { this.ctx.beginPath(); this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); this.ctx.fill(); }
      this.ctx.restore();
    }
    if (alive) requestAnimationFrame(() => this._loop());
    else { this.running = false; this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }
  }

  burst(x: number, y: number, color = '#FFD600', count = 25): void {
    this.resize();
    const colors = [color, '#FF6B35', '#FFD23F', '#EF476F', '#06D6A0'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3, rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.3 ? 'circle' : 'rect', opacity: 1,
      });
    }
    if (!this.running) { this.running = true; this._loop(); }
  }

  startSmall(count = 40): void {
    this.resize();
    const colors = ['#FFD23F', '#FF6B35', '#EF476F', '#06D6A0', '#A855F7'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width, y: -10 - Math.random() * 150,
        vx: (Math.random() - 0.5) * 5, vy: Math.random() * 2 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 2, rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        shape: Math.random() > 0.5 ? 'rect' : 'circle', opacity: 1,
      });
    }
    if (!this.running) { this.running = true; this._loop(); }
  }
}
