import './globals.css'

export const metadata = {
  title: 'Flux CRM',
  description: 'Modern CRM Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
