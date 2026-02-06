import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '2nd Brain',
  description: 'Knowledge base & document viewer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-bg-primary text-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
