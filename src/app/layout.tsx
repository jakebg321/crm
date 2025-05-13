import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import RoleSwitcher from '@/components/RoleSwitcher';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YardBase CRM',
  description: 'Landscaping business management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <RoleSwitcher />
        </Providers>
      </body>
    </html>
  );
} 