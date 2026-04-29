export interface Shop {
  title: string;
  logo?: string;
  venue?: string;
  kind: string;
  categories: number[];
}

export interface Capsule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  shop: Shop;
  grabbed: boolean;
  frozen: boolean;
  dropDelay: number;
  scaleX: number;
  scaleY: number;
  idlePhase: number;
  idleOffX?: number;
  idleOffY?: number;
}

export type GameState =
  | 'loading'
  | 'title'
  | 'capsule-drop'
  | 'playing'
  | 'dropping'
  | 'lifting'
  | 'revealing'
  | 'result';
