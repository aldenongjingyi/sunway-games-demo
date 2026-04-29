import gsap from 'gsap';
import type { Shop, Capsule, GameState } from './types';
import type { ThemeConfig } from './theme';
import { DEFAULT_THEME } from './theme';
import { AudioEngine } from './audio';
import { ConfettiSystem } from './confetti';
import {
  loadShops, pickRandom, initFilters, getFilteredShops,
  activeFilters, updateFilterCount, CUISINE_CATS, MIN_SHOPS,
  shopEmoji, shopCuisineLabel,
} from './data';

export class MakanClawGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  audio: AudioEngine;
  private confetti: ConfettiSystem;
  private theme: ThemeConfig;

  state: GameState = 'loading';
  private allShops: Shop[] = [];
  private filteredShops: Shop[] = [];
  private capsules: Capsule[] = [];
  private clawX = 0;
  private clawTargetX = 0;
  private clawY = 0;
  private clawOpen = 1;
  private grabbedCapsule: Capsule | null = null;
  private selectedShop: Shop | null = null;
  _loopRunning = false;
  private attempt = 0;
  private shuffleTimer = 0;
  private shuffleIntensity = 0;
  private machineLeft = 0;
  private machineRight = 0;
  private floorY = 0;
  private railY = 0;
  private capsuleRadius = 0;
  private W = 0;
  private H = 0;
  private isDragging = false;
  private lastMoveSound = 0;
  private chainSway = 0;
  private lastClackTime = 0;
  private _lastFrameTime = 0;
  private _rainStart = 0;
  private _settleStarted = false;
  private _settleTime = 0;
  private _settleCheckTimer: ReturnType<typeof setInterval> | null = null;
  private grabDistance = 0;

  constructor(theme?: ThemeConfig) {
    this.theme = theme || DEFAULT_THEME;
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.audio = new AudioEngine();
    this.confetti = new ConfettiSystem(document.getElementById('confetti-canvas') as HTMLCanvasElement);

    this._bindEvents();
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._loadData();
  }

  private async _loadData(): Promise<void> {
    try {
      this.allShops = await loadShops();
    } catch (e) {
      console.error('Failed to load restaurant data:', e);
      this.allShops = [];
    }
    initFilters(this.allShops, () => {
      this.audio.play('select');
      this.audio.init();
      this._startGamePhase();
    });
    this.state = 'title';
    this._animateTitle();
    const dismissLoading = () => {
      document.getElementById('loading-screen')!.classList.add('hidden');
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(dismissLoading, 300));
    } else {
      setTimeout(dismissLoading, 800);
    }
  }

  private _animateTitle(): void {
    const els = [
      '#title-screen .brand-tag', '#title-screen .title-main',
      '#title-screen .title-sub', '#title-screen .claw-icon',
      '#filter-wrap', '#title-screen .neon-btn', '#title-screen .title-capsules',
    ];
    els.forEach((sel, i) => {
      gsap.to(sel, { opacity: 1, y: 0, duration: 0.5, delay: 0.15 + i * 0.1, ease: 'power2.out' });
    });
  }

  private _bindEvents(): void {
    const juiceBtn = (btn: HTMLElement) => {
      btn.addEventListener('pointerdown', () => {
        gsap.fromTo(btn, { scale: 1 }, { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1 });
      });
    };
    const playBtn = document.getElementById('play-btn')!;
    const dropBtn = document.getElementById('drop-btn')!;
    const replayBtn = document.getElementById('replay-btn')!;

    playBtn.addEventListener('click', () => { this.audio.play('select'); this.audio.init(); this._startGamePhase(); });
    dropBtn.addEventListener('click', () => this.dropClaw());
    replayBtn.addEventListener('click', () => { this.audio.play('select'); this._fullReset(); });

    [playBtn, dropBtn, replayBtn].forEach(juiceBtn);

    const soundToggle = document.getElementById('sound-toggle')!;
    soundToggle.addEventListener('click', () => {
      this.audio.enabled = !this.audio.enabled;
      soundToggle.innerHTML = this.audio.enabled ? '&#x1f50a;' : '&#x1f507;';
      soundToggle.classList.toggle('muted', !this.audio.enabled);
      if (!this.audio.enabled) {
        this.audio._stopMotor(); this.audio._stopAmbient(); this.audio._stopTension();
      }
    });

    const machineBody = document.querySelector('.machine-body')!;
    const getGameX = (e: TouchEvent | MouseEvent): number => {
      const touch = 'touches' in e ? e.touches[0] : e;
      const rect = this.canvas.getBoundingClientRect();
      return ((touch.clientX - rect.left) / rect.width) * this.W;
    };

    machineBody.addEventListener('touchstart', (e) => {
      if (this.state !== 'playing') return;
      (e as Event).preventDefault(); this.isDragging = true; this.audio.init();
      this.clawTargetX = getGameX(e as TouchEvent); this.audio.play('motorWhir');
    }, { passive: false });

    machineBody.addEventListener('touchmove', (e) => {
      if (!this.isDragging || this.state !== 'playing') return;
      (e as Event).preventDefault(); this.clawTargetX = getGameX(e as TouchEvent);
      const now = Date.now();
      if (now - this.lastMoveSound > 80) { this.audio.play('tick'); this.lastMoveSound = now; }
    }, { passive: false });

    machineBody.addEventListener('touchend', () => { this.isDragging = false; this.audio._stopMotor(); });

    machineBody.addEventListener('mousedown', (e) => {
      if (this.state !== 'playing') return;
      this.isDragging = true; this.audio.init();
      this.clawTargetX = getGameX(e as MouseEvent); this.audio.play('motorWhir');
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || this.state !== 'playing') return;
      this.clawTargetX = getGameX(e);
    });
    window.addEventListener('mouseup', () => { this.isDragging = false; this.audio._stopMotor(); });
  }

  private _resize(): void {
    const container = document.querySelector('.machine-body');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = rect.width; this.H = rect.height;
    const padding = this.W * 0.06;
    this.machineLeft = padding; this.machineRight = this.W - padding;
    this.floorY = this.H - 20; this.railY = 25;
    this.capsuleRadius = Math.min(this.W * 0.085, 36);
    this.clawX = this.W / 2; this.clawTargetX = this.W / 2;
    this.clawY = this.railY + 10;
    this.confetti.resize();
  }

  // ===== PHASE: GAME START =====
  private _startGamePhase(): void {
    this.filteredShops = getFilteredShops(this.allShops);
    if (this.filteredShops.length < MIN_SHOPS) this.filteredShops = [...this.allShops];

    const badge = document.getElementById('cuisine-badge')!;
    let badgeLabel = 'ALL';
    for (const c of CUISINE_CATS) {
      if (activeFilters.has(c.id)) { badgeLabel = c.name; break; }
    }
    badge.textContent = badgeLabel;

    const title = document.getElementById('title-screen')!;
    gsap.to(title, {
      opacity: 0, y: -20, duration: 0.35, ease: 'power2.in', onComplete: () => {
        title.style.display = 'none'; gsap.set(title, { clearProps: 'y' });
        const gameScreen = document.getElementById('game-screen')!;
        gameScreen.classList.add('active', 'screen-enter');
        setTimeout(() => gameScreen.classList.remove('screen-enter'), 500);
        this._resize();
        this._initCapsulesAbove();
        this.attempt = 0;
        this.clawX = this.W / 2; this.clawTargetX = this.W / 2;
        this.clawY = this.railY + 10; this.clawOpen = 1; this.grabbedCapsule = null;
        this.state = 'capsule-drop'; this._loopRunning = false; this._gameLoop();
        this._rainCapsules();
      },
    });
  }

  private _initCapsulesAbove(): void {
    this.capsules = [];
    const r = this.capsuleRadius;
    const picked = pickRandom(this.filteredShops, Math.min(12, this.filteredShops.length));
    const pool = [...picked, ...picked];
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
      const spread = this.machineRight - this.machineLeft - r * 2;
      const x = this.machineLeft + r + Math.random() * spread;
      this.capsules.push({
        x, y: -r * 2 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 10, vy: 0, r,
        color: this.theme.capsuleColors[i % this.theme.capsuleColors.length],
        shop: shuffled[i], grabbed: false, frozen: true,
        dropDelay: i * 0.06 + Math.random() * 0.04,
        scaleX: 1, scaleY: 1, idlePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  private _rainCapsules(): void {
    this._rainStart = performance.now();
    this._settleStarted = false;
    this._settleCheckTimer = setInterval(() => {
      const allDropped = this.capsules.every(c => !c.frozen);
      if (!allDropped) return;
      if (!this._settleStarted) { this._settleStarted = true; this._settleTime = performance.now(); }
      const elapsed = performance.now() - this._settleTime;
      const allSettled = this.capsules.every(c => Math.abs(c.vy) < 15 && Math.abs(c.vx) < 15);
      if (allSettled || elapsed > 2000) {
        clearInterval(this._settleCheckTimer!);
        this.capsules.forEach(c => { c.vx = 0; c.vy = 0; });
        this._nextAttempt();
      }
    }, 100);
  }

  private _nextAttempt(): void {
    this.attempt++;
    this.clawOpen = 1; this.grabbedCapsule = null;
    this.clawY = this.railY + 10;
    this.clawX = this.W / 2; this.clawTargetX = this.W / 2;
    this.shuffleIntensity = Math.min(this.attempt * 0.2, 1.5);
    this.state = 'playing';
    (document.getElementById('drop-btn') as HTMLButtonElement).disabled = false;
    document.getElementById('instruction-text')!.innerHTML =
      this.attempt === 1 ? '&#9664; DRAG TO AIM &#9654;' : '&#9664; TRY AGAIN! &#9654;';
    const dots = document.querySelectorAll('.adot');
    dots.forEach((d, i) => {
      d.classList.remove('active', 'used');
      if (i < this.attempt - 1) d.classList.add('used');
      else if (i === this.attempt - 1) d.classList.add('active');
    });
  }

  private _showStatusMessage(text: string, color: string, callback?: () => void): void {
    const msg = document.getElementById('status-msg')!;
    msg.textContent = text; msg.style.color = color;
    msg.style.textShadow = 'none';
    gsap.fromTo(msg,
      { opacity: 0, scale: 0.5, y: '-50%' },
      {
        opacity: 1, scale: 1, y: '-50%', duration: 0.4, ease: 'back.out(2)',
        onComplete: () => { gsap.to(msg, { opacity: 0, scale: 1.2, duration: 0.4, delay: 0.6, onComplete: callback }); },
      }
    );
  }

  // ===== CAPSULE PHYSICS =====
  private _physicsTick(dt: number): void {
    const gravity = 980, bounce = 0.2, friction = 0.995, floorFriction = 0.85;
    const r = this.capsuleRadius;
    for (const c of this.capsules) {
      if (c.grabbed || c.frozen) continue;
      c.vy += gravity * dt; c.vx *= friction;
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.y + r > this.floorY) {
        const preVy = Math.abs(c.vy);
        c.y = this.floorY - r; c.vy = -c.vy * bounce; c.vx *= floorFriction;
        const impact = Math.min(preVy / 300, 1);
        c.scaleY = 1 - impact * 0.3; c.scaleX = 1 + impact * 0.3;
        if (Math.abs(c.vy) < 12) c.vy = 0;
        if (Math.abs(c.vx) < 5) c.vx = 0;
        const now = Date.now();
        if (preVy > 200 && now - this.lastClackTime > 120 && this.audio.enabled && this.audio.ctx) {
          this.lastClackTime = now;
          this.audio._clack(Math.min(preVy / 500, 1));
        }
      }
      if (c.x - r < this.machineLeft) { c.x = this.machineLeft + r; c.vx = Math.abs(c.vx) * bounce; }
      if (c.x + r > this.machineRight) { c.x = this.machineRight - r; c.vx = -Math.abs(c.vx) * bounce; }
      for (const other of this.capsules) {
        if (other === c || other.grabbed || other.frozen) continue;
        const dx = other.x - c.x, dy = other.y - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = r * 2;
        if (dist < minDist && dist > 0.1) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          c.x -= nx * overlap; c.y -= ny * overlap;
          other.x += nx * overlap; other.y += ny * overlap;
          const relVx = c.vx - other.vx, relVy = c.vy - other.vy;
          const relDot = relVx * nx + relVy * ny;
          if (relDot > 0) {
            c.vx -= relDot * nx * 0.5; c.vy -= relDot * ny * 0.5;
            other.vx += relDot * nx * 0.5; other.vy += relDot * ny * 0.5;
            const impulse = Math.abs(relDot);
            const now = Date.now();
            const throttle = this.state === 'capsule-drop' ? 200 : 150;
            if (impulse > 150 && now - this.lastClackTime > throttle && this.audio.enabled && this.audio.ctx) {
              this.lastClackTime = now;
              this.audio._clack(Math.min(impulse / 400, 1));
            }
          }
        }
      }
    }
  }

  // ===== DROP + GRAB + LIFT =====
  dropClaw(): void {
    if (this.state !== 'playing') return;
    this.audio.init(); this.state = 'dropping';
    (document.getElementById('drop-btn') as HTMLButtonElement).disabled = true;
    this.audio.play('drop');

    const reach = this.capsuleRadius * 3;
    let target: Capsule | null = null, bestScore = Infinity;
    for (const c of this.capsules) {
      if (c.grabbed) continue;
      const hdist = Math.abs(c.x - this.clawX);
      if (hdist < reach) {
        const score = hdist * 2 + c.y * 0.05;
        if (score < bestScore) { bestScore = score; target = c; }
      }
    }

    let targetY: number;
    if (target) {
      targetY = target.y - 124;
    } else {
      targetY = this.floorY - 130 - this.capsuleRadius;
    }
    targetY = Math.max(this.railY + 40, Math.min(targetY, this.floorY - 130 - this.capsuleRadius));

    this.audio.play('tensionRise');
    gsap.to(this, {
      clawY: targetY, duration: 1.2, ease: 'power1.inOut',
      onComplete: () => { this.audio._stopTension(); this._grabNearest(); },
    });
  }

  private _grabNearest(): void {
    const clawTipY = this.clawY + 126;
    let nearest: Capsule | null = null, nearestDist = Infinity;
    for (const c of this.capsules) {
      if (c.grabbed) continue;
      const dx = c.x - this.clawX, dy = c.y - clawTipY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) { nearestDist = dist; nearest = c; }
    }
    const grabReach = this.capsuleRadius * 3;
    if (!nearest || nearestDist > grabReach) {
      gsap.timeline()
        .to(this, { clawOpen: 1.3, duration: 0.15, ease: 'power1.out' })
        .to(this, { clawOpen: 0, duration: 0.3, ease: 'power2.inOut', delay: 0.1 });
      this.audio.play('slip');
      this._showStatusMessage('MISSED!', '#EF476F', () => {
        gsap.to(this, { clawOpen: 1, duration: 0.2 });
        gsap.to(this, {
          clawY: this.railY + 10, duration: 0.6, ease: 'power2.out',
          onComplete: () => this._nextAttempt(),
        });
      });
      return;
    }
    this.grabbedCapsule = nearest;
    this.grabDistance = nearestDist;
    nearest.grabbed = true;
    this.selectedShop = nearest.shop;
    gsap.timeline()
      .to(this, { clawOpen: 1.3, duration: 0.15, ease: 'power1.out' })
      .to(this, { clawOpen: 0, duration: 0.3, ease: 'power2.inOut', delay: 0.1 });
    const pullTargetY = this.clawY + 126;
    gsap.to(nearest, { y: pullTargetY, duration: 0.4, ease: 'power2.out' });
    const app = document.getElementById('app')!;
    app.classList.add('shake'); setTimeout(() => app.classList.remove('shake'), 450);
    this.audio.play('grab');
    navigator.vibrate?.([100]);
    const centeredness = Math.max(0, 1 - nearestDist / (this.capsuleRadius * 2.5));
    let feedbackColor: string, feedbackMsg: string;
    if (centeredness > 0.7) { feedbackColor = '#06D6A0'; feedbackMsg = 'GREAT!'; }
    else if (centeredness > 0.35) { feedbackColor = '#FFD600'; feedbackMsg = 'OK'; }
    else { feedbackColor = '#EF476F'; feedbackMsg = 'WEAK'; }
    this._flashGrabQuality(feedbackColor, feedbackMsg);
    const canvasRect = this.canvas.getBoundingClientRect();
    const screenX = canvasRect.left + (nearest.x / this.W) * canvasRect.width;
    const screenY = canvasRect.top + (nearest.y / this.H) * canvasRect.height;
    this.confetti.burst(screenX, screenY, feedbackColor, 25);
    for (const c of this.capsules) {
      if (c === nearest || c.grabbed) continue;
      const dx = c.x - nearest.x, dy = c.y - nearest.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.capsuleRadius * 5) {
        const falloff = 1 - dist / (this.capsuleRadius * 5);
        c.vy = (-20 - Math.random() * 30) * falloff;
        c.vx = (Math.random() - 0.5) * 20 * falloff;
      }
    }
    setTimeout(() => this._liftClaw(), 400);
  }

  private _flashGrabQuality(color: string, text: string): void {
    const msg = document.getElementById('status-msg')!;
    msg.textContent = text; msg.style.color = color;
    msg.style.textShadow = 'none';
    gsap.fromTo(msg, { opacity: 1, scale: 1.5, y: '-50%' },
      { opacity: 0, scale: 2, y: '-50%', duration: 0.8, ease: 'power2.out' });
    const flash = document.getElementById('flash-overlay')!;
    flash.style.background = `radial-gradient(ellipse at center, transparent 40%, ${color}30 100%)`;
    gsap.fromTo(flash, { opacity: 0.7 }, {
      opacity: 0, duration: 0.4, ease: 'power2.out',
      onComplete: () => { flash.style.background = 'white'; },
    });
  }

  private _liftClaw(): void {
    this.state = 'lifting'; this.audio.play('lift');
    const c = this.grabbedCapsule;
    const r = this.capsuleRadius;
    const centeredness = Math.max(0, 1 - this.grabDistance / (r * 2.5));
    let successChance = 0.20 + centeredness * 0.70;
    successChance += Math.min(this.attempt * 0.15, 0.60);
    if (this.attempt >= 3) successChance = 1;
    successChance = Math.min(successChance, 0.98);
    const success = Math.random() < successChance;
    let liftTarget: number;
    if (success) { liftTarget = this.railY + 10; }
    else {
      const liftFraction = 0.25 + centeredness * 0.45;
      liftTarget = this.clawY - (this.clawY - this.railY) * liftFraction;
    }
    gsap.to(this, {
      clawY: liftTarget, duration: success ? 1.8 : 1.2, ease: 'power1.inOut',
      onUpdate: () => {
        if (c) {
          c.x += (this.clawX - c.x) * 0.1;
          c.y = this.clawY + 126;
        }
      },
      onComplete: () => {
        if (success) {
          gsap.to(this, {
            clawX: this.W / 2, clawTargetX: this.W / 2, duration: 0.5, ease: 'power2.inOut',
            onUpdate: () => {
              if (c) {
                c.x += (this.clawX - c.x) * 0.2;
                c.y = this.clawY + 126;
              }
            },
            onComplete: () => this._revealSequence(),
          });
        } else { this._slipCapsule(); }
      },
    });
  }

  private _slipCapsule(): void {
    this.audio.play('slip');
    const c = this.grabbedCapsule;
    if (this.attempt >= 2) {
      gsap.to(this, { clawX: this.clawX - 5, duration: 0.05, yoyo: true, repeat: 5 });
    }
    setTimeout(() => {
      if (c) {
        const origX = c.x;
        gsap.to(c, {
          x: origX + 4, duration: 0.04, yoyo: true, repeat: 7, ease: 'none',
          onComplete: () => { c.x = origX; },
        });
      }
      gsap.to(this, { clawOpen: 1, duration: 0.15, delay: 0.15 });
      setTimeout(() => {
        if (c) { c.grabbed = false; c.vy = 2; c.vx = (Math.random() - 0.5) * 15; }
        this.grabbedCapsule = null;
      }, 200);
      const msgs = ['ALMOST!', 'SO CLOSE!', 'SLIPPED!', 'TRY AGAIN!', 'NEARLY!'];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      this._showStatusMessage(msg, '#FFD23F', () => {
        gsap.to(this, {
          clawY: this.railY + 10, duration: 0.6, ease: 'power2.out',
          onComplete: () => this._nextAttempt(),
        });
      });
    }, this.attempt >= 2 ? 400 : 100);
  }

  // ===== REVEAL =====
  private _revealSequence(): void {
    this.state = 'revealing';
    this.audio._stopAmbient(); this.audio._stopMotor();
    const shop = this.selectedShop!;
    const emoji = shopEmoji(shop);
    setTimeout(() => {
      document.getElementById('game-screen')!.classList.remove('active');
      this._playCapsuleOpen('#FF6B35', emoji, () => this._showResult());
    }, 300);
  }

  private _playCapsuleOpen(color: string, emoji: string, onComplete: () => void): void {
    const overlay = document.getElementById('capsule-open-overlay')!;
    const leftInner = document.getElementById('capsule-left-inner')!;
    const rightInner = document.getElementById('capsule-right-inner')!;
    const leftHalf = document.getElementById('capsule-left')!;
    const rightHalf = document.getElementById('capsule-right')!;
    const emojiEl = document.getElementById('capsule-emoji')!;
    const glowRing = document.getElementById('capsule-glow')!;
    const label = document.getElementById('capsule-label')!;
    const raysContainer = document.getElementById('capsule-rays')!;

    const bg = `radial-gradient(circle at 35% 35%, ${this._lighten(color, 40)}, ${color} 60%, ${this._darken(color, 30)})`;
    leftInner.style.background = bg; rightInner.style.background = bg;
    emojiEl.textContent = emoji;

    raysContainer.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const ray = document.createElement('div');
      ray.className = 'capsule-light-ray';
      ray.style.transform = `translate(-50%, 0) rotate(${(360 / 10) * i}deg)`;
      ray.style.background = `linear-gradient(180deg, ${color}, transparent)`;
      raysContainer.appendChild(ray);
    }

    gsap.set(leftHalf, { x: 0, rotation: 0, opacity: 1 });
    gsap.set(rightHalf, { x: 0, rotation: 0, opacity: 1 });
    gsap.set(emojiEl, { fontSize: '0px', opacity: 0, y: 0, rotation: 0 });
    gsap.set(glowRing, { opacity: 0, scale: 1, borderColor: color });
    gsap.set(label, { opacity: 0, y: 10 });
    gsap.set(raysContainer, { opacity: 0, scale: 0.5, rotation: 0 });
    overlay.classList.add('active');

    const tl = gsap.timeline();
    tl.from([leftHalf, rightHalf], { y: -60, opacity: 0, duration: 0.4, ease: 'back.out(2)' });
    tl.to([leftHalf, rightHalf], { x: 3, duration: 0.04, yoyo: true, repeat: 11, ease: 'none' }, '+=0.2');
    tl.to(glowRing, {
      opacity: 0.8, scale: 1.2, duration: 0.3,
      boxShadow: `0 0 30px ${color}, 0 0 60px ${color}80`, borderColor: color, ease: 'power2.in',
    }, '-=0.3');
    tl.add(() => { this.audio.play('crack'); navigator.vibrate?.([50, 30, 100]); });
    tl.to(leftHalf, { x: -60, rotation: -25, opacity: 0, duration: 0.5, ease: 'power3.out' });
    tl.to(rightHalf, { x: 60, rotation: 25, opacity: 0, duration: 0.5, ease: 'power3.out' }, '<');
    tl.to(emojiEl, { fontSize: '72px', opacity: 1, y: -10, duration: 0.5, ease: 'back.out(3)' }, '-=0.35');
    tl.to(raysContainer, { opacity: 1, scale: 2.5, rotation: 30, duration: 0.7, ease: 'power2.out' }, '-=0.45');
    tl.to(raysContainer, { opacity: 0, duration: 0.3 }, '-=0.15');
    tl.to(glowRing, { scale: 3, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.7');
    tl.add(() => {
      const rect = overlay.getBoundingClientRect();
      this.confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, color, 40);
    }, '-=0.3');
    tl.to(label, {
      opacity: 1, y: 0, duration: 0.3, ease: 'power2.out',
      onComplete: () => { label.textContent = 'REVEALED!'; },
    }, '-=0.1');
    tl.to(emojiEl, { y: -20, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }, '+=0.1');
    tl.add(() => { this.audio.play('fanfare'); }, '+=0.3');
    tl.add(() => {
      const flash = document.getElementById('flash-overlay')!;
      gsap.timeline().to(flash, { opacity: 0.8, duration: 0.15 }).to(flash, { opacity: 0, duration: 0.4 });
      gsap.to('#app', { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' });
    }, '+=0.2');
    tl.to(overlay, {
      opacity: 0, duration: 0.4,
      onComplete: () => {
        overlay.classList.remove('active'); overlay.style.opacity = '';
        label.textContent = 'OPENING...'; onComplete();
      },
    }, '+=0.3');
  }

  private _showResult(): void {
    this.state = 'result';
    const shop = this.selectedShop!;
    const emoji = shopEmoji(shop);
    const cuisine = shopCuisineLabel(shop);

    const logoEl = document.getElementById('result-logo') as HTMLImageElement;
    const emojiEl = document.getElementById('result-emoji')!;
    if (shop.logo) {
      logoEl.src = shop.logo; logoEl.alt = shop.title;
      logoEl.style.display = 'block'; emojiEl.style.display = 'none';
    } else {
      logoEl.style.display = 'none'; emojiEl.style.display = 'block';
      emojiEl.textContent = emoji;
    }

    const nameEl = document.getElementById('result-name')!;
    nameEl.textContent = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*';
    const target = shop.title;
    let revealed = 0;
    const scrambleInterval = setInterval(() => {
      let display = '';
      for (let i = 0; i < target.length; i++) {
        if (i < revealed) display += target[i];
        else display += chars[Math.floor(Math.random() * chars.length)];
      }
      nameEl.textContent = display;
      revealed++;
      if (revealed > target.length) { clearInterval(scrambleInterval); nameEl.textContent = target; }
    }, 30);

    document.getElementById('result-cuisine')!.textContent = cuisine;
    document.getElementById('result-location')!.innerHTML =
      `&#128205; ${shop.venue || 'Sunway Pyramid'}`;

    document.getElementById('game-screen')!.classList.remove('active');
    const resultScreen = document.getElementById('result-screen')!;
    resultScreen.classList.add('active', 'screen-enter');
    setTimeout(() => resultScreen.classList.remove('screen-enter'), 500);

    gsap.set(['.result-card', '.result-header', '.result-buttons'], { clearProps: 'all' });
    gsap.from('.result-card', { y: 80, opacity: 0, duration: 0.6, ease: 'back.out(1.5)', delay: 0.1 });

    const header = document.querySelector('.result-header')!;
    const headerText = header.textContent!;
    header.innerHTML = headerText.split('').map(ch =>
      ch === ' ' ? ' ' : `<span style="display:inline-block;opacity:0">${ch}</span>`
    ).join('');
    gsap.to(header.querySelectorAll('span'), {
      opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'back.out(2)', delay: 0.1,
    });
    gsap.from(header.querySelectorAll('span'), {
      y: -15, duration: 0.3, stagger: 0.04, ease: 'back.out(2)', delay: 0.1,
    });

    gsap.from('.result-buttons', { y: 30, opacity: 0, duration: 0.5, delay: 0.4 });
    this.confetti.start();
  }

  // ===== FULL RESET =====
  private _fullReset(): void {
    this.confetti.stop();
    this.audio._stopAmbient(); this.audio._stopMotor(); this.audio._stopTension();
    this.state = 'title'; this._lastFrameTime = 0; this._rainStart = 0;
    if (this._settleCheckTimer) clearInterval(this._settleCheckTimer);

    document.getElementById('result-screen')!.classList.remove('active');
    document.getElementById('game-screen')!.classList.remove('active');

    const title = document.getElementById('title-screen')!;
    title.style.display = ''; title.style.opacity = '';
    gsap.set(title, { opacity: 1 });
    gsap.set('#filter-wrap', { opacity: 1, y: 0 });
    gsap.set('#title-screen .neon-btn', { opacity: 1, y: 0 });
    gsap.set('#title-screen .title-capsules', { opacity: 0.4, y: 0 });
    updateFilterCount(this.allShops);
  }

  // ===== GAME LOOP =====
  private _gameLoop(timestamp?: number): void {
    if (this.state === 'title' || this.state === 'result' || this.state === 'loading') {
      this._loopRunning = false; this._lastFrameTime = 0; return;
    }
    this._loopRunning = true;
    if (!this._lastFrameTime) this._lastFrameTime = timestamp || performance.now();
    const now = timestamp || performance.now();
    let dt = (now - this._lastFrameTime) / 1000;
    this._lastFrameTime = now;
    dt = Math.min(dt, 0.05);

    if (this._rainStart) {
      const elapsed = (now - this._rainStart) / 1000;
      for (const c of this.capsules) {
        if (c.frozen && elapsed >= c.dropDelay) c.frozen = false;
      }
    }

    this._physicsTick(dt);
    for (const c of this.capsules) {
      if (c.frozen) continue;
      c.scaleX += (1 - c.scaleX) * 0.15;
      c.scaleY += (1 - c.scaleY) * 0.15;
    }
    const clawVelX = this.clawTargetX - this.clawX;
    this.chainSway += clawVelX * 0.3; this.chainSway *= 0.92;

    if (this.state === 'playing') {
      for (const c of this.capsules) {
        if (c.grabbed || c.frozen) continue;
        if (Math.abs(c.vx) < 2 && Math.abs(c.vy) < 2) {
          c.idlePhase = (c.idlePhase || 0) + dt * 3;
          c.idleOffX = Math.sin(c.idlePhase) * 0.3;
          c.idleOffY = Math.cos(c.idlePhase * 1.3) * 0.2;
        } else { c.idleOffX = 0; c.idleOffY = 0; }
      }
    }

    if (this.state === 'playing' && this.shuffleIntensity > 0) {
      this.shuffleTimer += dt;
      if (this.shuffleTimer > 1.5) {
        this.shuffleTimer = 0;
        const idx = Math.floor(Math.random() * this.capsules.length);
        const c = this.capsules[idx];
        if (!c.grabbed) {
          c.vy = -30 * this.shuffleIntensity;
          c.vx = (Math.random() - 0.5) * 20 * this.shuffleIntensity;
        }
      }
    }

    if (this.state === 'playing') {
      const clawMargin = 85;
      const clampedTarget = Math.max(this.machineLeft + clawMargin, Math.min(this.machineRight - clawMargin, this.clawTargetX));
      this.clawX += (clampedTarget - this.clawX) * 0.12;
      if (this.audio.ctx) this.audio._ambientHum();
    }

    this._draw();
    requestAnimationFrame((t) => this._gameLoop(t));
  }

  // ===== RENDER =====
  private _draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Flat background — no gradients, no spotlights
    ctx.fillStyle = this.theme.css.bg;
    ctx.fillRect(0, 0, this.W, this.H);

    // Simple floor — flat color, thin line
    ctx.fillStyle = this.theme.canvas.floorTop;
    ctx.fillRect(0, this.floorY, this.W, this.H - this.floorY);
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(this.machineLeft, this.floorY);
    ctx.lineTo(this.machineRight, this.floorY); ctx.stroke();

    // Simple rail — thin line, no dots
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(this.machineLeft, this.railY);
    ctx.lineTo(this.machineRight, this.railY); ctx.stroke();

    // Capsules
    for (const c of this.capsules) {
      if (c.frozen) continue;
      this._drawCapsule(ctx, c);
    }

    // Simple claw shadow — small, subtle
    const shadowAlpha = Math.max(0, 0.08 * (1 - this.clawY / this.floorY));
    if (shadowAlpha > 0.005) {
      ctx.save(); ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(this.clawX, this.floorY - 2, 40, 5, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
    }

    this._drawChain(ctx);
    this._drawClaw(ctx);
  }

  private _drawCapsule(ctx: CanvasRenderingContext2D, c: Capsule): void {
    const r = c.r;
    ctx.save();
    const drawX = c.x + (c.idleOffX || 0);
    const drawY = c.y + (c.idleOffY || 0);
    ctx.translate(drawX, drawY);
    ctx.scale(c.scaleX || 1, c.scaleY || 1);

    // Simple drop shadow — no glow
    const distToFloor = this.floorY - c.y;
    if (distToFloor > 0 && distToFloor < this.H) {
      const sa = Math.max(0, 0.12 * (1 - distToFloor / (this.H * 0.8)));
      ctx.save();
      ctx.scale(1 / (c.scaleX || 1), 1 / (c.scaleY || 1));
      ctx.fillStyle = `rgba(0,0,0,${sa})`;
      ctx.beginPath(); ctx.ellipse(0, distToFloor - 2, r * 0.7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Flat fill — no gradient, no glow
    ctx.fillStyle = c.color;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

    // Thin dark outline
    ctx.strokeStyle = this._darken(c.color, 40);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

    // Simple highlight dot — illustrated style
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.25, r * 0.18, 0, Math.PI * 2); ctx.fill();

    // Fork & knife icon
    const s = r * 0.32;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineCap = 'round'; ctx.lineWidth = s * 0.25;
    ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.9); ctx.lineTo(-s * 0.5, s * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.75, -s * 0.9); ctx.lineTo(-s * 0.75, -s * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.25, -s * 0.9); ctx.lineTo(-s * 0.25, -s * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.8, -s * 0.2); ctx.lineTo(-s * 0.2, -s * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 0.5, -s * 0.9);
    ctx.quadraticCurveTo(s * 0.9, 0, s * 0.5, s * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 0.5, -s * 0.9); ctx.lineTo(s * 0.5, s * 0.9); ctx.stroke();

    ctx.restore();
  }

  private _drawChain(ctx: CanvasRenderingContext2D): void {
    const startX = this.clawX, startY = this.railY, endY = this.clawY - 18;
    const sway = this.chainSway * 0.08;

    // Rope/string — dashed line for a twine feel
    ctx.strokeStyle = '#A08868';
    ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(startX, startY);
    ctx.lineTo(startX + sway * 0.5, endY); ctx.stroke();
    ctx.setLineDash([]);

    // Small wooden hook at rail
    ctx.fillStyle = '#B09878';
    ctx.beginPath(); ctx.arc(startX, startY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 1;
    ctx.stroke();
  }

  private _drawClaw(ctx: CanvasRenderingContext2D): void {
    const cx = this.clawX, cy = this.clawY;
    const openAmt = this.clawOpen;
    const M = this.theme.claw;
    ctx.save(); ctx.translate(cx, cy);

    // === HOUSING — wooden block with rounded edges ===
    const hw = 70, hh = 30, hx = -hw / 2, hy = -18;
    // Wood grain body
    ctx.fillStyle = '#C4A882';
    ctx.beginPath();
    ctx.moveTo(hx + 10, hy); ctx.lineTo(hx + hw - 10, hy);
    ctx.quadraticCurveTo(hx + hw, hy, hx + hw, hy + 10);
    ctx.lineTo(hx + hw, hy + hh - 10); ctx.quadraticCurveTo(hx + hw, hy + hh, hx + hw - 10, hy + hh);
    ctx.lineTo(hx + 10, hy + hh); ctx.quadraticCurveTo(hx, hy + hh, hx, hy + hh - 10);
    ctx.lineTo(hx, hy + 10); ctx.quadraticCurveTo(hx, hy, hx + 10, hy);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 1.5; ctx.stroke();
    // Wood grain lines
    ctx.strokeStyle = 'rgba(139,115,85,0.2)'; ctx.lineWidth = 0.8;
    for (let gy = hy + 8; gy < hy + hh - 4; gy += 6) {
      ctx.beginPath(); ctx.moveTo(hx + 6, gy); ctx.lineTo(hx + hw - 6, gy); ctx.stroke();
    }
    // Small red Sunway dot in center
    ctx.fillStyle = M.accent;
    ctx.beginPath(); ctx.arc(0, hy + hh / 2, 4, 0, Math.PI * 2); ctx.fill();

    // === SHAFT — thin wooden connector ===
    const shaftTop = hy + hh;
    ctx.fillStyle = '#B09878';
    ctx.fillRect(-5, shaftTop, 10, 8);
    ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 1;
    ctx.strokeRect(-5, shaftTop, 10, 8);

    // === PIVOT — wooden hinge circle ===
    const pivotY = shaftTop + 8;
    ctx.fillStyle = '#C4A882';
    ctx.beginPath(); ctx.arc(0, pivotY, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#8B7355';
    ctx.beginPath(); ctx.arc(0, pivotY, 2.5, 0, Math.PI * 2); ctx.fill();

    // === ARMS — wooden tongs, tapered ===
    const armLen = 85;
    const startSpread = 10 + openAmt * 5;
    const bowPeak = 40 + openAmt * 22;
    const tipSpread = 28 + openAmt * 12;

    const _drawArm = (side: number) => {
      const s = side;
      const ax = s * startSpread, ay = pivotY + 3;
      const cpx = s * bowPeak, cpy = pivotY + armLen * 0.45;
      const ex = s * tipSpread, ey = pivotY + armLen;

      // Wooden arm — outline then fill, tapered
      ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 11; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(cpx, cpy, ex, ey); ctx.stroke();
      ctx.strokeStyle = '#C4A882'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(cpx, cpy, ex, ey); ctx.stroke();
      // Wood grain highlight
      ctx.strokeStyle = 'rgba(210,190,160,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ax - s * 1, ay); ctx.quadraticCurveTo(cpx - s * 1.5, cpy, ex - s * 1, ey); ctx.stroke();

      // Joint pin
      ctx.fillStyle = '#C4A882';
      ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 1; ctx.stroke();

      // === TIP — red rubber grip pad ===
      const tcx = ex, tcy = ey + 3;
      ctx.fillStyle = M.accent;
      ctx.beginPath(); ctx.ellipse(tcx, tcy, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = this._darken(M.accent, 30); ctx.lineWidth = 1.5; ctx.stroke();
      // Grip lines
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tcx - 5, tcy - 3); ctx.lineTo(tcx + 5, tcy - 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tcx - 5, tcy + 1); ctx.lineTo(tcx + 5, tcy + 1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tcx - 4, tcy + 5); ctx.lineTo(tcx + 4, tcy + 5); ctx.stroke();
    };

    _drawArm(-1);
    _drawArm(1);
    ctx.restore();
  }

  _lighten(hex: string, amt: number): string {
    return `rgb(${Math.min(255, parseInt(hex.slice(1, 3), 16) + amt)},${Math.min(255, parseInt(hex.slice(3, 5), 16) + amt)},${Math.min(255, parseInt(hex.slice(5, 7), 16) + amt)})`;
  }

  _darken(hex: string, amt: number): string {
    return `rgb(${Math.max(0, parseInt(hex.slice(1, 3), 16) - amt)},${Math.max(0, parseInt(hex.slice(3, 5), 16) - amt)},${Math.max(0, parseInt(hex.slice(5, 7), 16) - amt)})`;
  }
}
