import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

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
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-900 min-h-screen antialiased flex flex-col items-center justify-center p-0 sm:p-4">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
