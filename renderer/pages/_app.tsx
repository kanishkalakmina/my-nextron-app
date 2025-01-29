import { AppProps } from 'next/app';
import '../styles/globals.css';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function MyApp({ Component, pageProps, router }: AppProps) {
  const isLoginPage = router.pathname === '/login';

  return (
    <AuthProvider>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Toaster position="top-right" />
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}

export default MyApp;
