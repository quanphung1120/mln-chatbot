import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLN FPT Study Portal",
  description: "Marxist-Leninist reference and study portal for MLN111, MLN122, and MLN131 courses aligned with FPT University materials",
  icons: {
    icon: '/fu-logo.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full antialiased bg-background text-foreground relative">
        {/* Global paper texture noise overlay */}
        <div className="absolute inset-0 bg-pattern-noise opacity-[0.015] pointer-events-none z-50" />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <main className="relative">
              <TooltipProvider>{children}</TooltipProvider>
            </main>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
