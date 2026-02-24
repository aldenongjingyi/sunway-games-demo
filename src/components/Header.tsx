import ThemeToggle from './ThemeToggle'

type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Header({ theme, onToggleTheme }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <img
          src="https://avatars.githubusercontent.com/u/63832361?s=72&v=4"
          alt="Map72"
          width={36}
          height={36}
          className="rounded-full shrink-0"
        />
        <span className="font-semibold text-slate-900 dark:text-white text-[17px] tracking-tight">
          Map72 Game Demo Showcase
        </span>
        <div className="flex-1" />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
