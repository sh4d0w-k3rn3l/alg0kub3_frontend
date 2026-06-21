import type { Metadata } from 'next';
import { Providers } from '@/context/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | AlgoKube',
    default: 'AlgoKube — AI Courses & Interactive Learning',
  },
  description: 'Production-grade courses for developers who learn by doing. Master AI, ML, data science, and software engineering with interactive lessons.',
  openGraph: {
    title: 'AlgoKube',
    description: 'Production-grade courses for developers who learn by doing.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");document.documentElement.classList.toggle("dark",t?t==="dark":true)}catch(e){document.documentElement.classList.add("dark")}})()`,
          }}
        />
      </head>
      <body className="bg-[#0d1117] text-[#c9d1d9] antialiased">
        <Providers>
          <div id="main-content" className="min-h-screen flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
