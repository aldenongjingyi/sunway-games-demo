export class AudioEngine {
  ctx: AudioContext | null = null;
  enabled = true;
  private _motorNode: AudioBufferSourceNode | null = null;
  private _motorGain: GainNode | null = null;
  private _ambientNode: OscillatorNode | null = null;
  private _ambientGain: GainNode | null = null;
  private _tensionNode: OscillatorNode | null = null;
  private _tensionGain: GainNode | null = null;

  init(): void {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      this.enabled = false;
    }
  }

  play(type: string): void {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    try {
      const fn = this._methods[type];
      if (fn) fn();
    } catch { /* swallow audio errors */ }
  }

  private get _methods(): Record<string, () => void> {
    return {
      tick: () => this._tick(),
      coin: () => this._coin(),
      spin: () => this._spin(),
      drop: () => this._drop(),
      grab: () => this._grab(),
      lift: () => this._lift(),
      slip: () => this._slip(),
      reveal: () => this._reveal(),
      fanfare: () => this._fanfare(),
      rouletteTick: () => this._rouletteTick(),
      select: () => this._select(),
      tensionRise: () => this._tensionRise(),
      crack: () => this._crack(),
      motorWhir: () => this._motorWhir(),
    };
  }

  private _tick(): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 300;
    g.gain.value = 0.03; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.03);
  }

  private _coin(): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    [800, 1000, 1200].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.value = 0.1; g.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + i * 0.05);
      o.connect(g).connect(ctx.destination); o.start(now + i * 0.08); o.stop(now + 0.2 + i * 0.05);
    });
  }

  private _spin(): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 600;
    g.gain.value = 0.04; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.05);
  }

  private _drop(): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 400;
    o.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.5);
    g.gain.value = 0.08; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.5);
  }

  private _grab(): void {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const source = ctx.createBufferSource(); source.buffer = buffer;
    const g = ctx.createGain(); g.gain.value = 0.15;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    source.connect(g).connect(ctx.destination); source.start();
  }

  private _lift(): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 150;
    o.frequency.linearRampToValueAtTime(300, ctx.currentTime + 1.5);
    g.gain.value = 0.04; g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 1.5);
  }

  private _slip(): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 300;
    o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
    g.gain.value = 0.1; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.4);
  }

  private _reveal(): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.value = 0.08; g.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.1);
      o.connect(g).connect(ctx.destination); o.start(now + i * 0.08); o.stop(now + 0.8 + i * 0.1);
    });
  }

  private _fanfare(): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.value = 0.1; g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      o.connect(g).connect(ctx.destination); o.start(now + i * 0.12); o.stop(now + 1.2);
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.value = freq * 2;
      g2.gain.value = 0.03; g2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      o2.connect(g2).connect(ctx.destination); o2.start(now + i * 0.12); o2.stop(now + 1.0);
    });
  }

  private _rouletteTick(): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 500;
    g.gain.value = 0.06; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.02);
  }

  private _select(): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 440;
    g.gain.value = 0.05; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.05);
  }

  _motorWhir(_duration = 2): void {
    if (!this.ctx || this._motorNode) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * _duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass'; bandpass.frequency.value = 150; bandpass.Q.value = 2;
    const g = ctx.createGain(); g.gain.value = 0.03;
    source.connect(bandpass).connect(g).connect(ctx.destination);
    source.start();
    this._motorNode = source; this._motorGain = g;
  }

  _stopMotor(): void {
    if (this._motorNode && this._motorGain && this.ctx) {
      try { this._motorGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1); } catch { /* */ }
      const node = this._motorNode;
      setTimeout(() => { try { node.stop(); } catch { /* */ } }, 150);
      this._motorNode = null; this._motorGain = null;
    }
  }

  _clack(intensity: number): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const vol = Math.min((intensity || 0.5) * 0.08, 0.12);
    const pitch = 250 + Math.random() * 100;
    const o = ctx.createOscillator();
    o.type = 'sine'; o.frequency.value = pitch;
    o.frequency.exponentialRampToValueAtTime(pitch * 0.5, t + 0.06);
    const og = ctx.createGain(); og.gain.value = vol;
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(og).connect(ctx.destination);
    o.start(t); o.stop(t + 0.08);
    const bufLen = ctx.sampleRate * 0.025;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 2;
    const ng = ctx.createGain(); ng.gain.value = vol * 0.4;
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    src.connect(bp).connect(ng).connect(ctx.destination); src.start(t);
  }

  private _tensionRise(duration = 2): void {
    if (!this.ctx || this._tensionNode) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 200;
    o.frequency.linearRampToValueAtTime(800, ctx.currentTime + duration);
    g.gain.value = 0.03;
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + duration);
    this._tensionNode = o; this._tensionGain = g;
    setTimeout(() => { this._tensionNode = null; this._tensionGain = null; }, duration * 1000);
  }

  _stopTension(): void {
    if (this._tensionNode && this._tensionGain && this.ctx) {
      try { this._tensionGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05); } catch { /* */ }
      try { this._tensionNode.stop(); } catch { /* */ }
      this._tensionNode = null; this._tensionGain = null;
    }
  }

  private _crack(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.exp(-i / (ctx.sampleRate * 0.02));
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const source = ctx.createBufferSource(); source.buffer = buffer;
    const g = ctx.createGain(); g.gain.value = 0.2;
    source.connect(g).connect(ctx.destination); source.start();
    [600, 900, 1200].forEach((freq, i) => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      gn.gain.value = 0.06; gn.gain.exponentialRampToValueAtTime(0.001, now + 0.4 + i * 0.05);
      o.connect(gn).connect(ctx.destination); o.start(now + 0.05 + i * 0.06); o.stop(now + 0.4 + i * 0.05);
    });
  }

  _ambientHum(): void {
    if (!this.ctx || this._ambientNode) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 60;
    g.gain.value = 0.02;
    o.connect(g).connect(ctx.destination); o.start();
    this._ambientNode = o; this._ambientGain = g;
  }

  _stopAmbient(): void {
    if (this._ambientNode && this._ambientGain && this.ctx) {
      try { this._ambientGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2); } catch { /* */ }
      const node = this._ambientNode;
      setTimeout(() => { try { node.stop(); } catch { /* */ } }, 250);
      this._ambientNode = null; this._ambientGain = null;
    }
  }
}
