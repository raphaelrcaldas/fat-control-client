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
          <div>
            <AppSideBar />
          </div>
          <main className='px-4 w-full mt-6'>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}