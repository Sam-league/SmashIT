'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title?: string
  onBack?: () => void
  showBack?: boolean
}

export default function PageHeader({ title, onBack, showBack = true }: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) onBack()
    else router.back()
  }

  return (
    <div className="flex items-center gap-3 mb-6">
      {showBack && (
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-icon bg-surface border border-border flex items-center justify-center shadow-card text-dark"
          aria-label="Go back"
        >
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
      )}
      {title && (
        <h1 className="font-syne text-lg font-bold text-dark">{title}</h1>
      )}
    </div>
  )
}
