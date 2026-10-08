import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fight Society — Jiu Jitsu & Muay Thai Academy',
  description: 'Aplicativo de gerenciamento de artes marciais, matrículas e pagamentos online.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${plusJakartaSans.variable} ${plusJakartaSans.className}`}>
      <body className={`${plusJakartaSans.className} font-sans bg-[#0a0a0d] text-zinc-100 min-h-screen antialiased selection:bg-red-600 selection:text-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
