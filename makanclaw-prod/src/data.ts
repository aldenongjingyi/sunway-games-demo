import type { Shop } from './types';

// ============================================
// DATA LOADING
// ============================================

export interface DataProvider {
  loadShops(): Promise<Shop[]>;
}

class JsonFileProvider implements DataProvider {
  constructor(private url: string) {}
  async loadShops(): Promise<Shop[]> {
    const resp = await fetch(this.url);
    const data = await resp.json();
    return data.locations.filter(
      (loc: any) =>
        loc.kind === 'SHOP' &&
        Array.isArray(loc.categories) &&
        loc.categories.includes(665)
    );
  }
}

let dataProvider: DataProvider = new JsonFileProvider('datas.json');

export function setDataProvider(provider: DataProvider): void {
  dataProvider = provider;
}

export async function loadShops(): Promise<Shop[]> {
  return dataProvider.loadShops();
}

export function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// ============================================
// CUISINE CATEGORIES
// ============================================

export const CUISINE_CATS = [
  { id: 730, name: 'LOCAL', emoji: '🍜' },
  { id: 720, name: 'CHINESE', emoji: '🥢' },
  { id: 727, name: 'JAPANESE', emoji: '🍱' },
  { id: 729, name: 'KOREAN', emoji: '🌶️' },
  { id: 737, name: 'WESTERN', emoji: '🍔' },
  { id: 725, name: 'INDIAN', emoji: '🍛' },
  { id: 734, name: 'THAI', emoji: '🌿' },
  { id: 721, name: 'DESSERT', emoji: '🍰' },
  { id: 722, name: 'DRINKS', emoji: '🥤' },
] as const;

export const CAT_LABEL_PRIORITY: [number, string][] = [
  [721, '🍰'], [722, '🥤'], [718, '🥐'], [719, '☕'],
  [727, '🍱'], [729, '🌶️'], [725, '🍛'], [720, '🥢'],
  [730, '🍜'], [734, '🌿'], [737, '🍔'], [723, '⚡'],
  [733, '🍿'], [724, '🌙'], [732, '✅'], [728, '👦'], [735, '🥗'],
];

// ============================================
// FILTER SYSTEM
// ============================================

const FILTER_GROUPS: Record<string, number[]> = {
  dietary: [724, 732, 735, 728],
  cuisine: [730, 720, 727, 729, 737, 725, 734],
  type: [721, 722, 719, 718, 723, 733],
};

export const MIN_SHOPS = 6;

export const activeFilters = new Set<number>();

export function getFilteredShops(allShops: Shop[]): Shop[] {
  if (activeFilters.size === 0) return allShops;
  const byGroup: Record<string, number[]> = {};
  for (const id of activeFilters) {
    for (const [grp, ids] of Object.entries(FILTER_GROUPS)) {
      if (ids.includes(id)) { (byGroup[grp] = byGroup[grp] || []).push(id); break; }
    }
  }
  return allShops.filter(s =>
    Object.entries(byGroup).every(([grp, ids]) => {
      if (grp === 'dietary') {
        return ids.every(id => s.categories.includes(id));
      }
      return ids.some(id => s.categories.includes(id));
    })
  );
}

export function updateFilterCount(allShops: Shop[]): void {
  const n = getFilteredShops(allShops).length;
  const el = document.getElementById('filter-count')!;
  const btn = document.getElementById('play-btn') as HTMLButtonElement;
  const tooFew = n < MIN_SHOPS;
  el.textContent = n === 0
    ? 'No restaurants match — try fewer filters'
    : tooFew
      ? `Only ${n} — need at least ${MIN_SHOPS} restaurants`
      : `${n} restaurant${n !== 1 ? 's' : ''} available`;
  el.classList.toggle('empty', n === 0 || tooFew);
  btn.disabled = tooFew;
}

export function initFilters(allShops: Shop[], onPlay: () => void): void {
  const wrap = document.getElementById('filter-wrap')!;
  wrap.style.display = 'flex';
  updateFilterCount(allShops);

  const step1 = document.getElementById('filter-step-1')!;
  const step2 = document.getElementById('filter-step-2')!;

  // Step option click — radio-button behavior (always one selected, no deselection)
  wrap.querySelectorAll<HTMLButtonElement>('.step-option[data-catid]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return; // already selected, do nothing
      const id = Number(btn.dataset.catid);
      const parent = btn.closest('.filter-step')!;
      // Deselect all siblings in this step
      parent.querySelectorAll<HTMLButtonElement>('.step-option').forEach(b => {
        b.classList.remove('active');
        const bId = Number(b.dataset.catid);
        if (bId > 0) activeFilters.delete(bId);
      });
      // Select this one
      btn.classList.add('active');
      if (id > 0) activeFilters.add(id);
      updateFilterCount(allShops);
    });
  });

  // Step circle click — navigate between steps
  step1.querySelectorAll<HTMLElement>('.step').forEach((stepEl, i) => {
    stepEl.style.cursor = 'pointer';
    stepEl.addEventListener('click', () => {
      if (i === 1 || i === 2) {
        step1.style.display = 'none';
        step2.style.display = 'flex';
      }
    });
  });
  step2.querySelectorAll<HTMLElement>('.step').forEach((stepEl, i) => {
    stepEl.style.cursor = 'pointer';
    stepEl.addEventListener('click', () => {
      if (i === 0) {
        step2.style.display = 'none';
        step1.style.display = 'flex';
      }
    });
  });

  // Kids Friendly toggle — independent on/off
  const kidsToggle = document.getElementById('kids-toggle') as HTMLButtonElement | null;
  kidsToggle?.addEventListener('click', () => {
    const id = 728;
    if (kidsToggle.classList.contains('active')) {
      kidsToggle.classList.remove('active');
      activeFilters.delete(id);
    } else {
      kidsToggle.classList.add('active');
      activeFilters.add(id);
    }
    updateFilterCount(allShops);
  });

  // NEXT step 1 → step 2
  document.getElementById('next-step-1')?.addEventListener('click', () => {
    step1.style.display = 'none';
    step2.style.display = 'flex';
  });

  // SPIN / step 2 → play
  document.getElementById('next-step-2')?.addEventListener('click', () => {
    onPlay();
  });

  // Select "Any" by default on step 1
  step1.querySelector<HTMLButtonElement>('.step-option[data-catid="0"]')?.classList.add('active');
  step2.querySelector<HTMLButtonElement>('.step-option[data-catid="0"]')?.classList.add('active');
}

// ============================================
// HELPERS
// ============================================

export function shopEmoji(shop: Shop): string {
  if (!shop.categories) return '🍽️';
  for (const [catId, em] of CAT_LABEL_PRIORITY) {
    if (shop.categories.includes(catId)) return em;
  }
  return '🍽️';
}

export function shopCuisineLabel(shop: Shop): string {
  if (!shop.categories) return 'RESTAURANT';
  const ALL_LABELS = [
    ...CUISINE_CATS,
    { id: 719, name: 'CAFÉ' },
    { id: 718, name: 'BAKERY' },
    { id: 723, name: 'FAST FOOD' },
    { id: 733, name: 'SNACK' },
  ];
  for (const c of ALL_LABELS) {
    if (shop.categories.includes(c.id)) return c.name;
  }
  return 'RESTAURANT';
}
