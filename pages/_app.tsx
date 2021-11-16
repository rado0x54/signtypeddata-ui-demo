import 'tailwindcss/tailwind.css'
import { AppProps } from 'next/app'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from "@ethersproject/providers";

export default function App({ Component, pageProps }: AppProps) {

  const getLibrary = (provider) => new Web3Provider(provider)

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Component {...pageProps} />
    </Web3ReactProvider>
  )
}