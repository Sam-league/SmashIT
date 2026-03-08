import BottomNav from '@/components/ui/BottomNav'
import FcmProvider from '@/components/FcmProvider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh max-w-[430px] mx-auto bg-bg">
      <FcmProvider />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
