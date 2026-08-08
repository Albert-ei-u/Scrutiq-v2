import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Scrutiq | Advanced Talent Analysis Portal",
  description: "Modern administrative portal for technical talent assessment and high-fidelity screening.",
  verification: {
    google: "aK58z5-6SzDQ9MhUsvFhzu8o-9ZHgTi4sTw5S1PUhY8",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",  
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${jakarta.variable} font-jakarta antialiased text-scrutiq-muted bg-scrutiq-bg selection:bg-scrutiq-blue/20 selection:text-scrutiq-blue`}>
        <Providers>
          {children}
          <Toaster 
            richColors 
            position="top-right" 
          />

        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
    </>
  );
}
