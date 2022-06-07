import '../styles/globals.css'

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { AppProps } from 'next/app'
import {darkTheme, lightTheme} from '../theme/shared'

function MyApp({ Component, pageProps }: AppProps) {
  return <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className
      }}
  >
      <NextUIProvider>
          <Component {...pageProps} />
      </NextUIProvider>
  </NextThemesProvider>
}

export default MyApp
