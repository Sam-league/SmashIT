interface StatCardProps {
  icon: string
  value: string | number
  label: string
  delta?: string
  dark?: boolean
}

export default function StatCard({ icon, value, label, delta, dark = false }: StatCardProps) {
  return (
    <div
      className={`flex-1 rounded-card p-3.5 border flex flex-col gap-1 shadow-card ${
        dark ? 'bg-dark border-dark' : 'bg-surface border-border'
      }`}
    >
      <span className="text-lg mb-0.5">{icon}</span>
      <div
        className={`font-syne text-[22px] font-extrabold leading-none tracking-normal ${
          dark ? 'text-accent' : 'text-dark'
        }`}
      >
        {value}
      </div>
      <div
        className={`text-[10px] font-medium uppercase tracking-[0.04em] ${
          dark ? 'text-white/40' : 'text-muted'
        }`}
      >
        {label}
      </div>
      {delta && <div className="text-[10px] font-semibold text-success">{delta}</div>}
    </div>
  )
}
