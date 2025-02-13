'use client';

import Navbar from "./components/Navbar";
import "./globals.css";
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { Auth0Provider } from '@auth0/nextjs-auth0';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Auth0Provider>
          <body
            className={`sans-serif ${inter.className}`}
          >
            <I18nextProvider i18n={i18n}>
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
            </I18nextProvider>
          </body>
      </Auth0Provider>
    </html>
  );
}
