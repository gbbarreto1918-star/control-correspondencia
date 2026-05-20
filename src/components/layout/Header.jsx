export default function Header({ title, subtitle, actions }) {
  return (
    <header className="px-8 py-6 border-b border-white/5">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-50 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0 ml-6">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
