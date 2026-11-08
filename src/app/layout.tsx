import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Genisys: type it, your PC does it",
  description:
    "Press Alt+Space, type what you want, and Genisys does it on your Windows PC: opens apps, finds files (typos and all), searches the web.",
};

export const viewport: Viewport = {
  themeColor: "#ece8e2",
};

// Runs before paint so the saved theme (default light) shows without a flash.
const themeScript = `(function(){var d=document.documentElement,t;d.classList.add('js');try{t=localStorage.getItem('theme')}catch(e){}d.dataset.theme=t||'light'})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
