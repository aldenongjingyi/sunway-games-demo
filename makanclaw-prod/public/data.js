// data.js — shared data loading for Food Randomiser

async function loadFBShops() {
  const resp = await fetch('datas.json');
  const data = await resp.json();
  return data.locations.filter(loc =>
    loc.kind === 'SHOP' &&
    Array.isArray(loc.categories) &&
    loc.categories.includes(665)
  );
}

function pickRandom(arr, count) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
