import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'MissionX — IoT-Enabled 3D Escape Room Platform',
  description:
    'An educational 3D escape-room platform where students solve technical engineering missions inside interactive virtual environments with IoT hardware context.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#060911] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <QueryProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
