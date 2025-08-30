import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import VisitorTracker from '@/components/VisitorTracker'
import { Providers } from '@/components/HeroUIProvider'

export const metadata: Metadata = {
  title: 'Meduhentai - Đọc Manga Hentai Online',
  description: 'Đọc manga hentai online miễn phí với chất lượng cao, cập nhật liên tục',
  icons: {
    icon: '/medusa.ico',
    shortcut: '/medusa.ico',
    apple: '/medusa.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/medusa.ico" />
        <link rel="shortcut icon" href="/medusa.ico" />
        <link rel="apple-touch-icon" href="/medusa.ico" />
      </head>
      <body className="antialiased">
        <Providers>
          <AuthProvider>
            <VisitorTracker />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
