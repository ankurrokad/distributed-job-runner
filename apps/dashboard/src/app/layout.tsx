import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Distributed Job Runner - Dashboard',
  description: 'Admin dashboard for workflow orchestration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

