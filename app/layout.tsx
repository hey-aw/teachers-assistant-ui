'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Navbar from "@/components/Navbar";
import "./globals.css";
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const { DISABLE_AUTH } = process.env;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <I18nextProvider i18n={i18n}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </I18nextProvider>
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {DISABLE_AUTH === 'true' ? (
          content
        ) : (
          <UserProvider>
            {content}
          </UserProvider>
        )}
      </body>
    </html>
  );
}
