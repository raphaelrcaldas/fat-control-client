import AppSideBar from './components/sidebar'
import './global.css'


export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <title>1º/1º GT - FAT Control</title>
      </head>
      <body>
        <div className='flex h-screen bg-gray-50'>
          <AppSideBar />
          <main className='px-4 w-full'>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}