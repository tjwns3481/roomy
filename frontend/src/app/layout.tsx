import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roomy - 디지털 숙소 안내서',
  description: '에어비앤비 호스트를 위한 디지털 숙소 안내서 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
