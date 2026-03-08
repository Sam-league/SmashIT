import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to splash — auth guard in (app)/layout.tsx will handle
  // routing to /dashboard if already authenticated
  redirect('/splash')
}
