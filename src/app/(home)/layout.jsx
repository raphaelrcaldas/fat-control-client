import AppSideBar from './components/sidebar'
import './global.css'


export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <title>1º/1º GT - FAT Control</title>
      </head>
      <body>
        {
            <div className='container'>
              <AppSideBar />
              <main>
                {children}
              </main>
            </div>
        }
      </body>
    </html>
  )
}