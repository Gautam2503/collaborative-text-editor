import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';

// Dynamically import components with no SSR
const Chatbot = dynamic(
  () => import('./components/Chatbot'),
  { ssr: false }
);

const SpeechToText = dynamic(
  () => import('./components/SpeechToText'),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Liveblocks",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://liveblocks.io/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="https://liveblocks.io/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
      </head>
      <body className={inter.className}>
        <main className="text-base bg-background/95 text-foreground">
          {children}
          <Chatbot />
          <SpeechToText />
        </main>
      </body>
    </html>
  );
}
