import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'CLP Dashboard Builder (CDB)',
  description: 'Clinical nutrition co-pilot for Clinic Living Plus',
}

// The true shell every route shares — no header, no nav. The CDB header
// (logo + sign-out) lives in (internal)/layout.tsx, only reachable once
// logged in; the Compass sub-nav (Patients/Coaches/Picture bank/Recipe
// bank) lives one level deeper in (internal)/(compass)/layout.tsx. Public
// patient-facing pages (dashboard/[roadmapId], checklist/[checklistId])
// and /login sit outside both groups, so they render with none of this
// app's internal chrome.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, background: '#FAF9F5', color: '#1A2417', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
        {/* Google Identity + Picker — loaded once for the Drive import feature */}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <Script src="https://apis.google.com/js/api.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  )
}
