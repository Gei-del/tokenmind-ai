/**
 * TokenMind AI - Frontend (Next.js)
 * pages/_app.js - Configuración global con Auth0Provider
 */

import { UserProvider } from '@auth0/nextjs-auth0/client';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    // UserProvider envuelve toda la app para tener acceso al usuario autenticado
    // El token se maneja de forma segura en cookies HttpOnly (no accesible desde JS)
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
