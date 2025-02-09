import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import { StockProvider } from '../context/StockContext';
import '../styles/globals.css';
import Head from "next/head";
import { Toaster } from "react-hot-toast";


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <StockProvider>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Toaster position="top-right" />
      <Component {...pageProps} />
      </StockProvider>
    </AuthProvider>
  );
}

export default MyApp;
