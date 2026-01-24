import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Flux CRM',
  description: 'Modern Customer Relationship Management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
