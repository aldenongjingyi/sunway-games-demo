import './styles/main.css';
import { AmbientBackground } from './ambient';
import { MakanClawGame } from './game';
import { applyTheme, SUNWAY_PYRAMID_THEME } from './theme';

// Check if user wants a standalone theme — redirect
const savedTheme = localStorage.getItem('makanclaw-theme') || 'sunway-pyramid';
if (savedTheme === 'warm-arcade') window.location.href = '/arcade.html';
if (savedTheme === 'warm-arcade-2') window.location.href = '/arcade2.html';

const theme = SUNWAY_PYRAMID_THEME;

// Apply theme CSS variables
applyTheme(theme);

// Only boot ambient particles if theme uses them
if (theme.ambientColors.length > 0 && theme.ambientAlpha > 0) {
  new AmbientBackground(
    document.getElementById('ambient-bg') as HTMLCanvasElement,
    theme.ambientColors,
    theme.ambientAlpha,
  );
}

// Boot game
new MakanClawGame(theme);

// Theme switcher UI
const themeBtn = document.getElementById('theme-btn');
const dropdown = document.getElementById('theme-dropdown');
const options = document.querySelectorAll<HTMLButtonElement>('.theme-option');

// Mark current theme as active
options.forEach(opt => {
  if (opt.dataset.theme === 'sunway-pyramid') opt.classList.add('active');
});

themeBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown?.classList.toggle('open');
});

options.forEach(opt => {
  opt.addEventListener('click', () => {
    const selected = opt.dataset.theme!;
    if (selected === 'sunway-pyramid') {
      dropdown?.classList.remove('open');
      return;
    }
    localStorage.setItem('makanclaw-theme', selected);
    if (selected === 'warm-arcade') window.location.href = '/arcade.html';
    else if (selected === 'warm-arcade-2') window.location.href = '/arcade2.html';
    else window.location.reload();
  });
});

// Close dropdown on outside click
document.addEventListener('click', () => {
  dropdown?.classList.remove('open');
});
